#!/usr/bin/env node
/**
 * 一键发版：月令 / dshjieqi-card
 *
 *   node scripts/release.mjs patch            0.11.2 -> 0.11.3
 *   node scripts/release.mjs minor            0.11.x -> 0.12.0
 *   node scripts/release.mjs 0.12.0           指定版本（半途失败后重跑用这个）
 *   node scripts/release.mjs 0.12.0 --dry-run 只检查，不写任何东西
 *
 * 顺序：
 *   1. 版本号写进 package.json（CHANGELOG 必须有同名小节，Release 正文从那里取）
 *   2. node --check 五个入口文件 + npm test
 *   3. 本地 commit，再用 GitHub REST API 推 main（这台机器直连 github.com 不通）
 *   4. npm publish，并等 registry 出现该版本、取发布时间
 *   5. market/index.json 顶部追加该版本（pin 到刚才的 commit），再推一次
 *   6. 打 annotated tag vX，建 Release
 *   7. jsDelivr purge（索引、package.json、README）
 *   8. 同步本机安装副本 C:/Users/An/.dsh/plugins/dshjieqi-card
 *
 * 每一步都幂等：npm 上已有该版本、远端树已一致、市场条目已是该版本、
 * tag 或 Release 已存在，都会跳过并继续，所以中途失败直接重跑即可。
 *
 * 需要：git、已登录的 npm（npm whoami）、GitHub token。
 * token 来源：环境变量 GITHUB_TOKEN，或 %LOCALAPPDATA%\Temp\ghtok。
 */
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OWNER = 'SDSAEWQ';
const REPO = 'yueling';
const BRANCH = 'main';
const SITE = 'https://github.com/' + OWNER + '/' + REPO;
const API = 'https://api.github.com/repos/' + OWNER + '/' + REPO;
const TOKEN_FILE = process.env.GITHUB_TOKEN_FILE || path.join(os.homedir(), 'AppData', 'Local', 'Temp', 'ghtok');
const INSTALL_DIR = process.env.YUELING_INSTALL_DIR || 'C:/Users/An/.dsh/plugins/dshjieqi-card';

const args = process.argv.slice(2);
const positional = [];
const flags = new Set();
let notesFile = null;
let commitMessage = null;
for (let i = 0; i < args.length; i += 1) {
  const a = args[i];
  if (a === '--notes') { notesFile = args[i + 1]; i += 1; }
  else if (a === '--message') { commitMessage = args[i + 1]; i += 1; }
  else if (a.startsWith('--')) flags.add(a);
  else positional.push(a);
}
const DRY = flags.has('--dry-run');
const SKIP = new Set(['--skip-push', '--skip-npm', '--skip-market', '--skip-tag', '--skip-release', '--skip-sync', '--skip-tests'].filter((f) => flags.has(f)));
const want = positional[0];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (step, msg) => console.log('[' + step + '] ' + msg);

function run(cmd, argv, opts = {}) {
  // npm 在 Windows 上是 npm.cmd，execFileSync 直接调会 EINVAL；走一行 shell 命令。
  const stdio = opts.quiet ? 'pipe' : 'inherit';
  const cwd = opts.cwd || ROOT;
  if (cmd === 'npm') return execSync('npm ' + argv.join(' '), { cwd, stdio, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return execFileSync(cmd, argv, { cwd, stdio, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}
function git() {
  const argv = ['-c', 'core.quotepath=false', ...arguments];
  return execFileSync('git', argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
}
const NPM = 'npm';

function readPkg() { return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); }
function writePkg(pkg) { fs.writeFileSync(path.join(ROOT, 'package.json'), JSON.stringify(pkg, null, 2) + '\n'); }

function nextVersion(current, kind) {
  if (/^\d+\.\d+\.\d+$/.test(kind || '')) return kind;
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(current || '');
  if (!m) throw new Error('package.json 里的 version 不是 semver: ' + current);
  let maj = Number(m[1]); let min = Number(m[2]); let pat = Number(m[3]);
  if (kind === 'major') { maj += 1; min = 0; pat = 0; }
  else if (kind === 'minor') { min += 1; pat = 0; }
  else if (kind === 'patch') { pat += 1; }
  else throw new Error('用法: node scripts/release.mjs <patch|minor|major|x.y.z> [--dry-run]');
  return maj + '.' + min + '.' + pat;
}

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (fs.existsSync(TOKEN_FILE)) return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
  return '';
}
let TOKEN = '';

async function api(method, p, body) {
  for (let attempt = 1; ; attempt += 1) {
    let res;
    try {
      res = await fetch(API + p, {
        method,
        headers: {
          ...(TOKEN ? { Authorization: 'token ' + TOKEN } : {}),
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'yueling-release',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) {
      if (attempt < 4) { await sleep(1200 * attempt); continue; }
      throw new Error(method + ' ' + p + ' 网络失败: ' + e.message);
    }
    const txt = await res.text();
    if (res.ok) return txt ? JSON.parse(txt) : {};
    const retryable = res.status === 429 || res.status === 502 || res.status === 503 || res.status >= 500;
    if (retryable && attempt < 4) { await sleep(1500 * attempt); continue; }
    const err = new Error(method + ' ' + p + ' -> ' + res.status + ' ' + txt.slice(0, 300));
    err.status = res.status;
    throw err;
  }
}

async function remoteState() {
  const tip = await api('GET', '/commits/' + BRANCH);
  const listed = await api('GET', '/git/trees/' + tip.commit.tree.sha + '?recursive=1');
  const files = new Map();
  for (const e of listed.tree) if (e.type === 'blob') files.set(e.path, e);
  return { tip: tip.sha, treeSha: tip.commit.tree.sha, files };
}

function localState() {
  const out = git(...['ls-files', '-s']);
  const files = new Map();
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    const tab = line.indexOf('\t');
    if (tab === -1) continue;
    const meta = line.slice(0, tab).split(' ');
    files.set(line.slice(tab + 1), { mode: meta[0], sha: meta[1] });
  }
  return files;
}

/** 把本地 HEAD 的树与远端对齐；返回这次（或已有的）release commit sha。 */
async function pushTree(message) {
  const local = localState();
  for (let round = 1; round <= 3; round += 1) {
    const remote = await remoteState();
    const writes = [];
    const deletes = [];
    for (const [p, l] of local) {
      const r = remote.files.get(p);
      if (r === undefined || r.sha !== l.sha || r.mode !== l.mode) writes.push(p);
    }
    for (const p of remote.files.keys()) if (!local.has(p)) deletes.push(p);
    if (writes.length === 0 && deletes.length === 0) return remote.tip;
    say('push', '变更 ' + writes.length + ' 个文件' + (deletes.length ? '，删除 ' + deletes.length + ' 个' : '') + (round > 1 ? '（第 ' + round + ' 次尝试）' : ''));
    if (DRY) return remote.tip;
    const entries = [];
    for (const p of writes) {
      const buf = fs.readFileSync(path.join(ROOT, p));
      const blob = await api('POST', '/git/blobs', { content: buf.toString('base64'), encoding: 'base64' });
      entries.push({ path: p, mode: local.get(p).mode, type: 'blob', sha: blob.sha });
    }
    for (const p of deletes) entries.push({ path: p, mode: '100644', type: 'blob', sha: null });
    const tree = await api('POST', '/git/trees', { base_tree: remote.treeSha, tree: entries });
    const author = {
      name: git('config', 'user.name') || 'MercurySurfer',
      email: git('config', 'user.email') || '167516015+SDSAEWQ@users.noreply.github.com',
      date: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    };
    const commit = await api('POST', '/git/commits', { message, tree: tree.sha, parents: [remote.tip], author, committer: author });
    try {
      await api('PATCH', '/git/refs/heads/' + BRANCH, { sha: commit.sha, force: false });
      return commit.sha;
    } catch (e) {
      if (e.status === 422 || e.status === 409) { await sleep(800); continue; }
      throw e;
    }
  }
  throw new Error('三次尝试都没能推上 ' + BRANCH + '，远端一直在动？');
}

function publishList() {
  const pkg = readPkg();
  const list = ['package.json', 'LICENSE', ...(pkg.files || [])];
  return [...new Set(list)];
}

function copyPublishFiles(dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const rel of publishList()) {
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) continue;
    const target = path.join(dest, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const stat = fs.statSync(src);
    if (stat.isDirectory()) fs.cpSync(src, target, { recursive: true, force: true });
    else fs.copyFileSync(src, target);
  }
}

async function registryMeta(name, version) {
  const res = await fetch('https://registry.npmjs.org/' + name + '/' + version, { headers: { accept: 'application/json' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('registry 查询 ' + name + '@' + version + ' -> ' + res.status);
  return res.json();
}
async function registryPublishedAt(name, version) {
  const res = await fetch('https://registry.npmjs.org/' + name, { headers: { accept: 'application/json' } });
  if (!res.ok) return null;
  const doc = await res.json();
  const iso = doc.time && doc.time[version];
  if (!iso) return null;
  return Math.floor(Date.parse(iso) / 1000);
}

function changelogSection(version) {
  if (notesFile) return fs.readFileSync(path.resolve(ROOT, notesFile), 'utf8').trim();
  const file = path.join(ROOT, 'CHANGELOG.md');
  if (!fs.existsSync(file)) return '';
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const re = new RegExp('^## ' + version.replace(/\./g, '\\.') + '[^\\n]*$', 'm');
  const m = re.exec(text);
  if (!m) return '';
  const rest = text.slice(m.index + m[0].length).replace(/^\n+/, '');
  const end = rest.search(/^## /m);
  return (end === -1 ? rest : rest.slice(0, end)).trim();
}

async function purgeCdn(files) {
  for (const f of files) {
    const url = 'https://purge.jsdelivr.net/gh/' + OWNER + '/' + REPO + '@' + BRANCH + '/' + f;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
      const doc = await res.json().catch(() => ({}));
      console.log('  purge ' + f + ' -> ' + (doc.status || res.status));
    } catch (e) {
      console.log('  purge ' + f + ' 失败（不影响发布）: ' + e.message);
    }
  }
}

async function main() {
  if (!want) throw new Error('用法: node scripts/release.mjs <patch|minor|major|x.y.z> [--dry-run]');
  if (!fs.existsSync(path.join(ROOT, 'package.json'))) throw new Error('不在仓库根：' + ROOT);
  TOKEN = token();
  if (!TOKEN && !DRY) throw new Error('找不到 GitHub token：设置 GITHUB_TOKEN，或放到 ' + TOKEN_FILE);

  const pkg = readPkg();
  const version = nextVersion(pkg.version, want);
  const tag = 'v' + version;
  say('1/8', '版本 ' + pkg.version + ' -> ' + version + (DRY ? '（dry-run）' : ''));

  const notes = changelogSection(version);
  if (!notes) throw new Error('CHANGELOG.md 里没有 ## ' + version + ' 小节；Release 正文要它，先补一条再跑');

  if (DRY) {
    say('2/8', '语法检查');
    for (const f of ['lib/client.js', 'lib/index.js', 'lib/astro.mjs', 'assets/jieqi/scripts/astro.mjs', 'assets/jieqi/scripts/jieqi.mjs']) {
      execFileSync(process.execPath, ['--check', path.join(ROOT, f)], { stdio: 'pipe' });
      console.log('  ok ' + f);
    }
    if (!SKIP.has('--skip-tests')) run(NPM, ['test'], { quiet: false });
    const local = localState();
    console.log('  本地跟踪文件 ' + local.size + ' 个；会写 package.json version=' + version + '，改 market/index.json，然后推 main');
    if (TOKEN) {
      try {
        const remote = await remoteState();
        let writes = 0;
        let deletes = 0;
        for (const [p, l] of local) {
          const r = remote.files.get(p);
          if (r === undefined || r.sha !== l.sha || r.mode !== l.mode) writes += 1;
        }
        for (const p of remote.files.keys()) if (!local.has(p)) deletes += 1;
        console.log('  远端 ' + BRANCH + ' 在 ' + remote.tip.slice(0, 12) + '；若现在推，会写 ' + writes + ' 个、删 ' + deletes + ' 个文件');
      } catch (e) {
        console.log('  远端检查失败（不影响 dry-run）: ' + e.message);
      }
    }
    console.log('\n[dry-run] 没有写任何文件。去掉 --dry-run 即真发版。');
    return;
  }

  writePkg({ ...pkg, version });
  say('2/8', '语法检查 + npm test');
  for (const f of ['lib/client.js', 'lib/index.js', 'lib/astro.mjs', 'assets/jieqi/scripts/astro.mjs', 'assets/jieqi/scripts/jieqi.mjs']) {
    execFileSync(process.execPath, ['--check', path.join(ROOT, f)], { stdio: 'pipe' });
    console.log('  ok ' + f);
  }
  if (!SKIP.has('--skip-tests')) run(NPM, ['test'], { quiet: false });

  say('3/8', '提交并推 main');
  const message = commitMessage || 'release ' + version;
  git('add', '-A');
  const staged = git('diff', '--cached', '--name-only');
  if (staged) git('commit', '-m', message);
  let releaseSha = git('rev-parse', 'HEAD');
  if (!SKIP.has('--skip-push')) {
    releaseSha = await pushTree(message);
    say('  ', 'main -> ' + releaseSha.slice(0, 12));
  } else {
    say('  ', '跳过推送（--skip-push），release commit 用本地 HEAD ' + releaseSha.slice(0, 12));
  }

  say('4/8', 'npm publish');
  const name = readPkg().name;
  let published = await registryMeta(name, version).catch(() => null);
  if (published) {
    say('  ', 'registry 上已有 ' + name + '@' + version + '，跳过发布');
  } else if (SKIP.has('--skip-npm')) {
    say('  ', '跳过 npm（--skip-npm）');
  } else {
    const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'yueling-npm-'));
    copyPublishFiles(stage);
    console.log('  stage ' + stage);
    run(NPM, ['publish', '--access', 'public'], { cwd: stage });
    for (let i = 0; i < 30; i += 1) {
      published = await registryMeta(name, version).catch(() => null);
      if (published) break;
      await sleep(2000);
    }
    if (!published) throw new Error('npm publish 之后 60 秒 registry 仍没有 ' + name + '@' + version);
    say('  ', '已发布 ' + name + '@' + version);
  }
  let publishTimestamp = await registryPublishedAt(name, version).catch(() => null);
  if (!publishTimestamp) publishTimestamp = Math.floor(Date.now() / 1000);

  say('5/8', 'market/index.json pin ' + tag);
  const marketPath = path.join(ROOT, 'market', 'index.json');
  let marketText = fs.readFileSync(marketPath, 'utf8');
  const marketDoc = JSON.parse(marketText);
  const plugin = (marketDoc.plugins || [])[0] || {};
  const top = (plugin.versions || [])[0];
  if (SKIP.has('--skip-market')) {
    say('  ', '跳过市场索引（--skip-market）');
  } else if (top && top.version === version && top.source && top.source.commit === releaseSha) {
    say('  ', '索引顶部已是 ' + version + ' @ ' + releaseSha.slice(0, 12) + '，跳过');
  } else {
    const entry = {
      version,
      publishTimestamp,
      source: { type: 'git', url: SITE, commit: releaseSha },
    };
    const eol = marketText.includes('\r\n') ? '\r\n' : '\n';
    const body = JSON.stringify(entry, null, 2)
      .split('\n')
      .map((line) => '        ' + line)
      .join(eol);
    const needle = '"versions": [' + eol;
    const pluginsAt = marketText.indexOf('"plugins": [');
    const at = marketText.indexOf(needle, pluginsAt === -1 ? 0 : pluginsAt);
    if (at === -1) throw new Error('market/index.json 找不到 plugins[0].versions');
    marketText = marketText.slice(0, at + needle.length) + body + ',' + eol + marketText.slice(at + needle.length);
    const parsed = JSON.parse(marketText);
    const first = ((parsed.plugins || [])[0] || {}).versions || [];
    if (first[0] === undefined || first[0].version !== version) throw new Error('market/index.json 插入后校验失败');
    fs.writeFileSync(marketPath, marketText);
    git('add', 'market/index.json');
    git('commit', '-m', 'market: pin ' + version + ' to the release commit');
    await pushTree('market: pin ' + version + ' to the release commit');
    say('  ', '已 pin ' + releaseSha.slice(0, 12));
  }

  say('6/8', 'tag ' + tag);
  if (SKIP.has('--skip-tag')) {
    say('  ', '跳过 tag（--skip-tag）');
  } else {
    let exists = false;
    try { await api('GET', '/git/ref/tags/' + tag); exists = true; } catch (e) { if (e.status !== 404) throw e; }
    if (exists) {
      say('  ', tag + ' 已存在，跳过');
    } else {
      const tagger = {
        name: git('config', 'user.name') || 'MercurySurfer',
        email: git('config', 'user.email') || '167516015+SDSAEWQ@users.noreply.github.com',
        date: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      };
      const obj = await api('POST', '/git/tags', { tag, message: 'Yueling ' + version + '\n', object: releaseSha, type: 'commit', tagger });
      await api('POST', '/git/refs', { ref: 'refs/tags/' + tag, sha: obj.sha });
      say('  ', tag + ' -> ' + releaseSha.slice(0, 12));
    }
  }

  say('7/8', 'Release');
  if (SKIP.has('--skip-release')) {
    say('  ', '跳过 Release（--skip-release）');
  } else {
    let existing = null;
    try { existing = await api('GET', '/releases/tags/' + tag); } catch (e) { if (e.status !== 404) throw e; }
    if (existing) {
      say('  ', 'Release 已存在 ' + existing.html_url);
    } else {
      const body = notes + '\n\n---\n\nnpm: https://www.npmjs.com/package/' + name + '/v/' + version + '\n安装：dsh plugin add ' + name + '\n';
      const rel = await api('POST', '/releases', { tag_name: tag, name: '🌤 月令 ' + version, body, draft: false, prerelease: false });
      say('  ', rel.html_url);
    }
  }

  say('8/8', 'jsDelivr purge + 同步本机安装副本');
  await purgeCdn(['market/index.json', 'package.json', 'README.md']);
  if (SKIP.has('--skip-sync')) {
    say('  ', '跳过本机同步（--skip-sync）');
  } else if (fs.existsSync(INSTALL_DIR)) {
    copyPublishFiles(INSTALL_DIR);
    const localHash = execFileSync('git', ['hash-object', path.join(ROOT, 'lib/client.js')], { encoding: 'utf8' }).trim();
    const installedHash = execFileSync('git', ['hash-object', path.join(INSTALL_DIR, 'lib/client.js')], { encoding: 'utf8' }).trim();
    say('  ', '已同步 ' + INSTALL_DIR + (localHash === installedHash ? '（client.js 一致）' : '（警告：client.js 不一致）'));
  } else {
    say('  ', '没有 ' + INSTALL_DIR + '，跳过');
  }

  console.log('\n' + version + ' 发完：' + SITE + '/releases/tag/' + tag);
  console.log('GitHub 源的用户靠 package.json 的 version 判更新，npm 源用户靠 npm publish —— 两件都做了。');
}

main().catch((e) => {
  console.error('\n失败: ' + e.message);
  if (e.stdout) console.error(String(e.stdout).slice(-2000));
  if (e.stderr) console.error(String(e.stderr).slice(-2000));
  process.exitCode = 1;
});
