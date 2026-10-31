window.__ModuleLoader__.load({
  id: 'dsh-jieqi',
  factory: (require) => {
    const React = require('react')

    /** Equals the package name by convention; also the module id above. */
    const NS = 'dsh-jieqi'
    /** The Host route that answers what day it is. */
    const API = '/plugins/dsh-jieqi/api/today'
    /** Set when the card was put away today, so it is not reopened by itself. */
    const DISMISS_KEY = 'dsh-jieqi.dismissed'
    /** When the card last opened by itself, per solar term. */
    const ANNOUNCED_KEY = 'dsh-jieqi.announced'
    /** The last term moment the system was already told about. */
    const NOTIFIED_KEY = 'dsh-jieqi.notified'
    /** Set once the system has been offered the chance to show notifications. */
    const PERMISSION_KEY = 'dsh-jieqi.permission-asked'
    /** Where the dot rests on the header, if it was ever slid there. */
    const DOCK_KEY = 'dsh-jieqi.dock'
    /** 'free' once the dot was dropped away from the header; empty means docked. */
    const MODE_KEY = 'dsh-jieqi.mode'
    /** A free dot's viewport point, stored as JSON { x, y }. */
    const POS_KEY = 'dsh-jieqi.pos'
    /** How near the header a dragged dot snaps back onto its rail. */
    const SNAP = 26
    /** How near a viewport edge the dot folds into a half-hidden tab. */
    const EDGE_SNAP = 26
    /** The half-hidden tab's size; half of its width sits outside the window. */
    const TAB_WIDTH = 18
    const TAB_HEIGHT = 46
    /** Which face of the card was last open, restored on the next mount. */
    const PAGE_KEY = 'dsh-jieqi.page'
    /** The last coin throw, kept per date: reopening the 卦 page shows it. */
    const CAST_KEY = 'dsh-jieqi.cast'
    /** Card width in px; kept in sync with styles.card below. */
    const CARD_WIDTH = 218
    /** Dot diameter, quiet days and the day a term changes. */
    const DOT_QUIET = 8
    const DOT_LOUD = 10
    /** Gap between the conversation header and the resting dot. */
    const TOP_GAP = 7
    /** Movement under this many px is a click, not a slide. */
    const SLIDE_THRESHOLD = 3
    /** Fade length, shared by the styles and the unmount delay. */
    const FADE_MS = 240
    /** The card swells out of its anchor, then settles; closing is quicker. */
    const OPEN_MS = 420
    const CLOSE_MS = 170
    /** A card carried by hand keeps this much of itself on screen. */
    const DRAG_MARGIN = 8
    /** A thrown card coasts this long, this far per unit of release speed. */
    const FLING_MS = 380
    const FLING_GAIN = 150
    const FLING_MAX = 170
    /** Below this release speed the card simply stops (px per millisecond). */
    const FLING_MIN = 0.55
    /** The card's height glides between pages instead of jumping. */
    const MORPH_MS = 220
    /** A hung request must not leave the dot blank: give up and ask local math. */
    const FETCH_MS = 6000
    /** How long the card stays open on its own on the day a term changes. */
    const ANNOUNCE_MS = 9000
    /** Below this viewport width the card drops to a single line. */
    const NARROW_WIDTH = 480
    /** A floor, so the single line still has room for 霜降 + 第 8 天 + ×. */
    const CARD_MIN_WIDTH = 172
    /** Set once the card has greeted this date by itself, so it greets once a day. */
    const GREET_KEY = 'dsh-jieqi.greeted'
    /** The last payload, painted before the Host answers, so no blank first frame. */
    const CACHE_KEY = 'dsh-jieqi.cache'
    /** Hover is deliberate: a short pause opens the card, a shorter one closes it. */
    const HOVER_OPEN_MS = 120
    const HOVER_CLOSE_MS = 200
    /** How long the daily, non-term greeting keeps the card open. */
    const GREET_MS = 3000

    /** The three five-day periods of any term, then its names. */
    const HOU = {
      '立春': ['东风解冻', '蛰虫始振', '鱼陟负冰'],
      '雨水': ['獭祭鱼', '候雁北', '草木萌动'],
      '惊蛰': ['桃始华', '仓庚鸣', '鹰化为鸠'],
      '春分': ['玄鸟至', '雷乃发声', '始电'],
      '清明': ['桐始华', '田鼠化为鴽', '虹始见'],
      '谷雨': ['萍始生', '鸣鸠拂其羽', '戴胜降于桑'],
      '立夏': ['蝼蝈鸣', '蚯蚓出', '王瓜生'],
      '小满': ['苦菜秀', '靡草死', '麦秋至'],
      '芒种': ['螳螂生', '鵙始鸣', '反舌无声'],
      '夏至': ['鹿角解', '蜩始鸣', '半夏生'],
      '小暑': ['温风至', '蟋蟀居壁', '鹰始鸷'],
      '大暑': ['腐草为萤', '土润溽暑', '大雨时行'],
      '立秋': ['凉风至', '白露降', '寒蝉鸣'],
      '处暑': ['鹰乃祭鸟', '天地始肃', '禾乃登'],
      '白露': ['鸿雁来', '玄鸟归', '群鸟养羞'],
      '秋分': ['雷始收声', '蛰虫坯户', '水始涸'],
      '寒露': ['鸿雁来宾', '雀入大水为蛤', '菊有黄华'],
      '霜降': ['豺乃祭兽', '草木黄落', '蛰虫咸俯'],
      '立冬': ['水始冰', '地始冻', '雉入大水为蜃'],
      '小雪': ['虹藏不见', '天气上升地气下降', '闭塞而成冬'],
      '大雪': ['鹖鴠不鸣', '虎始交', '荔挺出'],
      '冬至': ['蚯蚓结', '麋角解', '水泉动'],
      '小寒': ['雁北乡', '鹊始巢', '雉始雊'],
      '大寒': ['鸡始乳', '征鸟厉疾', '水泽腹坚'],
    }
    const HOU_NAMES = ['一候', '二候', '三候']

    /** 十二消息卦, keyed by the month branch the Host reports. */
    const GUA = {
      子: { name: '复', line: '一阳来复', lines: [1, 0, 0, 0, 0, 0] },
      丑: { name: '临', line: '二阳浸长', lines: [1, 1, 0, 0, 0, 0] },
      寅: { name: '泰', line: '三阳开泰', lines: [1, 1, 1, 0, 0, 0] },
      卯: { name: '大壮', line: '四阳壮盛', lines: [1, 1, 1, 1, 0, 0] },
      辰: { name: '夬', line: '五阳决阴', lines: [1, 1, 1, 1, 1, 0] },
      巳: { name: '乾', line: '六阳纯乾', lines: [1, 1, 1, 1, 1, 1] },
      午: { name: '姤', line: '一阴始生', lines: [0, 1, 1, 1, 1, 1] },
      未: { name: '遁', line: '二阴渐长', lines: [0, 0, 1, 1, 1, 1] },
      申: { name: '否', line: '天地不交', lines: [0, 0, 0, 1, 1, 1] },
      酉: { name: '观', line: '四阴盛长', lines: [0, 0, 0, 0, 1, 1] },
      戌: { name: '剥', line: '五阴剥阳', lines: [0, 0, 0, 0, 0, 1] },
      亥: { name: '坤', line: '六阴纯坤', lines: [0, 0, 0, 0, 0, 0] },
    }

    /** 卦辞、象辞与一句白话, for the twelve 消息卦 the card meets. */
    const GUA_SAY = {
      复: {
        no: 24, symbol: '䷗',
        ci: '复：亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。',
        xiang: '雷在地中，复；先王以至日闭关，商旅不行，后不省方。',
        gloss: '一阳初生，气机回转：宜静养收敛，等它自己长起来。',
      },
      临: {
        no: 19, symbol: '䷒',
        ci: '临：元亨，利贞。至于八月有凶。',
        xiang: '泽上有地，临；君子以教思无穷，容保民无疆。',
        gloss: '二阳渐长，以宽厚临下：多说理，少施压。',
      },
      泰: {
        no: 11, symbol: '䷊',
        ci: '泰：小往大来，吉亨。',
        xiang: '天地交，泰；后以财成天地之道，辅相天地之宜，以左右民。',
        gloss: '三阳开泰，上下气通：顺势做事，别逆着来。',
      },
      大壮: {
        no: 34, symbol: '䷡',
        ci: '大壮：利贞。',
        xiang: '雷在天上，大壮；君子以非礼弗履。',
        gloss: '四阳壮盛：力气越大越要守规矩，越礼就是折损。',
      },
      夬: {
        no: 43, symbol: '䷪',
        ci: '夬：扬于王庭，孚号有厉。告自邑，不利即戎，利有攸往。',
        xiang: '泽上于天，夬；君子以施禄及下，居德则忌。',
        gloss: '五阳决一阴：该断则断，摆到明处说，别用蛮力。',
      },
      乾: {
        no: 1, symbol: '䷀',
        ci: '乾：元亨利贞。',
        xiang: '天行健，君子以自强不息。',
        gloss: '六阳纯乾：正是用功时，但亢龙有悔，留一分余地。',
      },
      姤: {
        no: 44, symbol: '䷫',
        ci: '姤：女壮，勿用取女。',
        xiang: '天下有风，姤；后以施命诰四方。',
        gloss: '一阴初遇：小事会牵出大局，防微杜渐。',
      },
      遁: {
        no: 33, symbol: '䷠',
        ci: '遁：亨，小利贞。',
        xiang: '天下有山，遁；君子以远小人，不恶而严。',
        gloss: '二阴浸长：退一步不是输，守住底线就好。',
      },
      否: {
        no: 12, symbol: '䷋',
        ci: '否：否之匪人，不利君子贞，大往小来。',
        xiang: '天地不交，否；君子以俭德辟难，不可荣以禄。',
        gloss: '三阴闭塞：少折腾、俭省自守，等气机转回来。',
      },
      观: {
        no: 20, symbol: '䷓',
        ci: '观：盥而不荐，有孚颙若。',
        xiang: '风行地上，观；先王以省方观民设教。',
        gloss: '四阴在上：宜静观示范，不必急着说服谁。',
      },
      剥: {
        no: 23, symbol: '䷖',
        ci: '剥：不利有攸往。',
        xiang: '山附于地，剥；上以厚下安宅。',
        gloss: '五阴剥阳：不宜远行大事，把根基垫厚，静等一阳来复。',
      },
      坤: {
        no: 2, symbol: '䷁',
        ci: '坤：元亨，利牝马之贞。君子有攸往，先迷后得主，利。西南得朋，东北丧朋。安贞吉。',
        xiang: '地势坤，君子以厚德载物。',
        gloss: '纯阴承载：以顺为用，先把底盘托住，再谈进取。',
      },
    }
    /**
     * 摇卦: three coins, six throws. 背 counts 3 and 字 counts 2, so a throw
     * scores 6 老阴, 7 少阳, 8 少阴 or 9 老阳; 6 and 9 are the moving lines.
     * The coins come from crypto.getRandomValues, never from Math.random.
     */
    const TRIGRAMS = [
      { name: '乾', img: '天', glyph: '☰', bits: [1, 1, 1] },
      { name: '兑', img: '泽', glyph: '☱', bits: [1, 1, 0] },
      { name: '离', img: '火', glyph: '☲', bits: [1, 0, 1] },
      { name: '震', img: '雷', glyph: '☳', bits: [1, 0, 0] },
      { name: '巽', img: '风', glyph: '☴', bits: [0, 1, 1] },
      { name: '坎', img: '水', glyph: '☵', bits: [0, 1, 0] },
      { name: '艮', img: '山', glyph: '☶', bits: [0, 0, 1] },
      { name: '坤', img: '地', glyph: '☷', bits: [0, 0, 0] },
    ]
    /** 文王卦序: rows are the upper trigram, columns the lower, in TRIGRAMS order. */
    const KING_ORDER = [
      [1, 10, 13, 25, 44, 6, 33, 12],
      [43, 58, 49, 17, 28, 47, 31, 45],
      [14, 38, 30, 21, 50, 64, 56, 35],
      [34, 54, 55, 51, 32, 40, 62, 16],
      [9, 61, 37, 42, 57, 59, 53, 20],
      [5, 60, 63, 3, 48, 29, 39, 8],
      [26, 41, 22, 27, 18, 4, 52, 23],
      [11, 19, 36, 24, 46, 7, 15, 2],
    ]
    /** Index = 文王卦序; 0 is unused so a hexagram number reads as itself. */
    const HEX_NAMES = ['',
      '乾', '坤', '屯', '蒙', '需', '讼', '师', '比', '小畜', '履', '泰', '否', '同人', '大有', '谦', '豫',
      '随', '蛊', '临', '观', '噬嗑', '贲', '剥', '复', '无妄', '大畜', '颐', '大过', '坎', '离', '咸', '恒',
      '遁', '大壮', '晋', '明夷', '家人', '睽', '蹇', '解', '损', '益', '夬', '姤', '萃', '升', '困', '井',
      '革', '鼎', '震', '艮', '渐', '归妹', '丰', '旅', '巽', '兑', '涣', '节', '中孚', '小过', '既济', '未济',
    ]
    /** One sentence each, so a throw is read without opening anything else. */
    const HEX_SAY = ['',
      '刚健进取，自强不息——势在自己这边，但别走到亢龙有悔。',
      '以顺承事，厚德载物——先把底盘托住，再谈进取。',
      '万事开头难——先立根基，别急着扩张。',
      '蒙昧待启——诚心求教，别自作聪明。',
      '时候未到——有信而待，等雨过天晴。',
      '争讼不利——中途收手，见好就停。',
      '出师有名——有纪律有节制，才动得。',
      '亲比相辅——择善而从，来晚了就有凶。',
      '小有积蓄——密云不雨，宜蓄不宜发。',
      '履虎尾——礼数与分寸保你平安。',
      '上下气通——顺势而为，别逆着来。',
      '闭塞之时——俭省自守，等气机回转。',
      '与人同心——开门结伴，比单打独斗走得远。',
      '大有所得——盛大之时更须谦，满则招损。',
      '谦而有终——低一头，反而处处通。',
      '豫乐顺动——有备而乐，别耽于安逸。',
      '随时而动——跟对人、跟对势，别硬顶。',
      '积弊待治——该整顿就整顿，先治根。',
      '以宽临下——多说理，少施压。',
      '静观示范——先看清，再说服。',
      '咬合除梗——该断的梗阻，果断咬断。',
      '文饰有度——装点可以，别盖过实质。',
      '阴盛剥阳——不宜远行大事，把根基垫厚。',
      '一阳来复——气机回转，宜静养待长。',
      '不妄为——守正自然，别耍小聪明。',
      '大蓄待发——厚积而后动。',
      '颐养之道——管好嘴，养好身。',
      '栋梁将挠——非常之时行非常之举，但别硬撑。',
      '重险——守信涉险，一步一探。',
      '附丽光明——附正道则明，附邪僻则焚。',
      '感应相通——以诚相感，不必强求。',
      '恒久之道——守住节律，别三心二意。',
      '退避守正——退不是输，是全身。',
      '壮而守礼——力气越大越要守规矩。',
      '进而有明——光明上进，宜见大人。',
      '明入地中——韬光养晦，藏锋守拙。',
      '家道正——先齐家，后治事。',
      '睽违异趣——求同存异，小事可为。',
      '前有险阻——反身修德，绕行比硬闯好。',
      '险难已解——宜速不宜迟，别把绳子又系上。',
      '损下益上——减一分负担，增一分清明。',
      '损上益下——该投入就投入，乘势而为。',
      '决断去疑——摆到明处说，别用蛮力。',
      '一阴初遇——防微杜渐，小事牵大局。',
      '聚而成群——人气聚了，要立规矩。',
      '积小高升——一步一阶，别想一步登天。',
      '困而不失——守志待时，话少一点。',
      '井养不穷——把底子修好，人人来取。',
      '革故鼎新——时机到了才改，改要取信。',
      '鼎新养贤——稳住局面，先把人安顿好。',
      '震动惊百里——临变不乱，事后再论。',
      '止其所止——该停就停，停得住才走得远。',
      '渐进有序——慢一点，反而稳。',
      '婚嫁失序——名分不正，勿强求。',
      '丰大满盈——日中则昃，盛时思退。',
      '旅居在外——柔顺守分，别逞强。',
      '顺而入——谦逊入微，反复申命。',
      '喜悦相说——和悦可亲，但别口舌取巧。',
      '涣散待聚——化开郁结，聚拢人心。',
      '节而不过——有度则通，太苦则伤。',
      '诚信中孚——以诚感人，豚鱼可动。',
      '小有过越——小事可为，大事勿冒进。',
      '事已成——守成防败，慎在收尾。',
      '事未成——最后一步最难，谨慎收尾。',
    ]
    /** 爻位, bottom first. */
    const HEX_POS = ['初', '二', '三', '四', '五', '上']
    const YAO_NAMES = { 6: '老阴', 7: '少阳', 8: '少阴', 9: '老阳' }

    /** One fair integer below count, drawn from the platform's entropy pool. */
    function randomBelow(count) {
      const pool = window.crypto
      if (pool && pool.getRandomValues) {
        const box = new Uint8Array(1)
        // 256 is not a multiple of count: redraw rather than bend the odds.
        const limit = 256 - (256 % count)
        for (let attempt = 0; attempt < 32; attempt++) {
          pool.getRandomValues(box)
          if (box[0] < limit) return box[0] % count
        }
      }
      return Math.floor(Math.random() * count)
    }

    /** Three coins: how many land 背 decides the line. */
    function tossLine() {
      let backs = 0
      for (let coin = 0; coin < 3; coin++) backs += randomBelow(2)
      return 6 + backs
    }

    /** '背背字', for the throw as it lands. */
    function coinFace(value) {
      const backs = value - 6
      let text = ''
      for (let coin = 0; coin < 3; coin++) text += coin < backs ? '背' : '字'
      return text
    }

    /** lines: six 0/1, bottom first. */
    function hexOf(lines) {
      let lower = 0
      let upper = 0
      for (let index = 0; index < TRIGRAMS.length; index++) {
        const bits = TRIGRAMS[index].bits
        if (bits[0] === lines[0] && bits[1] === lines[1] && bits[2] === lines[2]) lower = index
        if (bits[0] === lines[3] && bits[1] === lines[4] && bits[2] === lines[5]) upper = index
      }
      return { no: KING_ORDER[upper][lower], upper: TRIGRAMS[upper], lower: TRIGRAMS[lower] }
    }

    /** 地天泰, or 乾为天 when the two trigrams agree. */
    function hexTitle(hex) {
      return hex.upper.name === hex.lower.name
        ? hex.upper.name + '为' + hex.upper.img
        : hex.upper.img + hex.lower.img + HEX_NAMES[hex.no]
    }

    /** A throw of six lines: the hexagram, its moving lines, and 之卦 if any. */
    function hexFromValues(values) {
      const lines = values.map((value) => (value % 2 === 1 ? 1 : 0))
      const moving = []
      for (let index = 0; index < values.length; index++) {
        if (values[index] === 6 || values[index] === 9) moving.push(index)
      }
      const flipped = lines.map((line, index) => (moving.indexOf(index) === -1 ? line : 1 - line))
      return {
        values: values,
        lines: lines,
        moving: moving,
        ben: hexOf(lines),
        zhi: moving.length ? hexOf(flipped) : null,
      }
    }

    function castLines() {
      const values = []
      for (let index = 0; index < 6; index++) values.push(tossLine())
      return hexFromValues(values)
    }

    function restoreDraw() {
      try {
        const saved = readStorage(CAST_KEY)
        if (!saved) return null
        const parsed = JSON.parse(saved)
        if (!parsed || !Array.isArray(parsed.values) || parsed.values.length !== 6) return null
        const values = parsed.values.map((value) => Number(value))
        if (values.some((value) => !Number.isInteger(value) || value < 6 || value > 9)) return null
        return { date: String(parsed.date || ''), values: values }
      } catch (error) {
        return null
      }
    }

    /**
     * The year page needs the other 23 terms too, so the client carries the
     * same Meeus low-precision Sun: [name, apparent longitude, month branch].
     */
    const TERM_LON = [
      ['春分', 0], ['清明', 15], ['谷雨', 30], ['立夏', 45], ['小满', 60], ['芒种', 75],
      ['夏至', 90], ['小暑', 105], ['大暑', 120], ['立秋', 135], ['处暑', 150], ['白露', 165],
      ['秋分', 180], ['寒露', 195], ['霜降', 210], ['立冬', 225], ['小雪', 240], ['大雪', 255],
      ['冬至', 270], ['小寒', 285], ['大寒', 300], ['立春', 315], ['雨水', 330], ['惊蛰', 345],
    ]
    const BRANCH_BY_TERM = {
      立春: '寅', 惊蛰: '卯', 清明: '辰', 立夏: '巳', 芒种: '午', 小暑: '未',
      立秋: '申', 白露: '酉', 寒露: '戌', 立冬: '亥', 大雪: '子', 小寒: '丑',
    }
    const STEMS = '甲乙丙丁戊己庚辛壬癸'
    const BRANCHES = '子丑寅卯辰巳午未申酉戌亥'
    const NUMERALS = '一二三四五六七八九'

    /** Soft tints only: the dot sits in a quiet corner and must never shout. */
    const TINTS = {
      zhu: { hex: '#8FBF9F', label: '竹青' },
      song: { hex: '#7FB2A6', label: '松绿' },
      jiang: { hex: '#B79BC0', label: '绛紫' },
      qiu: { hex: '#C3B778', label: '秋香' },
      zhe: { hex: '#C79A7B', label: '赭石' },
      dian: { hex: '#8FA6CC', label: '靛青' },
    }
    const TINT_KEYS = ['zhu', 'song', 'jiang', 'qiu', 'zhe', 'dian']

    /** Each term borrows one tint so the year reads as four seasons, not noise. */
    const TERM_TINT = {
      '立春': 'zhu', '雨水': 'song', '惊蛰': 'zhu', '春分': 'song', '清明': 'zhu', '谷雨': 'song',
      '立夏': 'jiang', '小满': 'qiu', '芒种': 'zhe', '夏至': 'jiang', '小暑': 'zhe', '大暑': 'jiang',
      '立秋': 'qiu', '处暑': 'zhe', '白露': 'dian', '秋分': 'qiu', '寒露': 'dian', '霜降': 'zhe',
      '立冬': 'dian', '小雪': 'dian', '大雪': 'dian', '冬至': 'jiang', '小寒': 'dian', '大寒': 'jiang',
    }

    /** 'auto' follows the term, 'brand' is the product blue, else a TINTS key. */
    const ACCENT_KEY = 'dsh-jieqi.accent'
    /** '1' while the card is pinned open. */
    const PINNED_KEY = 'dsh-jieqi.pinned'
    /** Set after the first mount ever, so the dot only introduces itself once. */
    const HINT_KEY = 'dsh-jieqi.hinted'

    const KEYFRAMES = [
      '@keyframes dsh-jieqi-ripple {',
      '  0%, 100% { box-shadow: 0 0 0 3px var(--dsw-alias-bg-layer-2, #202024), 0 0 0 0 var(--jieqi-ripple, rgba(88, 116, 255, 0.34)); }',
      '  55% { box-shadow: 0 0 0 3px var(--dsw-alias-bg-layer-2, #202024), 0 0 0 7px var(--jieqi-ripple-out, rgba(88, 116, 255, 0)); }',
      '}',
      '@keyframes dsh-jieqi-in {',
      '  from { opacity: 0; transform: translateX(7px); }',
      '  to { opacity: 1; transform: translateX(0); }',
      '}',
      // A bubble pushed through a wall: it stretches out of the edge, then
      // rounds back into a card. The anchor vars come from the card's style.
      '@keyframes dsh-jieqi-bubble {',
      '  0% { opacity: 0; border-radius: 20px; filter: blur(4px);',
      '       transform: translate3d(var(--jq-bx, 0px), var(--jq-by, -5px), 0) scale(var(--jq-sx, 0.95), var(--jq-sy, 0.9)); }',
      '  42% { opacity: 1; border-radius: 11px; filter: blur(0);',
      '       transform: translate3d(0, 0, 0) scale(1.024, 0.988); }',
      '  64% { border-radius: 13px; transform: translate3d(0, 0, 0) scale(0.994, 1.006); }',
      '  84% { transform: translate3d(0, 0, 0) scale(1.004, 0.998); }',
      '  100% { opacity: 1; border-radius: 13px; transform: none; }',
      '}',
      '@keyframes dsh-jieqi-bloom {',
      '  0% { opacity: 0.34; transform: scale(0.28); }',
      '  100% { opacity: 0; transform: scale(1.7); }',
      '}',
      '[data-dsh-jieqi-card][data-inflate="on"] {',
      '  animation: dsh-jieqi-bubble ' + OPEN_MS + 'ms cubic-bezier(0.16, 0.72, 0.3, 1) backwards;',
      '}',
      '[data-jieqi-dot]:focus-visible {',
      '  outline: 2px solid var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe)) !important;',
      '  outline-offset: 2px;',
      '}',
      '@media (prefers-reduced-motion: reduce) {',
      '  [data-jieqi-root], [data-jieqi-root] * { animation: none !important; transition: none !important; }',
      '}',
    ].join('\n')

    const h = React.createElement

    const styles = {
      wrap: { position: 'fixed', zIndex: 60, pointerEvents: 'auto' },
      dot: {
        boxSizing: 'border-box',
        borderRadius: '50%',
        background: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
        boxShadow: '0 0 0 3px var(--dsw-alias-bg-layer-2, #202024), 0 0 0 0 var(--jieqi-ripple-out, rgba(88, 116, 255, 0))',
        outline: 'none',
      },
      panel: { boxSizing: 'border-box', position: 'absolute', width: CARD_WIDTH + 'px' },
      card: {
        boxSizing: 'border-box',
        position: 'relative',
        width: CARD_WIDTH + 'px',
        padding: '10px 13px 10px',
        borderRadius: '13px',
        overflow: 'hidden',
        background: 'var(--dsw-alias-bg-layer-2, rgba(32, 32, 36, 0.96))',
        border: '1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.22))',
        boxShadow: '0 16px 36px -24px rgba(0, 0, 0, 0.55), 0 2px 6px -4px rgba(0, 0, 0, 0.2)',
        color: 'var(--dsw-alias-label-primary, inherit)',
        userSelect: 'none',
        cursor: 'pointer',
      },
      accent: {
        position: 'absolute', left: '0', right: '0', top: '0', height: '2px',
        background: 'linear-gradient(90deg, var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe)), transparent 78%)',
      },
      head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' },
      caption: {
        fontSize: '11px', lineHeight: '14px', letterSpacing: '0.04em',
        flex: '1 1 auto', minWidth: '0',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
      },
      close: {
        flex: 'none', width: '16px', height: '16px', padding: '0', margin: '0', border: 'none',
        background: 'none', cursor: 'pointer', fontSize: '14px', lineHeight: '16px',
        color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))', opacity: '0.6',
      },
      titleRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginTop: '3px' },
      term: { fontSize: '19px', lineHeight: '25px', fontWeight: '500', letterSpacing: '0.02em' },
      dayBadge: {
        flex: '1 1 auto', textAlign: 'right',
        fontSize: '11px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
      },
      dayBadgeCopied: { color: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))' },
      sub: {
        display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '1px',
        fontSize: '11px', lineHeight: '15px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
      },
      subDay: { flex: '0 1 auto', minWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      subSince: { flex: '0 0 auto', marginLeft: 'auto' },
      /** The 养生 sentence: two lines at rest, the whole thing on hover. */
      tip: {
        marginTop: '2px', fontSize: '10px', lineHeight: '14px',
        color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
        display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
        overflow: 'hidden', opacity: '0.86',
      },
      houRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '3px' },
      hou: { fontSize: '12px', lineHeight: '16px', color: 'var(--dsw-alias-label-secondary, rgba(150, 150, 160, 1))' },
      houBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '3px', flex: '1 1 auto', minWidth: '0',
        padding: '0', margin: '0', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
      },
      houChevron: { flex: 'none', fontSize: '11px', lineHeight: '16px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))' },
      back: {
        flex: 'none', padding: '0', margin: '0 1px 0 -2px', border: 'none', background: 'none', cursor: 'pointer',
        fontSize: '15px', lineHeight: '14px', color: 'var(--dsw-alias-label-secondary, rgba(150, 150, 160, 1))',
      },
      houList: { display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '7px' },
      houLine: { display: 'flex', alignItems: 'center', gap: '6px', minHeight: '17px' },
      houDot: { flex: 'none', width: '5px', height: '5px', borderRadius: '50%', background: 'transparent' },
      houLabel: { flex: 'none', fontSize: '11px', lineHeight: '16px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))' },
      houName: {
        flex: '1 1 auto', minWidth: '0', fontSize: '12px', lineHeight: '16px',
        color: 'var(--dsw-alias-label-secondary, rgba(150, 150, 160, 1))',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      },
      houTail: {
        flex: 'none', fontSize: '11px', lineHeight: '16px', opacity: '0.85',
        color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
        fontVariantNumeric: 'tabular-nums',
      },
      ask: {
        flex: 'none', padding: '0', margin: '0', border: 'none', background: 'none', cursor: 'pointer',
        fontSize: '11px', lineHeight: '16px', color: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))', opacity: '0.85',
      },
      meta: { marginTop: '4px', fontSize: '12px', lineHeight: '16px', color: 'var(--dsw-alias-label-secondary, rgba(150, 150, 160, 1))' },
      metaRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '4px', minHeight: '17px' },
      metaText: {
        flex: '1 1 auto', minWidth: '0',
        fontSize: '12px', lineHeight: '16px', color: 'var(--dsw-alias-label-secondary, rgba(150, 150, 160, 1))',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      },
      gua: { flex: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' },
      guaBars: { display: 'flex', flexDirection: 'column', gap: '1px', width: '11px' },
      guaLine: { display: 'flex', gap: '2px', height: '2px' },
      guaBar: {
        flex: '1 1 auto', height: '2px', borderRadius: '1px',
        background: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))', opacity: '0.55',
      },
      guaName: { fontSize: '11px', lineHeight: '13px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))' },
      yearIcon: {
        flex: 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '14px', height: '14px', padding: '0', margin: '0', border: 'none', background: 'none',
        cursor: 'pointer', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))', opacity: '0.62',
      },
      yearGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        columnGap: '5px', rowGap: '1px', marginTop: '6px',
      },
      yearCell: {
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '2px',
        padding: '0 3px', margin: '0', border: 'none', background: 'none', borderRadius: '4px',
        cursor: 'pointer', textAlign: 'left', minWidth: '0',
      },
      yearName: {
        flex: 'none', fontSize: '11px', lineHeight: '17px',
        color: 'var(--dsw-alias-label-secondary, rgba(150, 150, 160, 1))',
        whiteSpace: 'nowrap',
      },
      yearDate: {
        flex: '1 1 auto', textAlign: 'right',
        fontSize: '10px', lineHeight: '17px', fontVariantNumeric: 'tabular-nums',
        color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
        whiteSpace: 'nowrap',
      },
      yearFoot: { marginTop: '7px' },
      yearFootLine: {
        fontSize: '10px', lineHeight: '15px', letterSpacing: '0.01em',
        color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
      },
      yearStep: {
        flex: 'none', padding: '0 2px', margin: '0', border: 'none', background: 'none', cursor: 'pointer',
        fontSize: '11px', lineHeight: '14px',
        color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))', opacity: '0.5',
      },
      guaTop: { display: 'flex', alignItems: 'baseline', gap: '7px', marginTop: '3px' },
      guaGlyph: {
        flex: 'none', fontSize: '21px', lineHeight: '24px',
        color: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
      },
      guaBig: {
        flex: 'none', fontSize: '17px', lineHeight: '24px', fontWeight: '600',
        color: 'var(--dsw-alias-label-primary, rgba(230, 230, 235, 1))',
      },
      guaNo: { flex: 'none', fontSize: '10px', lineHeight: '24px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))' },
      guaTag: { marginLeft: 'auto', flex: 'none', fontSize: '10px', lineHeight: '24px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))' },
      guaCi: { marginTop: '6px', fontSize: '12px', lineHeight: '18px', color: 'var(--dsw-alias-label-primary, rgba(230, 230, 235, 1))' },
      guaGloss: {
        marginTop: '7px', paddingLeft: '8px',
        borderLeft: '2px solid var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
        fontSize: '12px', lineHeight: '18px', color: 'var(--dsw-alias-label-secondary, rgba(150, 150, 160, 1))',
      },
      guaXiang: { marginTop: '6px', fontSize: '11px', lineHeight: '16px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))' },
      castHead: {
        display: 'flex', alignItems: 'baseline', gap: '6px',
        marginTop: '9px', paddingTop: '8px',
        borderTop: '1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.22))',
      },
      castTitle: { flex: 'none', fontSize: '11px', lineHeight: '15px', color: 'var(--dsw-alias-label-secondary, rgba(150, 150, 160, 1))' },
      castMeta: {
        flex: '1 1 auto', minWidth: '0', textAlign: 'right',
        fontSize: '10px', lineHeight: '15px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      },
      castLines: { display: 'flex', flexDirection: 'column', gap: '1px', marginTop: '4px' },
      castLine: { display: 'flex', alignItems: 'center', gap: '6px', height: '12px' },
      castPos: {
        flex: 'none', width: '10px', textAlign: 'center',
        fontSize: '9px', lineHeight: '12px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))', opacity: '0.8',
      },
      castBars: {
        flex: 'none', display: 'flex', alignItems: 'center', gap: '4px', width: '54px', height: '3px',
        transition: 'opacity 160ms ease',
      },
      castBar: {
        flex: '1 1 auto', height: '3px', borderRadius: '1px',
        background: 'var(--dsw-alias-label-secondary, rgba(242, 243, 245, 0.72))', opacity: '0.42',
      },
      castBarMoving: {
        flex: '1 1 auto', height: '3px', borderRadius: '1px',
        background: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))', opacity: '0.95',
      },
      castYao: {
        flex: 'none', marginLeft: 'auto', width: '24px', textAlign: 'right', fontSize: '9px', lineHeight: '12px',
        color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))', opacity: '0.8',
      },
      castMark: {
        flex: 'none', width: '10px', marginLeft: '1px', textAlign: 'center', fontSize: '9px', lineHeight: '12px',
        color: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
      },
      castTop: { display: 'flex', alignItems: 'baseline', gap: '5px', marginTop: '6px' },
      castGlyph: {
        flex: 'none', fontSize: '15px', lineHeight: '18px',
        color: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
      },
      castName: {
        flex: 'none', fontSize: '14px', lineHeight: '18px', fontWeight: '600',
        color: 'var(--dsw-alias-label-primary, rgba(230, 230, 235, 1))',
      },
      castNo: { flex: 'none', fontSize: '10px', lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))' },
      castTag: { marginLeft: 'auto', flex: 'none', fontSize: '10px', lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))' },
      castForm: { marginTop: '2px', fontSize: '10px', lineHeight: '14px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))' },
      castGloss: { marginTop: '4px', fontSize: '11px', lineHeight: '16px', color: 'var(--dsw-alias-label-secondary, rgba(150, 150, 160, 1))' },
      castFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '7px' },
      castBtn: {
        flex: 'none', boxSizing: 'border-box', height: '20px', padding: '0 9px', margin: '0',
        border: '1px solid var(--dsw-alias-border-l3, rgba(140, 140, 150, 0.4))', borderRadius: '10px',
        background: 'none', cursor: 'pointer',
        fontSize: '11px', lineHeight: '18px', color: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
        transition: 'opacity 160ms ease',
      },
      castLink: {
        flex: 'none', padding: '0', margin: '0', border: 'none', background: 'none', cursor: 'pointer',
        fontSize: '10px', lineHeight: '20px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
      },
      castHint: {
        flex: '1 1 auto', minWidth: '0', textAlign: 'right',
        fontSize: '10px', lineHeight: '20px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      },
      track: {
        position: 'relative', marginTop: '9px', height: '2px', borderRadius: '2px',
        background: 'var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.22))', overflow: 'hidden',
      },
      fill: {
        height: '100%', borderRadius: '2px',
        background: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
        transition: 'width ' + FADE_MS + 'ms ease',
      },
      tick: { position: 'absolute', top: '-1px', bottom: '-1px', width: '1px', background: 'var(--dsw-alias-bg-layer-2, #202024)', opacity: '0.9' },
      iconBtn: {
        flex: 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '16px', height: '16px', padding: '0', margin: '0', border: 'none', background: 'none',
        cursor: 'pointer', alignSelf: 'center', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
        transition: 'opacity 160ms ease, color 160ms ease',
      },
      colorChip: {
        flex: 'none', boxSizing: 'border-box', width: '13px', height: '13px', padding: '0', margin: '0',
        border: '1px solid var(--dsw-alias-border-l3, rgba(140, 140, 150, 0.4))', borderRadius: '50%',
        background: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
        cursor: 'pointer', opacity: '0.85',
      },
      swatches: { display: 'flex', alignItems: 'center', gap: '7px', marginTop: '3px', height: '16px' },
      swatch: {
        flex: 'none', boxSizing: 'border-box', width: '15px', height: '15px', padding: '0', margin: '0',
        border: 'none', borderRadius: '50%', cursor: 'pointer',
      },
      narrowRow: { display: 'flex', alignItems: 'center', gap: '8px' },
      narrowTerm: { fontSize: '15px', lineHeight: '20px', fontWeight: '500', letterSpacing: '0.02em' },
      narrowDay: {
        flex: '1 1 auto', minWidth: '0', textAlign: 'right',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        fontSize: '11px', color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
      },
      toast: {
        position: 'absolute', right: '12px', bottom: '9px', fontSize: '10px', lineHeight: '14px',
        color: 'var(--dsw-alias-brand-primary, #4d6bfe)', pointerEvents: 'none',
        transition: 'opacity 160ms ease',
      },
      /** The once-only line that says the card can be held, not just tapped. */
      hint: {
        marginTop: '7px', fontSize: '10px', lineHeight: '14px', letterSpacing: '0.02em',
        color: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      },
    }

    function readStorage(key) {
      try { return window.localStorage.getItem(key) || '' } catch (error) { return '' }
    }
    function writeStorage(key, value) {
      try { window.localStorage.setItem(key, value) } catch (error) { /* preference is lost on relaunch */ }
    }

    /** Today's payload as last painted, so the card has no blank first frame. */
    function cachedToday() {
      try {
        const raw = readStorage(CACHE_KEY)
        if (!raw) return null
        const body = JSON.parse(raw)
        if (!body || !body.term || body.date !== localDate()) return null
        return body
      } catch (error) { return null }
    }
    function clamp(value, min, max) { return Math.min(Math.max(value, min), Math.max(min, max)) }
    /** A remembered free point ({x,y}) or edge tab ({side,y}); null when never moved. */
    function readPoint() {
      try {
        const value = JSON.parse(readStorage(POS_KEY))
        if (!value || typeof value.y !== 'number' || !isFinite(value.y)) return null
        if (value.side === 'left' || value.side === 'right') return { side: value.side, y: value.y }
        if (typeof value.x !== 'number' || !isFinite(value.x)) return null
        return { x: value.x, y: value.y }
      } catch (error) {
        return null
      }
    }

    /** 'YYYY-MM-DD' in the browser's own zone, for spotting a new day. */
    function localDate() {
      const now = new Date()
      const month = String(now.getMonth() + 1)
      const day = String(now.getDate())
      return now.getFullYear() + '-' + (month.length < 2 ? '0' + month : month) + '-' + (day.length < 2 ? '0' + day : day)
    }

    /** '#8FBF9F' -> 'rgba(143, 191, 159, 0.34)'. */
    function tint(hex, alpha) {
      const value = parseInt(hex.slice(1), 16)
      return 'rgba(' + ((value >> 16) & 255) + ', ' + ((value >> 8) & 255) + ', ' + (value & 255) + ', ' + alpha + ')'
    }

    /** '2026-10-23 17:40' -> '10/23 17:40'. */
    function stamp(iso) {
      const parts = String(iso).split(' ')
      const date = parts[0].split('-')
      return Number(date[1]) + '/' + Number(date[2]) + ' ' + (parts[1] || '')
    }
    /** '2026-10-30' -> '10月30日'. */
    function monthDay(iso) {
      const parts = String(iso).split('-')
      return Number(parts[1]) + '月' + Number(parts[2]) + '日'
    }
    function clock(value) { return String(value).slice(11) }
    /** Term instants are Beijing time, whatever zone this browser sits in. */
    function epoch(value) {
      const text = String(value)
      const iso = text.length > 16 ? text.replace(' ', 'T') : text.replace(' ', 'T') + ':00'
      return Date.parse(iso + '+08:00')
    }
    /** 8000000 -> '2 小时 13 分'; whole days read '3 天 7 小时'. */
    function span(ms) {
      const minutes = Math.max(0, Math.round(ms / 60000))
      if (minutes < 1) return '不到 1 分钟'
      if (minutes < 60) return minutes + ' 分钟'
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      if (days > 0) return days + ' 天 ' + (hours % 24) + ' 小时'
      return minutes % 60 > 0 ? hours + ' 小时 ' + (minutes % 60) + ' 分' : hours + ' 小时'
    }

    /** Beijing calendar day number: days since 1970-01-01, local midnight based. */
    function bjDayNumber(ms) { return Math.floor((ms + 8 * 3600000) / 86400000) }
    function dayFromKey(key) {
      const parts = key.split('-').map(Number)
      return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000)
    }
    /** 20756 -> '10/30'. */
    function shortOfDay(dayNum) {
      const iso = new Date(dayNum * 86400000).toISOString()
      return Number(iso.slice(5, 7)) + '/' + Number(iso.slice(8, 10))
    }
    function stampOfMs(ms) { return new Date(ms + 8 * 3600000).toISOString().slice(0, 16).replace('T', ' ') }

    const RAD = Math.PI / 180

    /** Apparent longitude of the Sun, the same low-precision series the Host uses. */
    function solarLongitude(jd) {
      const T = (jd - 2451545.0) / 36525
      const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
      const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
      const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(RAD * M)
        + (0.019993 - 0.000101 * T) * Math.sin(RAD * 2 * M)
        + 0.000289 * Math.sin(RAD * 3 * M)
      const omega = 125.04 - 1934.136 * T
      return (((L0 + C - 0.00569 - 0.00478 * Math.sin(RAD * omega)) % 360) + 360) % 360
    }

    function wrap180(value) {
      let d = value
      while (d > 180) d -= 360
      while (d < -180) d += 360
      return d
    }

    function bisect(lon, lo, hi) {
      let a = lo
      let b = hi
      for (let step = 0; step < 50; step += 1) {
        const mid = (a + b) / 2
        if (wrap180(solarLongitude(mid) - lon) < 0) a = mid
        else b = mid
      }
      return (a + b) / 2
    }

    /**
     * ΔT = TT − UT in seconds (Espenak–Meeus polynomials). Without it every
     * term would land about a minute early; with it the series' own few-minute
     * error is what remains.
     */
    function deltaT(ms) {
      const date = new Date(ms)
      const y = date.getUTCFullYear() + (date.getUTCMonth() + 0.5) / 12
      let t
      if (y < 1920) {
        t = y - 1900
        return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t - 0.000197 * t * t * t * t
      }
      if (y < 1941) {
        t = y - 1920
        return 21.20 + 0.84493 * t - 0.0761 * t * t + 0.0020936 * t * t * t
      }
      if (y < 1961) {
        t = y - 1950
        return 29.07 + 0.407 * t - (t * t) / 233 + (t * t * t) / 2547
      }
      if (y < 1986) {
        t = y - 1975
        return 45.45 + 1.067 * t - (t * t) / 260 - (t * t * t) / 718
      }
      if (y < 2005) {
        t = y - 2000
        return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3
          + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5
      }
      if (y < 2050) {
        t = y - 2000
        return 62.92 + 0.32217 * t + 0.005589 * t * t
      }
      t = (y - 1820) / 100
      return y < 2150 ? -20 + 32 * t * t - 0.5628 * (2150 - y) : -20 + 32 * t * t
    }

    const TERM_CACHE = {}

    /** Every term instant in one calendar year, ascending. */
    function termInstants(year) {
      if (TERM_CACHE[year]) return TERM_CACHE[year]
      const shift = deltaT(Date.UTC(year, 6, 1)) / 86400
      const start = Date.UTC(year, 0, 1) / 86400000 + 2440587.5 + shift
      const end = Date.UTC(year, 11, 31) / 86400000 + 2440587.5 + shift
      const out = []
      for (const entry of TERM_LON) {
        const lon = entry[1]
        let previous = solarLongitude(start)
        for (let jd = start + 5; jd <= end; jd += 5) {
          const current = solarLongitude(jd)
          const before = wrap180(previous - lon)
          const after = wrap180(current - lon)
          if (before <= 0 && after >= 0 && after - before < 90) {
            const found = bisect(lon, jd - 5, jd)
            out.push({ name: entry[0], at: (found - shift - 2440587.5) * 86400000 })
            break
          }
          previous = current
        }
      }
      out.sort((left, right) => left.at - right.at)
      TERM_CACHE[year] = out
      return out
    }

    function ganzhiYear(year) {
      return STEMS[((year - 4) % 10 + 10) % 10] + BRANCHES[((year - 4) % 12 + 12) % 12]
    }

    /** 0 = 甲子; day numbers count Beijing days from 1970-01-01 (JDN 2440588). */
    function dayIndex(dayNum) { return (((dayNum + 17) % 60) + 60) % 60 }

    /** The sexagenary day: 0 = 甲子. */
    function dayGanzhi(dayNum) {
      const index = dayIndex(dayNum)
      return { index: index, name: STEMS[index % 10] + BRANCHES[index % 12] }
    }

    /** 时辰: 子时 23:00-01:00; the stem follows the day (五鼠遁). */
    function hourGanzhi(ms) {
      const hours = new Date(ms + 8 * 3600000).getUTCHours()
      const index = Math.floor(((hours + 1) % 24) / 2)
      const start = index === 0 ? 23 : index * 2 - 1
      const pad = (value) => (value < 10 ? '0' + value : String(value))
      const day = dayGanzhi(bjDayNumber(ms))
      return {
        index: index,
        name: BRANCHES[index] + '时',
        full: STEMS[((day.index % 5) * 2 + index) % 10] + BRANCHES[index] + '时',
        range: pad(start) + '-' + pad((start + 2) % 24),
      }
    }

    function nextGeng(dayNum) {
      let d = dayNum
      while (dayIndex(d) % 10 !== 6) d += 1
      return d
    }

    /** 初伏 = third 庚 day from 夏至, 末伏 = first 庚 day after 立秋. */
    function fuOfYear(year) {
      const terms = termInstants(year)
      const xiazhi = terms.find((term) => term.name === '夏至')
      const liqiu = terms.find((term) => term.name === '立秋')
      if (!xiazhi || !liqiu) return null
      const gengs = []
      let d = bjDayNumber(xiazhi.at)
      while (gengs.length < 4) {
        if (dayIndex(d) % 10 === 6) gengs.push(d)
        d += 1
      }
      const initial = gengs[2]
      const middle = gengs[3]
      const last = nextGeng(bjDayNumber(liqiu.at))
      if (!(initial < middle && middle <= last)) return null
      return { initial: initial, middle: middle, last: last, days: last + 10 - initial }
    }

    function fuAt(dayNum, fu) {
      if (!fu) return null
      if (dayNum < fu.initial || dayNum > fu.last + 9) return null
      const phase = dayNum < fu.middle ? '初伏' : dayNum < fu.last ? '中伏' : '末伏'
      const start = phase === '初伏' ? fu.initial : phase === '中伏' ? fu.middle : fu.last
      return { phase: phase, day: dayNum - start + 1 }
    }

    /** 数九: nine nine-day periods counted from 冬至. */
    function jiuAt(dayNum) {
      const year = Number(new Date(dayNum * 86400000).toISOString().slice(0, 4))
      const starts = [year, year - 1]
        .map((y) => {
          const dongzhi = termInstants(y).find((term) => term.name === '冬至')
          return dongzhi ? bjDayNumber(dongzhi.at) : null
        })
        .filter((d) => d !== null && d <= dayNum)
      if (starts.length === 0) return null
      const start = Math.max.apply(null, starts)
      const diff = dayNum - start
      if (diff < 0 || diff >= 81) return null
      return { name: NUMERALS[Math.floor(diff / 9)] + '九', day: (diff % 9) + 1 }
    }

    const YEAR_CACHE = {}

    /** The whole calendar year as the table the year page draws. */
    function yearTable(year) {
      if (YEAR_CACHE[year]) return YEAR_CACHE[year]
      const terms = termInstants(year).map((term) => ({
        name: term.name,
        at: stampOfMs(term.at),
        day: bjDayNumber(term.at),
        short: shortOfDay(bjDayNumber(term.at)),
        jie: Boolean(BRANCH_BY_TERM[term.name]),
        branch: BRANCH_BY_TERM[term.name] || '',
      }))
      const fu = fuOfYear(year)
      const dongzhi = terms.find((term) => term.name === '冬至')
      const lichun = terms.find((term) => term.name === '立春')
      const table = {
        year: year,
        ganzhi: ganzhiYear(year),
        terms: terms,
        lichun: lichun ? lichun.short : '',
        fu: fu ? {
          initial: shortOfDay(fu.initial),
          middle: shortOfDay(fu.middle),
          last: shortOfDay(fu.last),
          days: fu.days,
        } : null,
        jiu: dongzhi ? dongzhi.short : '',
      }
      YEAR_CACHE[year] = table
      return table
    }

    /**
     * The same answer the Host gives, computed locally: used when the route is
     * down or slow, so the card is never missing just because the server is.
     */
    function localToday(dateKey) {
      const today = dayFromKey(dateKey)
      const year = Number(dateKey.slice(0, 4))
      const all = []
      for (const y of [year - 1, year, year + 1]) {
        for (const term of termInstants(y)) all.push({ name: term.name, at: term.at, day: bjDayNumber(term.at) })
      }
      all.sort((left, right) => left.at - right.at)
      const todays = all.find((term) => term.day === today) || null
      const next = all.find((term) => term.day > today) || null
      const current = todays || all.slice().reverse().find((term) => term.day < today)
      if (!current) return null
      const monthStart = all.slice().reverse()
        .find((term) => BRANCH_BY_TERM[term.name] && term.day <= today) || null
      const lichun = all.find((term) => term.name === '立春' && stampOfMs(term.at).slice(0, 4) === String(year))
      const gzYear = lichun && today < lichun.day ? year - 1 : year
      const branch = monthStart ? BRANCH_BY_TERM[monthStart.name] : ''
      const gua = branch ? GUA[branch] : null
      return {
        ok: true,
        date: dateKey,
        term: current.name,
        termAt: stampOfMs(current.at),
        isTermDay: Boolean(todays),
        dayInTerm: today - current.day + 1,
        next: next ? { name: next.name, at: stampOfMs(next.at), days: next.day - today } : null,
        ganzhi: {
          year: ganzhiYear(gzYear),
          monthBranch: branch,
          monthStart: monthStart ? monthStart.name : '',
          day: dayGanzhi(today),
          hour: hourGanzhi(Date.now()),
        },
        hexagram: gua ? {
          name: gua.name,
          symbol: (GUA_SAY[gua.name] || {}).symbol || '',
          line: gua.line,
          lines: gua.lines,
        } : null,
        fu: fuAt(today, fuOfYear(year)),
        jiu: jiuAt(today),
      }
    }
    /** '二候 · 草木黄落'. */
    function houOf(info) {
      const names = HOU[info.term]
      if (!names) return ''
      const total = Math.max(1, (info.dayInTerm - 1) + (info.next ? info.next.days : 15))
      const step = Math.min(2, Math.floor(((info.dayInTerm - 1) / total) * 3))
      return HOU_NAMES[step] + ' · ' + names[step]
    }

    /** The three 候 as real thirds of the term's span, for the detail page. */
    function houDetail(info) {
      const names = HOU[info.term]
      if (!names) return null
      const start = epoch(info.termAt)
      const finish = info.next ? epoch(info.next.at) : start + 15 * 86400000
      const span = finish - start
      if (!(span > 0)) return null
      const bounds = [start, start + span / 3, start + (span * 2) / 3, finish]
      const now = Date.now()
      const index = now >= bounds[2] ? 2 : now >= bounds[1] ? 1 : 0
      const shortDay = (ms) => {
        const at = new Date(ms)
        return (at.getMonth() + 1) + '/' + at.getDate()
      }
      const marks = names.map((name, step) => {
        let tail = shortDay(bounds[step])
        if (step < index) {
          tail = '已过'
        } else if (step === index) {
          // Count from the later of now and the 候's own start, so the first
          // morning of a term does not read "还剩 6 天".
          const left = bounds[step + 1] - Math.max(now, bounds[step])
          tail = left < 86400000
            ? '还剩 ' + Math.max(1, Math.round(left / 3600000)) + ' 小时'
            : '还剩 ' + Math.max(1, Math.ceil(left / 86400000)) + ' 天'
        }
        return { label: HOU_NAMES[step], name: name, tail: tail }
      })
      return { index: index, marks: marks }
    }

    /** The conversation column, measured from the header that anchors it. */
    function column() {
      const leading = document.querySelector('[data-conversation-header-leading]')
      const header = leading ? leading.parentElement : null
      if (header) {
        const rect = header.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          return { top: rect.bottom + TOP_GAP, left: rect.left, right: rect.right }
        }
      }
      return { top: 56, left: 0, right: window.innerWidth }
    }

    function copyText(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {})
          return true
        }
      } catch (error) { /* fall through */ }
      return false
    }

    /** The composer is a rich-text editor, so a paste is the least surprising way in. */
    function composerEditor() {
      const card = document.querySelector('[data-composer-card]')
      return card ? card.querySelector('[contenteditable="true"]') : null
    }

    function pasteInto(editor, text) {
      try {
        editor.focus()
        const data = new DataTransfer()
        data.setData('text/plain', text)
        const event = new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true })
        editor.dispatchEvent(event)
        return true
      } catch (error) {
        return false
      }
    }

    function editorText(editor) {
      try {
        return editor.innerText || editor.textContent || ''
      } catch (error) {
        return ''
      }
    }

    function notify(title, body, onOpen) {
      try {
        if (typeof Notification === 'undefined') return 'unsupported'
        if (Notification.permission === 'granted') {
          const note = new Notification(title, { body: body })
          // Clicking the toast should land somewhere: focus the window and
          // unfold the card on the term it just announced.
          if (onOpen) {
            note.onclick = () => {
              try { window.focus() } catch (error) { /* the card still opens */ }
              try { note.close() } catch (error) { /* older browser */ }
              onOpen()
            }
          }
          return 'shown'
        }
        if (Notification.permission === 'default') return 'ask'
        return 'denied'
      } catch (error) {
        return 'unsupported'
      }
    }

    function JieqiCard() {
      /** The payload painted before the Host answers, when today's is on hand. */
      const [info, setInfo] = React.useState(() => cachedToday())
      const [shape, setShape] = React.useState(null)
      const [shown, setShown] = React.useState(() => Boolean(cachedToday()))
      const [hover, setHover] = React.useState(false)
      const [pinned, setPinned] = React.useState(() => readStorage(PINNED_KEY) === '1')
      const [auto, setAuto] = React.useState(false)
      const [suppressed, setSuppressed] = React.useState(false)
      const [sliding, setSliding] = React.useState(false)
      /** While a card is carried by hand: its viewport rect, not the dot point. */
      const [cardDrag, setCardDrag] = React.useState(null)
      /** True while a drag is close enough to the header to land back on it. */
      const [snapping, setSnapping] = React.useState(false)
      const [toast, setToast] = React.useState('')
      /** A copy landed: the badge beside the term says so, where the eye is. */
      const [copied, setCopied] = React.useState(false)
      const [accent, setAccent] = React.useState(() => readStorage(ACCENT_KEY) || 'auto')
      const [picking, setPicking] = React.useState(false)
      /** 'main' | 'hou' | 'year' | 'gua' — the card's four faces. */
      const [page, setPage] = React.useState(() => {
        const saved = readStorage(PAGE_KEY)
        return saved === 'hou' || saved === 'year' || saved === 'gua' ? saved : 'main'
      })
      /** The throw on this date, so the 卦 page survives a reopen. */
      const [draw, setDraw] = React.useState(() => restoreDraw())
      /** How many of the six lines have landed; 6 means the throw is settled. */
      const [upto, setUpto] = React.useState(draw ? 6 : 0)
      const castTimer = React.useRef(null)
      /** 0 follows today; any other value is a year browsed in the sheet. */
      const [viewYear, setViewYear] = React.useState(0)
      /** A term picked from that sheet, to read its exact moment. */
      const [yearPick, setYearPick] = React.useState('')
      /** Nudged every minute while that page is open, so its countdown moves. */
      const [drip, setDrip] = React.useState(0)
      /** Bumped to refetch when the date rolls over under a window left open. */
      const [tick, setTick] = React.useState(0)
      const [viewport, setViewport] = React.useState(() => window.innerWidth)
      const slide = React.useRef(null)
      const timers = React.useRef([])
      const loadedDate = React.useRef('')
      /** False after the first payload, so a rollover can start at the front page. */
      const firstLoad = React.useRef(true)
      /** The card element, measured when a page swap changes its height. */
      const cardNode = React.useRef(null)
      /** The page swap in flight: the height it came from and the one it grows into. */
      const [morph, setMorph] = React.useState(null)
      const lastH = React.useRef(0)
      const morphPage = React.useRef(page)
      /** Pending timer for a card still coasting after a throw. */
      const fling = React.useRef(null)
      /** The two nodes a carry paints directly, and the offset it last wrote. */
      const panelNode = React.useRef(null)
      const dotNode = React.useRef(null)
      const live = React.useRef({ x: 0, y: 0 })
      /** True only on the visit that meets the dot for the first time. */
      const [hint] = React.useState(() => readStorage(HINT_KEY) !== '1')
      const calm = React.useMemo(() => {
        try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch (error) { return false }
      }, [])

      // A throw still landing must not keep ticking after the card is gone.
      React.useEffect(() => () => {
        if (castTimer.current) window.clearTimeout(castTimer.current)
      }, [])

      // One page unrolls into the next: keep the height the card had, then ride
      // to the height its new face needs instead of swapping under the cursor.
      React.useLayoutEffect(() => {
        const node = cardNode.current
        if (!node) return
        // A hidden card measures zero; remembering that would lose the height
        // the next page has to ride from.
        if (!open) return
        if (morph) { morphPage.current = page; return }
        const height = node.offsetHeight
        if (page !== morphPage.current) {
          morphPage.current = page
          if (lastH.current > 0 && Math.abs(lastH.current - height) > 3 && !calm) {
            setMorph({ from: lastH.current, to: height, phase: 'from' })
            return
          }
        }
        lastH.current = height
      })

      React.useLayoutEffect(() => {
        if (!morph || morph.phase !== 'from') return undefined
        // Two frames, so the old height is painted before the ride begins.
        const id = window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setMorph((current) => (current && current.phase === 'from'
              ? Object.assign({}, current, { phase: 'to' })
              : current))
          })
        })
        return () => window.cancelAnimationFrame(id)
      }, [morph])

      React.useEffect(() => {
        if (!morph || morph.phase !== 'to') return undefined
        const id = window.setTimeout(() => setMorph(null), MORPH_MS + 40)
        return () => window.clearTimeout(id)
      }, [morph])

      React.useEffect(() => {
        if (!hint) return undefined
        writeStorage(HINT_KEY, '1')
        return undefined
      }, [hint])

      const dockX = (x) => clamp(x, 12, window.innerWidth - 12)
      const freePoint = (x, y) => ({ x: dockX(x), y: clamp(y, 12, window.innerHeight - 12) })

      /** Put the dot back on the header at x; right-click uses the middle. */
      const place = (x) => {
        setShape((current) => (current ? Object.assign({}, current, { mode: 'docked', dock: dockX(x) }) : current))
      }

      /** Right-click or double-click: back to the middle of the header, forgetting the rest. */
      const resetDot = () => {
        const middle = Math.round(window.innerWidth / 2)
        place(middle)
        writeStorage(DOCK_KEY, String(middle))
        writeStorage(MODE_KEY, '')
        writeStorage(POS_KEY, '')
        flash('已回到中间')
      }

      const flash = (message) => {
        setToast(message)
        if (timers.current.length > 20) timers.current = []
        timers.current.push(window.setTimeout(() => setToast(''), 1800))
      }

      /** Copy feedback sits under the title; the footer toast is too far away. */
      const markCopied = () => {
        if (timers.current.length > 20) timers.current = []
        setCopied(true)
        timers.current.push(window.setTimeout(() => setCopied(false), 1300))
      }

      /** Whether the card is showing right now; shared by the render and Alt+J. */
      // A card being carried stays open even when the pointer has left the dot.
      const open = pinned || auto || (hover && !suppressed) || !!cardDrag

      /** Unfold when this window has focus; otherwise let the system say it. */
      const tellTerm = (headline, detail) => {
        let focused = false
        try { focused = typeof document.hasFocus === 'function' && document.hasFocus() } catch (error) { focused = false }
        const unfold = () => {
          setPage('main')
          setAuto(true)
          timers.current.push(window.setTimeout(() => setAuto(false), ANNOUNCE_MS))
        }
        if (!focused) {
          notify(headline, detail, unfold)
          return
        }
        unfold()
      }

      // A pointer merely crossing the dot should not pop the card open: a short
      // dwell opens it, and the same grace keeps it open on the way in.
      const hoverTimer = React.useRef(0)
      const hovering = React.useRef(false)
      const onEnter = () => {
        hovering.current = true
        if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
        hoverTimer.current = window.setTimeout(() => {
          hoverTimer.current = 0
          if (hovering.current) setHover(true)
        }, HOVER_OPEN_MS)
      }
      const onLeave = () => {
        hovering.current = false
        if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
        hoverTimer.current = window.setTimeout(() => {
          hoverTimer.current = 0
          if (hovering.current) return
          setHover(false)
          setSuppressed(false)
          setPicking(false)
        }, HOVER_CLOSE_MS)
      }
      React.useEffect(() => () => {
        if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
      }, [])

      const maybeAskPermission = () => {
        try {
          if (typeof Notification === 'undefined' || Notification.permission !== 'default') return
          if (readStorage(PERMISSION_KEY) === '1') return
          writeStorage(PERMISSION_KEY, '1')
          Notification.requestPermission().catch(() => {})
        } catch (error) { /* the dot still works without notifications */ }
      }

      React.useEffect(() => {
        let alive = true
        const mine = timers.current

        /** One payload, whether it came from the Host, a retry, or local math. */
        const accept = (body) => {
          if (!alive) return
          const box = column()
          loadedDate.current = body.date
          setInfo(body)
          try { writeStorage(CACHE_KEY, JSON.stringify(body)) } catch (error) { /* cache is optional */ }
          // A rollover starts at the front page; a fresh mount keeps the last face.
          if (!firstLoad.current) setPage('main')
          firstLoad.current = false
          setViewYear(0)
          setYearPick('')
          // A rollover refetch must not drag the dot back to where it started.
          setShape((current) => {
            if (current) {
              const base = Object.assign({}, current, { top: box.top })
              if (current.mode === 'free') {
                const point = freePoint(current.x, current.y)
                return Object.assign(base, { x: point.x, y: point.y })
              }
              return Object.assign(base, { dock: dockX(current.dock) })
            }
            const saved = Number(readStorage(DOCK_KEY))
            const start = Number.isFinite(saved) && saved > 0 ? saved : window.innerWidth / 2
            const base = {
              mode: 'docked',
              top: box.top,
              dock: dockX(start),
              x: dockX(start),
              y: box.top + DOT_QUIET / 2,
            }
            const stored = readPoint()
            const savedMode = readStorage(MODE_KEY)
            if (savedMode === 'edge' && stored && stored.side) {
              const y = clamp(stored.y, TAB_HEIGHT / 2 + 4, window.innerHeight - TAB_HEIGHT / 2 - 4)
              return Object.assign(base, { mode: 'edge', side: stored.side, y: y })
            }
            if (savedMode !== 'free' || !stored || typeof stored.x !== 'number') return base
            const point = freePoint(stored.x, stored.y)
            return Object.assign(base, { mode: 'free', x: point.x, y: point.y })
          })

          // On the day a term changes, the card introduces itself once; the
          // rest of the year the dot simply waits to be found.
          const today = readStorage(DISMISS_KEY) === body.date
          const announced = readStorage(ANNOUNCED_KEY) === body.termAt
          const at = epoch(body.termAt)
          const lead = at - 60 * 60 * 1000
          const soon = body.isTermDay && Date.now() >= lead
          if (soon && !today && !announced) {
            writeStorage(ANNOUNCED_KEY, body.termAt)
            setPage('main')
            setAuto(true)
            mine.push(window.setTimeout(() => setAuto(false), ANNOUNCE_MS))
          } else if (body.isTermDay && !today && !announced && Date.now() < lead) {
            // Opened hours before the term? Keep the promise and unfold at T-1h.
            mine.push(window.setTimeout(() => {
              writeStorage(ANNOUNCED_KEY, body.termAt)
              setPage('main')
              setAuto(true)
              mine.push(window.setTimeout(() => setAuto(false), ANNOUNCE_MS))
            }, lead - Date.now()))
          }

          // An ordinary day still gets one quiet greeting: the card unfolds for
          // a few seconds on the first open of the date and then folds away.
          const greeted = readStorage(GREET_KEY) === body.date
          const face = readStorage(PAGE_KEY)
          const restingFace = !face || face === 'main'
          if (!body.isTermDay && !today && !greeted && restingFace && readStorage(PINNED_KEY) !== '1') {
            mine.push(window.setTimeout(() => {
              if (!alive) return
              if (document.visibilityState === 'hidden') return
              if (readStorage(GREET_KEY) === body.date) return
              writeStorage(GREET_KEY, body.date)
              setAuto(true)
              mine.push(window.setTimeout(() => setAuto(false), GREET_MS))
            }, 1500))
          }

          // A term fires at a known minute: unfold if this window is being
          // looked at, otherwise let the system tell it.
          const headline = body.term + ' ' + clock(body.termAt) + ' 交节'
          const detail = houOf(body) + '，第 1 天'
          const told = readStorage(NOTIFIED_KEY) === body.termAt
          const wait = at - Date.now()
          // Up to a full term away: a page left open in the morning still
          // gets told at the instant, so no 12-hour horizon here.
          if (!told && wait > 0 && wait < 26 * 60 * 60 * 1000) {
            mine.push(window.setTimeout(() => {
              writeStorage(NOTIFIED_KEY, body.termAt)
              tellTerm(headline, detail)
            }, wait))
          } else if (!told && wait <= 0 && body.isTermDay) {
            writeStorage(NOTIFIED_KEY, body.termAt)
            tellTerm(headline, detail)
          }

          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => { if (alive) setShown(true) })
          })
        }

        const load = (attempt) => {
          let stop = null
          try { stop = new AbortController() } catch (error) { stop = null }
          let guard = 0
          if (stop) {
            guard = window.setTimeout(() => {
              try { stop.abort() } catch (error) { /* already gone */ }
            }, FETCH_MS)
          }
          const settle = () => {
            if (guard) { window.clearTimeout(guard); guard = 0 }
          }
          fetch(API, Object.assign({ headers: { accept: 'application/json' } }, stop ? { signal: stop.signal } : null))
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error('http ' + response.status))))
            .then((body) => {
              settle()
              if (!alive) return
              if (!body || body.ok !== true) throw new Error('bad payload')
              accept(body)
            })
            .catch(() => {
              settle()
              if (!alive) return
              if (attempt < 2) {
                // Two silent retries with a widening gap, then local astronomy.
                mine.push(window.setTimeout(() => { if (alive) load(attempt + 1) }, attempt === 0 ? 900 : 3200))
                return
              }
              try {
                const local = localToday(localDate())
                if (local) { accept(local); return }
              } catch (error) { /* the dot keeps its last face */ }
              // Nothing local either: look again in a minute rather than stay dark.
              mine.push(window.setTimeout(() => { if (alive) load(2) }, 60 * 1000))
            })
        }
        load(0)
        return () => {
          alive = false
          for (const id of mine) window.clearTimeout(id)
        }
      }, [tick])

      // Remember the face that was last open, so reopening lands there.
      React.useEffect(() => {
        writeStorage(PAGE_KEY, page)
      }, [page])

      // A window left open over midnight must greet the new day by itself: the
      // date, the term and the countdown all change without a reload.
      React.useEffect(() => {
        const check = () => {
          if (!loadedDate.current || loadedDate.current === localDate()) return
          setTick((value) => value + 1)
        }
        const id = window.setInterval(check, 60 * 1000)
        const onVisible = () => { if (document.visibilityState === 'visible') check() }
        document.addEventListener('visibilitychange', onVisible)
        window.addEventListener('focus', check)
        check()
        return () => {
          window.clearInterval(id)
          document.removeEventListener('visibilitychange', onVisible)
          window.removeEventListener('focus', check)
        }
      }, [])

      // A narrow window gets a single line instead of a card that fills half
      // the screen; the palette and the 候 are the first things to go.
      React.useEffect(() => {
        const onResize = () => {
          setViewport(window.innerWidth)
          // A window that shrinks past the dot brings it back with it.
          setShape((current) => {
            if (!current) return current
            const base = Object.assign({}, current, { dock: dockX(current.dock) })
            if (current.mode === 'edge') {
              // A shorter window must pull the tab back even though its x is fixed.
              return Object.assign(base, { y: clamp(current.y, TAB_HEIGHT / 2 + 4, window.innerHeight - TAB_HEIGHT / 2 - 4) })
            }
            if (current.mode !== 'free') return base
            const point = freePoint(current.x, current.y)
            return Object.assign(base, { x: point.x, y: point.y })
          })
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
      }, [])

      // Alt+J opens and closes the card without hunting for the dot.
      React.useEffect(() => {
        const onKey = (event) => {
          if (event.key === 'Escape') {
            if (page !== 'main') {
              event.preventDefault()
              setPage('main')
              setYearPick('')
              return
            }
            // On the front page Esc means "put it away", not "nothing happens".
            if (pinned || auto || (hover && !suppressed)) {
              event.preventDefault()
              writeStorage(PINNED_KEY, '')
              setPinned(false)
              setAuto(false)
              setHover(false)
              setSuppressed(true)
              return
            }
          }
          if (!event.altKey || event.repeat || event.ctrlKey || event.metaKey) return
          if (String(event.key || '').toLowerCase() !== 'j') return
          event.preventDefault()
          if (pinned || auto || (hover && !suppressed)) {
            writeStorage(PINNED_KEY, '')
            setPinned(false)
            setAuto(false)
            setSuppressed(true)
            return
          }
          setPinned(true)
          setAuto(false)
          setSuppressed(false)
          writeStorage(PINNED_KEY, '1')
          maybeAskPermission()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [pinned, auto, hover, suppressed, page])

      // An open card counts down in place; one re-render a minute is enough.
      React.useEffect(() => {
        if (!open) return undefined
        const timer = window.setInterval(() => setDrip((value) => (value + 1) % 600), 60000)
        return () => window.clearInterval(timer)
      }, [open, page])

      // Follow the column while the window resizes, keeping the dot on screen.
      React.useEffect(() => {
        if (!shape) return undefined
        const onResize = () => {
          const box = column()
          setShape((current) => {
            if (!current) return current
            const base = Object.assign({}, current, { top: box.top, dock: dockX(current.dock) })
            if (current.mode !== 'free') return base
            const point = freePoint(current.x, current.y)
            return Object.assign(base, { x: point.x, y: point.y })
          })
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
      }, [shape !== null])

      // A sidebar changes the header without resizing the window; follow it and
      // leave the dot's x alone, so it stays where it was dragged.
      React.useEffect(() => {
        if (!shape || typeof ResizeObserver === 'undefined') return undefined
        const leading = document.querySelector('[data-conversation-header-leading]')
        const header = leading ? leading.parentElement : null
        if (!header) return undefined
        let frame = 0
        const settle = () => {
          if (frame) return
          frame = window.requestAnimationFrame(() => {
            frame = 0
            const box = column()
            setShape((current) => {
              if (!current) return current
              const base = Object.assign({}, current, { top: box.top })
              if (current.mode !== 'free') return Object.assign(base, { dock: dockX(current.dock) })
              const point = freePoint(current.x, current.y)
              return Object.assign(base, { x: point.x, y: point.y })
            })
          })
        }
        const observer = new ResizeObserver(settle)
        observer.observe(header)
        return () => {
          if (frame) window.cancelAnimationFrame(frame)
          observer.disconnect()
        }
      }, [shape !== null])

      if (!info || !shape) return null

      const quiet = !info.isTermDay
      const size = quiet ? DOT_QUIET : DOT_LOUD
      const compact = viewport < NARROW_WIDTH
      const cardWidth = compact ? Math.max(CARD_MIN_WIDTH, viewport - 24) : CARD_WIDTH
      const hou = houOf(info)
      const detail = houDetail(info)

      const branch = info.ganzhi.monthBranch
      const gua = (info.hexagram && info.hexagram.lines) ? info.hexagram : (branch ? GUA[branch] : null)
      const today = dayFromKey(info.date)
      const fu = info.fu || fuAt(today, fuOfYear(Number(info.date.slice(0, 4))))
      const jiu = info.jiu || jiuAt(today)
      const thisYear = Number(info.date.slice(0, 4))
      const yearNo = viewYear || thisYear
      const table = yearTable(yearNo)
      const picked = yearPick ? table.terms.find((term) => term.name === yearPick) : null
      const guaSay = gua ? GUA_SAY[gua.name] : null

      const stepYear = (delta) => {
        const nextYear = clamp(yearNo + delta, 1900, 2100)
        if (nextYear === yearNo) return
        setViewYear(nextYear === thisYear ? 0 : nextYear)
        setYearPick('')
      }

      // 初伏 6 天 · 距立冬 8 天: 三伏 and 数九 speak only while they run.
      const mark = fu ? fu.phase + ' ' + fu.day + ' 天' : (jiu ? jiu.name + ' ' + jiu.day + ' 天' : '')
      // '距立冬 3 天 7 小时'; the exact minute rides in the tooltip.
      const nextAt = info.next ? epoch(info.next.at) : 0
      const countdown = info.next
        ? '距' + info.next.name + ' ' + (nextAt > Date.now() ? span(nextAt - Date.now()) : info.next.days + ' 天')
        : ''
      const metaLine = [mark, countdown].filter(Boolean).join(' · ')

      // 十二消息卦 on the card: 阳 lines solid, 阴 lines split, top line first.
      const guaChip = gua ? h('button', {
        'data-jieqi-control': true,
        style: styles.gua,
        onClick: (event) => { event.stopPropagation(); setPage('gua') },
        title: (branch || '') + '月 · ' + gua.name + '卦' + (gua.line ? '（' + gua.line + '）' : '') + ' · 读卦辞',
        'aria-label': '月建' + (branch || '') + '月，' + gua.name + '卦',
      },
        h('span', { style: styles.guaBars }, (gua.lines || []).slice().reverse().map((line, step) => h('span', {
          key: step,
          style: styles.guaLine,
        }, line
          ? h('span', { style: styles.guaBar })
          : [h('span', { key: 'yin-a', style: styles.guaBar }), h('span', { key: 'yin-b', style: styles.guaBar })]
        ))),
        h('span', { style: styles.guaName }, gua.name)
      ) : null

      // 'auto' borrows the term's own tint, so the colour turns with the season.
      const tintKey = accent === 'auto'
        ? (info.isTermDay ? TERM_TINT[info.term] : null)
        : (accent === 'brand' ? null : accent)
      const accentHex = (TINTS[tintKey] || {}).hex || ''
      const accentColor = accentHex || 'var(--dsw-alias-brand-primary, #4d6bfe)'
      const accentLabel = TINTS[tintKey] ? TINTS[tintKey].label : (accent === 'auto' ? '跟随节气' : '品牌色')
      const ripple = accentHex ? tint(accentHex, 0.34) : 'rgba(88, 116, 255, 0.34)'
      const rippleOut = accentHex ? tint(accentHex, 0) : 'rgba(88, 116, 255, 0)'
      const swatches = [
        { key: 'auto', label: '跟随节气', background: 'conic-gradient(' + TINTS.zhu.hex + ', ' + TINTS.qiu.hex + ', ' + TINTS.zhe.hex + ', ' + TINTS.dian.hex + ', ' + TINTS.zhu.hex + ')' },
        { key: 'brand', label: '品牌色', background: 'var(--dsw-alias-brand-primary, #4d6bfe)' },
      ].concat(TINT_KEYS.map((key) => ({ key: key, label: TINTS[key].label, background: TINTS[key].hex })))

      const choose = (key, label) => {
        setAccent(key)
        writeStorage(ACCENT_KEY, key)
        setPicking(false)
        flash(key === 'auto' ? '已跟随节气' : (key === 'brand' ? '已切回品牌色' : '已换成' + label))
      }

      const summary = [
        info.ganzhi.year + '年' + (info.ganzhi.monthBranch ? ' ' + info.ganzhi.monthBranch + '月' : '') + (info.ganzhi.day ? ' ' + info.ganzhi.day.name + '日' : ''),
        info.term,
        hou,
        '第' + info.dayInTerm + '天',
        countdown,
        '（' + info.termAt + ' 交节）',
      ].filter(Boolean).join(' ')

      const prompt = [
        '请用 jieqi skill 帮我播报今天：' + info.date + '，' + info.term + '，' + hou + '，第 ' + info.dayInTerm + ' 天，' + info.termAt + ' 交节',
        info.next ? '，距' + info.next.name + ' ' + info.next.days + ' 天' : '',
        '。再给一条今天就能做的养生建议。',
      ].join('')

      /** The pin keeps the card open after the pointer leaves, across reloads. */
      const togglePin = () => {
        const next = !pinned
        setPinned(next)
        writeStorage(PINNED_KEY, next ? '1' : '')
        if (next) {
          setSuppressed(false)
          setAuto(false)
          maybeAskPermission()
        }
      }

      const close = () => {
        writeStorage(PINNED_KEY, '')
        writeStorage(DISMISS_KEY, info.date)
        setPinned(false)
        setAuto(false)
        setViewYear(0)
        setYearPick('')
        setSuppressed(true)
      }

      const onPointerDown = (event) => {
        if (event.button !== 0) return
        const target = event.target
        if (target && target.closest && target.closest('[data-jieqi-control]')) return
        // Pressing a card that is still coasting catches it where it is.
        if (fling.current) { catchCard(); return }
        const mode = shape.mode || 'docked'
        // Pressing the card carries the whole window; pressing the dot carries
        // the dot. Either grab ends on the same free point.
        const node = target && target.closest ? target.closest('[data-dsh-jieqi-card]') : null
        const rect = node && node.getBoundingClientRect ? node.getBoundingClientRect() : null
        const card = rect && rect.width > 0 && rect.height > 0
          ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
          : null
        slide.current = {
          startX: event.clientX,
          startY: event.clientY,
          originX: mode === 'docked' ? shape.dock : mode === 'edge' ? (shape.side === 'left' ? 0 : window.innerWidth) : shape.x,
          originY: mode === 'docked' ? shape.top + size / 2 : shape.y,
          mode: mode,
          moved: false,
          card: card,
          target: target,
          gripX: card ? event.clientX - card.left : 0,
          gripY: card ? event.clientY - card.top : 0,
          left: card ? card.left : 0,
          top: card ? card.top : 0,
          restX: card ? card.left : 0,
          restY: card ? card.top : 0,
          track: [{ at: Date.now(), x: card ? card.left : 0, y: card ? card.top : 0 }],
        }
        try { event.currentTarget.setPointerCapture(event.pointerId) } catch (error) { /* optional */ }
      }

      const onPointerMove = (event) => {
        const state = slide.current
        if (!state) return
        const dx = event.clientX - state.startX
        const dy = event.clientY - state.startY
        if (!state.moved && Math.sqrt(dx * dx + dy * dy) < SLIDE_THRESHOLD) return
        state.moved = true
        setSliding(true)
        // A card taken by hand follows the pointer exactly: it never snaps to
        // the rail or folds into a tab, so it cannot jump out from under it.
        if (state.card) {
          const maxLeft = Math.max(DRAG_MARGIN, window.innerWidth - DRAG_MARGIN - state.card.width)
          const maxTop = Math.max(26, window.innerHeight - 26 - state.card.height)
          state.left = clamp(event.clientX - state.gripX, DRAG_MARGIN, maxLeft)
          state.top = clamp(event.clientY - state.gripY, 26, maxTop)
          // The last few samples give the release its speed: a card let go mid
          // swing should coast, not stop dead under the finger.
          state.track.push({ at: Date.now(), x: state.left, y: state.top })
          while (state.track.length > 6) state.track.shift()
          setSnapping(false)
          if (!state.carrying) {
            // Only the fact of the carry becomes state; the motion is painted.
            state.carrying = true
            setCardDrag({
              left: state.restX,
              top: state.restY,
              baseX: state.restX,
              baseY: state.restY,
              width: state.card.width,
              height: state.card.height,
            })
          }
          paintCard(state.left - state.restX, state.top - state.restY)
          return
        }
        const x = dockX(state.originX + dx)
        const y = clamp(state.originY + dy, TAB_HEIGHT / 2, window.innerHeight - TAB_HEIGHT / 2)
        // A drag that stays near the header keeps the dot on its rail, so the
        // same gesture covers both sliding along the top and parking anywhere.
        if (Math.abs(y - (shape.top + size / 2)) <= SNAP) {
          setSnapping(true)
          setShape((current) => (current ? Object.assign({}, current, { mode: 'docked', dock: x }) : current))
          return
        }
        setSnapping(false)
        // Close to a side, the dot folds into half a tab at the window edge.
        const side = x <= EDGE_SNAP ? 'left' : x >= window.innerWidth - EDGE_SNAP ? 'right' : ''
        if (side) {
          setShape((current) => (current ? Object.assign({}, current, { mode: 'edge', side: side, y: y }) : current))
          return
        }
        setShape((current) => (current ? Object.assign({}, current, { mode: 'free', x: x, y: y }) : current))
      }

      /** Park the dot against the edge the card now presents — above it, or
       *  below when the card sits low enough to open upward — so the two agree
       *  again and a later hover reopens the card where it was left. */
      /** A carry paints the transform itself, so no React render runs per
       *  pointer event and the card stays glued to the finger at any rate. */
      const paintCard = (x, y) => {
        live.current = { x: x, y: y }
        const shift = 'translate3d(' + x + 'px, ' + y + 'px, 0)'
        if (panelNode.current) {
          panelNode.current.style.transform = (openUp ? 'translateY(-100%) ' : '') + shift
        }
        if (dotNode.current) dotNode.current.style.transform = shift + ' scale(0.72)'
      }

      const commitCard = (left, top, card) => {
        if (fling.current) { window.clearTimeout(fling.current); fling.current = null }
        live.current = { x: 0, y: 0 }
        const half = 9 + size / 2
        const up = top + card.height / 2 > window.innerHeight * 0.62
        const point = freePoint(left + card.width / 2, up ? top + card.height + half : top - half)
        setCardDrag(null)
        setShape((current) => (current ? Object.assign({}, current, { mode: 'free', x: point.x, y: point.y }) : current))
        writeStorage(MODE_KEY, 'free')
        writeStorage(POS_KEY, JSON.stringify({ x: Math.round(point.x), y: Math.round(point.y) }))
      }

      /** Catches a coasting card where it currently is and parks it there. */
      const catchCard = () => {
        if (!cardDrag) return
        commitCard(cardDrag.left, cardDrag.top, { width: cardDrag.width, height: cardDrag.height })
      }

      /** Release speed over the last ~110ms, in px per millisecond. */
      const velocityOf = (state, axis) => {
        const track = state.track || []
        if (track.length < 2) return 0
        const last = track[track.length - 1]
        let first = track[0]
        for (let i = track.length - 2; i >= 0; i -= 1) {
          if (last.at - track[i].at > 110) break
          first = track[i]
        }
        return (last[axis] - first[axis]) / Math.max(16, last.at - first.at)
      }

      const endSlide = (event) => {
        const state = slide.current
        slide.current = null
        setSliding(false)
        setSnapping(false)
        try { event.currentTarget.releasePointerCapture(event.pointerId) } catch (error) { /* released */ }
        if (!state) return
        if (state.moved && state.card) {
          const vx = velocityOf(state, 'x')
          const vy = velocityOf(state, 'y')
          if (!calm && (Math.abs(vx) > FLING_MIN || Math.abs(vy) > FLING_MIN)) {
            // A thrown card coasts: the browser eases the last stretch on the
            // compositor and the dot rides along on the same curve.
            const stride = (v) => clamp(v * FLING_GAIN, -FLING_MAX, FLING_MAX)
            const left = clamp(state.left + stride(vx), DRAG_MARGIN, Math.max(DRAG_MARGIN, window.innerWidth - DRAG_MARGIN - state.card.width))
            const top = clamp(state.top + stride(vy), 26, Math.max(26, window.innerHeight - 26 - state.card.height))
            live.current = { x: left - state.restX, y: top - state.restY }
            setCardDrag({
              left: left,
              top: top,
              baseX: state.restX,
              baseY: state.restY,
              width: state.card.width,
              height: state.card.height,
              fling: true,
            })
            window.clearTimeout(fling.current)
            fling.current = window.setTimeout(() => {
              fling.current = null
              commitCard(left, top, state.card)
            }, FLING_MS + 30)
            return
          }
          commitCard(state.left, state.top, state.card)
          return
        }
        if (state.moved) {
          // The dot already rests where the pointer left it.
          return
        }
        // A press that never became a drag is a click. Anywhere on the card it
        // copies today's summary: a drag never reaches this line because the
        // pointer has already moved past SLIDE_THRESHOLD. The dot keeps its job.
        if (state.card) {
          if (copyText(summary)) markCopied()
          return
        }
        togglePin()
      }

      const ask = (event) => {
        event.stopPropagation()
        const editor = composerEditor()
        if (!editor || !pasteInto(editor, prompt)) {
          if (copyText(prompt)) flash('已复制提问')
          return
        }
        // The editor applies pastes asynchronously, so read the result back
        // before claiming success; a clipboard copy is the honest fallback.
        window.setTimeout(() => {
          if (editorText(editor).indexOf(info.term) !== -1) {
            flash('已放入输入框')
          } else if (copyText(prompt)) {
            flash('已复制提问')
          }
        }, 180)
      }

      // Three resting places: the header rail, a free viewport point, half an
      // edge tab. Only the card's anchor differs between them.
      const mode = shape.mode || 'docked'
      const docked = mode === 'docked'
      const edge = mode === 'edge'
      const dotX = docked ? shape.dock : edge ? (shape.side === 'left' ? 0 : window.innerWidth) : shape.x
      const dotY = docked ? shape.top + size / 2 : shape.y
      // Keep the opened card inside the viewport, opening away from the nearer edge.
      const rightSide = dotX > window.innerWidth / 2
      let left
      if (edge) left = shape.side === 'left' ? 8 : window.innerWidth - 8 - cardWidth
      else if (docked) left = rightSide ? dotX + 12 - cardWidth : dotX - 12
      else left = dotX - cardWidth / 2
      const minLeft = 8
      const maxLeft = window.innerWidth - 8 - cardWidth
      left = maxLeft > minLeft ? clamp(left, minLeft, maxLeft) : minLeft
      const wrapperLeft = edge
        ? (shape.side === 'left' ? -TAB_WIDTH / 2 : window.innerWidth - TAB_WIDTH / 2)
        : dotX - size / 2
      const wrapperTop = edge ? dotY - TAB_HEIGHT / 2 : dotY - size / 2
      const originX = edge ? (shape.side === 'left' ? 0 : cardWidth) : clamp(dotX - left, 20, cardWidth - 20)
      // Near the floor the card opens upward rather than off screen.
      const openUp = !docked && dotY > window.innerHeight * 0.62
      // Every face inflates from one point: the wall for an edge tab, under the
      // header for a docked dot, the card itself when it rests free.
      const wall = edge ? (shape.side === 'left' ? -1 : 1) : 0
      const bubble = {
        bx: wall ? (wall * 18) + 'px' : '0px',
        by: wall ? '0px' : (openUp ? '6px' : '-4px'),
        sx: wall ? 0.46 : 0.95,
        sy: wall ? 0.94 : 0.9,
        ox: wall ? (wall < 0 ? '-8px' : 'calc(100% + 8px)') : (originX + 'px'),
        oy: openUp ? 'calc(100% - 6px)' : '6px',
      }
      const dotWidth = edge ? TAB_WIDTH : size
      const dotHeight = edge ? TAB_HEIGHT : size
      const dotRadius = edge ? (shape.side === 'left' ? '0 10px 10px 0' : '10px 0 0 10px') : '50%'
      // The header rail, drawn while a drag is close enough to snap onto it.
      const rail = column()
      const railLeft = Math.max(8, rail.left + 8)
      const railWidth = Math.max(40, rail.right - rail.left - 16)

      const elapsed = Math.max(0, info.dayInTerm - 1)
      const total = elapsed + (info.next ? info.next.days : 0)
      const progress = total > 0 ? Math.round((elapsed / total) * 100) : 0
      // On the term day the line counts down to the minute, then says when it was.
      const untilTerm = epoch(info.termAt) - Date.now()
      const since = info.isTermDay && untilTerm > 0
        ? span(untilTerm) + '后交节'
        : info.isTermDay ? '今日 ' + clock(info.termAt) + ' 交节' : stamp(info.termAt) + ' 交节'
      const gzDay = info.ganzhi && info.ganzhi.day
      const gzHour = info.ganzhi && info.ganzhi.hour
      const gzText = gzDay ? gzDay.name + '日' + (gzHour ? ' · ' + gzHour.name : '') : ''
      const caption = info.ganzhi.year + '年 '
        + (info.ganzhi.monthBranch ? info.ganzhi.monthBranch + '月 · ' : '')
        + monthDay(info.date)
      // 日柱 and 时辰 sit on the left, the term stamp stays right-aligned.
      const gzTitle = gzHour ? gzHour.full + ' · ' + gzHour.range : null

      const closeButton = h('button', {
        'data-jieqi-control': true,
        style: styles.close,
        onClick: close,
        title: '收起成圆点（Alt+J 也能开关）',
        'aria-label': '收起',
      }, '×')

      const progressBar = (thin) => h('div', {
        style: thin ? Object.assign({}, styles.track, { marginTop: '6px' }) : styles.track,
      },
        h('div', { style: Object.assign({}, styles.fill, { width: progress + '%' }) }),
        thin ? null : h('div', { style: Object.assign({}, styles.tick, { left: '33.33%' }) }),
        thin ? null : h('div', { style: Object.assign({}, styles.tick, { left: '66.66%' }) })
      )

      // Narrow: one line. 霜降 第 8 天 ×, with the countdown as the progress line.
      const narrowBody = [
        h('div', { style: styles.narrowRow },
          h('span', {
            style: styles.narrowTerm,
            'data-dsh-jieqi-copy': true,
            title: '点一下复制今天的摘要',
          }, info.term),
          h('span', { style: styles.narrowDay }, toast || (copied ? '已复制' : ('第 ' + info.dayInTerm + ' 天'))),
          closeButton
        ),
        progressBar(true),
      ]

      const fullBody = [
        h('div', { style: styles.head },
          h('span', { style: styles.caption }, caption),
          h('button', {
            'data-jieqi-control': true,
            style: styles.yearIcon,
            onClick: (event) => { event.stopPropagation(); setViewYear(0); setPage('year'); setYearPick('') },
            title: '年表：' + thisYear + '（' + table.ganzhi + '）二十四节气，可左右翻年',
            'aria-label': '年表',
          }, h('svg', {
            width: '13', height: '13', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false',
          }, h('path', {
            d: 'M20 3h-1V1h-2v2H7V1H5v2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 18H4V8h16v13z',
            fill: 'currentColor',
          }))),
          h('button', {
            'data-jieqi-control': true,
            style: Object.assign({}, styles.colorChip, { background: accentHex || 'var(--dsw-alias-brand-primary, #4d6bfe)' }),
            onClick: (event) => { event.stopPropagation(); setPicking((value) => !value) },
            title: picking ? '收起色板' : '换一种颜色（当前：' + accentLabel + '）',
            'aria-label': '换颜色',
          }),
          closeButton
        ),
        h('div', { style: styles.titleRow },
          h('span', {
            style: styles.term,
            'data-dsh-jieqi-copy': true,
            title: '点一下复制今天的摘要',
          }, info.term),
          h('span', {
            style: copied ? Object.assign({}, styles.dayBadge, styles.dayBadgeCopied) : styles.dayBadge,
            role: 'status',
            'aria-live': 'polite',
          }, copied ? '已复制' : '第 ' + info.dayInTerm + ' 天'),
          h('button', {
            'data-jieqi-control': true,
            style: Object.assign({}, styles.iconBtn, {
              opacity: pinned ? '0.95' : '0.5',
              color: pinned ? accentColor : 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))',
            }),
            onClick: (event) => { event.stopPropagation(); togglePin() },
            title: pinned ? '取消置顶（Alt+J）' : '置顶：鼠标离开后仍展开（Alt+J）',
            'aria-label': pinned ? '取消置顶' : '置顶',
            'aria-pressed': pinned ? 'true' : 'false',
          }, h('svg', {
            width: '11', height: '11', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false',
          }, h('path', { d: 'M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h1v-6h5v-2l-2-2z', fill: 'currentColor' }))),
        ),
        h('div', { style: styles.sub },
          gzText ? h('span', { style: styles.subDay, title: gzTitle }, gzText) : null,
          h('span', { style: styles.subSince }, since)),
        info.tip ? h('div', { style: styles.tip, title: info.tip }, info.tip) : null,
        picking
          ? h('div', { style: styles.swatches }, swatches.map((item) => h('button', {
            key: item.key,
            'data-jieqi-control': true,
            style: Object.assign({}, styles.swatch, {
              background: item.background,
              boxShadow: item.key === accent ? '0 0 0 1.5px var(--dsw-alias-label-primary, #fff)' : '0 0 0 1px rgba(128, 128, 128, 0.32)',
            }),
            onClick: (event) => { event.stopPropagation(); choose(item.key, item.label) },
            title: item.label,
            'aria-label': item.label,
          })))
          : h('div', { style: styles.houRow },
            detail
              ? h('button', {
                'data-jieqi-control': true,
                style: styles.houBtn,
                onClick: (event) => { event.stopPropagation(); setPage('hou') },
                title: '把' + info.term + '拆成三候看',
                'aria-label': '看三候',
              },
                h('span', { style: styles.hou }, hou),
                h('span', { style: styles.houChevron }, '›')
              )
              : h('span', { style: styles.hou }, hou),
            h('button', {
              'data-jieqi-control': true,
              style: styles.ask,
              onClick: ask,
              title: '把今天的节气提问放进输入框',
            }, '问一问')
          ),
        h('div', { style: styles.metaRow },
          h('span', {
            style: styles.metaText,
            title: info.next ? info.next.name + ' ' + info.next.at : null,
          }, metaLine),
          guaChip
        ),
        progressBar(false),
        hint ? h('div', { style: styles.hint }, '拖我走 · 点卡片复制 · Esc 收起') : null,
        h('div', {
          role: 'status',
          'aria-live': 'polite',
          style: Object.assign({}, styles.toast, { opacity: toast ? 1 : 0 }),
        }, toast || ' '),
      ]

      const houBody = detail ? [
        h('div', { style: styles.head },
          h('button', {
            'data-jieqi-control': true,
            style: styles.back,
            onClick: (event) => { event.stopPropagation(); setPage('main') },
            title: '回到今天（Esc）',
            'aria-label': '返回',
          }, '‹'),
          h('span', { style: styles.caption }, info.term + '三候'),
          closeButton
        ),
        h('div', { style: styles.houList }, detail.marks.map((mark, step) => h('div', {
          key: mark.label,
          style: styles.houLine,
        },
          h('span', {
            style: Object.assign({}, styles.houDot, step < detail.index
              ? { background: 'var(--dsw-alias-label-tertiary, rgba(140, 140, 150, 1))', opacity: '0.4' }
              : step === detail.index
                ? { background: accentColor }
                : { boxShadow: 'inset 0 0 0 1px var(--dsw-alias-border-l3, rgba(140, 140, 150, 0.5))' }),
          }),
          h('span', {
            style: Object.assign({}, styles.houLabel, step === detail.index ? { color: accentColor } : null),
          }, mark.label),
          h('span', {
            style: Object.assign({}, styles.houName, step === detail.index ? { color: 'var(--dsw-alias-label-primary, rgba(230, 230, 235, 1))' } : null),
          }, mark.name),
          h('span', {
            style: Object.assign({}, styles.houTail, step === detail.index ? { color: accentColor, opacity: '1' } : null),
          }, mark.tail)
        ))),
        h('div', { style: styles.meta }, info.next ? '距' + info.next.name + ' ' + info.next.days + ' 天' : ''),
        progressBar(false),
        h('div', { style: Object.assign({}, styles.toast, { opacity: toast ? 1 : 0 }) }, toast || ' '),
      ] : fullBody

      // The year page: all 24 terms as a 3×8 sheet, 立春 to 大寒.
      const yearBody = [
        h('div', { style: styles.head },
          h('button', {
            'data-jieqi-control': true,
            style: styles.back,
            onClick: (event) => { event.stopPropagation(); setPage('main') },
            title: '回到今天（Esc）',
            'aria-label': '返回',
          }, '‹'),
          h('span', { style: styles.caption }, table.ganzhi + '年 · ' + yearNo),
          h('button', {
            'data-jieqi-control': true,
            style: styles.yearStep,
            onClick: (event) => { event.stopPropagation(); stepYear(-1) },
            title: '上一年',
            'aria-label': '上一年',
          }, '‹'),
          h('button', {
            'data-jieqi-control': true,
            style: styles.yearStep,
            onClick: (event) => { event.stopPropagation(); stepYear(1) },
            title: '下一年',
            'aria-label': '下一年',
          }, '›'),
          closeButton
        ),
        h('div', { style: styles.yearGrid }, table.terms.map((term) => h('button', {
          key: term.name,
          'data-jieqi-control': true,
          style: Object.assign({}, styles.yearCell, yearNo === thisYear && term.name === info.term
            ? { background: tint(accentHex || '#4d6bfe', 0.14), borderRadius: '4px' }
            : null),
          onClick: (event) => { event.stopPropagation(); setYearPick(term.name) },
          title: term.name + ' ' + term.at + (term.branch ? ' · 进入' + term.branch + '月' : ''),
          'aria-label': term.name + ' ' + term.at,
        },
          h('span', {
            style: Object.assign({}, styles.yearName, yearNo === thisYear && term.name === info.term
              ? { color: accentColor, fontWeight: '600' }
              : null),
          }, term.name),
          h('span', { style: styles.yearDate }, term.short)
        ))),
        h('div', { style: styles.yearFoot },
          h('div', { style: styles.yearFootLine }, '立春 ' + table.lichun
            + (table.jiu ? ' · 入九 ' + table.jiu : '')),
          table.fu
            ? h('div', { style: styles.yearFootLine }, '三伏 ' + table.fu.initial + '–' + table.fu.last + ' · ' + table.fu.days + ' 天')
            : null,
          picked
            ? h('div', { style: Object.assign({}, styles.yearFootLine, { color: accentColor, opacity: '0.92' }) }, picked.name + ' ' + picked.at)
            : h('div', { style: styles.yearFootLine }, '‹ › 换年 · 点一处看时刻')
        ),
        h('div', { style: Object.assign({}, styles.toast, { opacity: toast ? 1 : 0 }) }, toast || ' '),
      ]

      // 摇卦: the coin throw on this date, its six lines and one sentence.
      const castHex = draw && draw.date === info.date ? hexFromValues(draw.values) : null
      const castSettled = Boolean(castHex) && upto >= 6

      /** Turn the six coins over one at a time; the card is calm under reduced motion. */
      const roll = (event) => {
        event.stopPropagation()
        if (castTimer.current) { window.clearTimeout(castTimer.current); castTimer.current = null }
        const next = castLines()
        setDraw({ date: info.date, values: next.values })
        writeStorage(CAST_KEY, JSON.stringify({ date: info.date, values: next.values }))
        setUpto(0)
        if (calm) { setUpto(6); return }
        const step = (count) => {
          castTimer.current = window.setTimeout(() => {
            setUpto(count)
            if (count < 6) step(count + 1)
            else castTimer.current = null
          }, 112)
        }
        step(1)
      }

      const castText = castHex ? [
        info.date + ' 摇卦',
        '第' + castHex.ben.no + '卦 ' + HEX_NAMES[castHex.ben.no],
        hexTitle(castHex.ben) + '（上' + castHex.ben.upper.name + '下' + castHex.ben.lower.name + '）',
        castHex.moving.length
          ? '动爻 ' + castHex.moving.map((index) => HEX_POS[index]).join('、') + (castHex.zhi ? '，之卦 ' + HEX_NAMES[castHex.zhi.no] : '')
          : '六爻安静',
        HEX_NAMES[castHex.ben.no] + '：' + HEX_SAY[castHex.ben.no],
      ].join(' ') : ''

      const copyCast = (event) => {
        event.stopPropagation()
        if (copyText(castText)) { markCopied(); flash('已复制这一卦') }
        else flash('复制失败')
      }

      const castNote = !castHex
        ? '三枚铜钱 · 六掷'
        : (upto < 6
          ? '第 ' + (upto + 1) + ' 爻 · ' + coinFace(castHex.values[Math.min(upto, 5)])
          : (castHex.moving.length
            ? '动爻 ' + castHex.moving.map((index) => HEX_POS[index]).join('、')
            : '六爻安静'))

      const castBody = [
        h('div', { style: styles.castHead },
          h('span', { style: styles.castTitle }, '铜钱摇卦'),
          h('span', { style: styles.castMeta }, castNote)
        ),
        castHex ? h('div', { style: styles.castLines },
          [5, 4, 3, 2, 1, 0].map((index) => {
            const value = castHex.values[index]
            const yang = value % 2 === 1
            const moving = castHex.moving.indexOf(index) !== -1
            // Lines land from 初爻 upward: the first throw is the bottom one.
            const landed = upto > index
            const bar = moving ? styles.castBarMoving : styles.castBar
            return h('div', { key: index, style: styles.castLine },
              h('span', { style: styles.castPos }, HEX_POS[index]),
              h('span', { style: Object.assign({}, styles.castBars, landed ? null : { opacity: '0.14' }) },
                yang
                  ? h('span', { key: 'whole', style: bar })
                  : [h('span', { key: 'left', style: bar }), h('span', { key: 'right', style: bar })]),
              h('span', { style: styles.castMark }, landed && moving ? (yang ? '○' : '×') : ''),
              h('span', { style: Object.assign({}, styles.castYao, landed ? null : { opacity: '0.14' }) },
                landed ? YAO_NAMES[value] : '·')
            )
          })
        ) : null,
        castSettled ? h('div', { role: 'status', 'aria-live': 'polite' },
          h('div', { style: styles.castTop },
            h('span', { style: styles.castGlyph }, String.fromCharCode(0x4dc0 + castHex.ben.no - 1)),
            h('span', { style: styles.castName }, HEX_NAMES[castHex.ben.no]),
            h('span', { style: styles.castNo }, '第 ' + castHex.ben.no + ' 卦'),
            h('span', { style: styles.castTag }, castHex.moving.length ? castHex.moving.length + ' 爻动' : '静卦')
          ),
          h('div', { style: styles.castForm },
            hexTitle(castHex.ben) + ' · 上' + castHex.ben.upper.name + '下' + castHex.ben.lower.name
              + (castHex.zhi ? ' → ' + hexTitle(castHex.zhi) : '')),
          h('div', { style: styles.castGloss }, HEX_NAMES[castHex.ben.no] + '：' + HEX_SAY[castHex.ben.no])
        ) : null,
        h('div', { style: styles.castFoot },
          h('button', {
            'data-jieqi-control': true,
            style: styles.castBtn,
            onClick: roll,
            title: castHex ? '再掷一次，另起一卦' : '三枚铜钱掷六次，从初爻往上起卦',
            'aria-label': castHex ? '再摇一卦' : '摇一卦',
          }, castHex ? '再摇一卦' : '摇一卦'),
          castSettled
            ? h('button', {
              'data-jieqi-control': true,
              style: styles.castLink,
              onClick: copyCast,
              title: '复制卦名、动爻与卦意',
              'aria-label': '复制这一卦',
            }, '复制卦意')
            : h('span', { style: styles.castHint }, '本地随机 · 只作参照')
        ),
      ]

      // The 卦 page: this month's 消息卦, its 卦辞 and one plain sentence.
      const guaBody = guaSay ? [
        h('div', { style: styles.head },
          h('button', {
            'data-jieqi-control': true,
            style: styles.back,
            onClick: (event) => { event.stopPropagation(); setPage('main') },
            title: '回到今天（Esc）',
            'aria-label': '返回',
          }, '‹'),
          h('span', { style: styles.caption }, (branch || '') + '月 · ' + gua.name + '卦'),
          closeButton
        ),
        h('div', { style: styles.guaTop },
          h('span', { style: styles.guaGlyph }, guaSay.symbol),
          h('span', { style: styles.guaBig }, gua.name),
          h('span', { style: styles.guaNo }, '第 ' + guaSay.no + ' 卦'),
          h('span', { style: styles.guaTag }, gua.line)
        ),
        h('div', { style: styles.guaCi }, guaSay.ci),
        h('div', { style: styles.guaGloss }, guaSay.gloss),
        h('div', { style: styles.guaXiang }, '象曰：' + guaSay.xiang),
        ...castBody,
        h('div', { style: Object.assign({}, styles.yearFootLine, { marginTop: '7px' }) }, '月建消息卦 · 摇卦只作参照'),
        h('div', { style: Object.assign({}, styles.toast, { opacity: toast ? 1 : 0 }) }, toast || ' '),
      ] : fullBody

      return h('div', {
        style: Object.assign({}, styles.wrap, {
          left: wrapperLeft + 'px',
          top: wrapperTop + 'px',
          opacity: shown ? 1 : 0,
          transition: 'opacity ' + FADE_MS + 'ms ease',
          '--jieqi-accent': accentColor,
          '--jieqi-ripple': ripple,
          '--jieqi-ripple-out': rippleOut,
        }),
        'data-jieqi-root': 'true',
        onMouseEnter: onEnter,
        onMouseLeave: onLeave,
        onPointerDown: onPointerDown,
        onPointerMove: onPointerMove,
        onPointerUp: endSlide,
        onPointerCancel: endSlide,
      },
        snapping ? h('div', {
          'aria-hidden': true,
          style: {
            position: 'fixed',
            left: railLeft + 'px',
            width: railWidth + 'px',
            top: (shape.top - TOP_GAP - 1) + 'px',
            height: '1.5px',
            borderRadius: '1px',
            background: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
            opacity: 0.5,
            pointerEvents: 'none',
          },
        }) : null,
        h('div', {
          ref: dotNode,
          role: 'button',
          tabIndex: 0,
          'data-jieqi-dot': 'true',
          'aria-label': '节气：' + info.term + '，第 ' + info.dayInTerm + ' 天',
          'aria-haspopup': 'dialog',
          'aria-expanded': open ? 'true' : 'false',
          onKeyDown: (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            togglePin()
          },
          onDoubleClick: (event) => {
            event.preventDefault()
            event.stopPropagation()
            resetDot()
          },
          onContextMenu: (event) => {
            event.preventDefault()
            resetDot()
          },
          title: info.term + ' · ' + hou
            + (open ? '' : '（点一下展开）')
            + (pinned ? '\n单击取消置顶' : '\n单击置顶')
            + '\n拖住卡片本身也能移动整个窗口'
            + '\n拖圆点到任意位置会停住 · 靠近标题栏吸附 · 拖到边缘收成小标签'
            + '\n双击或右键回到中间 · Alt+J 开关',
          style: Object.assign({}, styles.dot, {
            width: dotWidth + 'px',
            height: dotHeight + 'px',
            borderRadius: dotRadius,
            cursor: sliding ? 'grabbing' : 'pointer',
            touchAction: 'none',
            opacity: cardDrag ? '0.55' : open ? '1' : edge ? '0.72' : hint ? '0.95' : quiet ? '0.3' : '0.85',
            transform: cardDrag
              ? 'translate3d(' + (cardDrag.fling ? cardDrag.left - cardDrag.baseX : live.current.x) + 'px, '
                + (cardDrag.fling ? cardDrag.top - cardDrag.baseY : live.current.y) + 'px, 0) scale(0.72)'
              : 'none',
            pointerEvents: cardDrag ? 'none' : 'auto',
            animation: open || edge || (quiet && !hint) ? 'none' : 'dsh-jieqi-ripple 2.4s ease-in-out 3',
            transition: cardDrag
              ? (cardDrag.fling
                ? 'transform ' + FLING_MS + 'ms cubic-bezier(0.16, 0.84, 0.28, 1), opacity 160ms ease'
                : 'none')
              : 'opacity ' + FADE_MS + 'ms ease, transform ' + FADE_MS + 'ms cubic-bezier(0.22, 0.8, 0.24, 1), width ' + FADE_MS + 'ms ease, height ' + FADE_MS + 'ms ease',
          }, edge ? {
            position: 'relative',
            background: 'var(--dsw-alias-bg-layer-2, rgba(32, 32, 36, 0.94))',
            border: '1px solid var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
            boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.55)',
          } : null),
        },
          edge ? h('span', {
            'aria-hidden': true,
            style: {
              position: 'absolute',
              top: '50%',
              left: (shape.side === 'left' ? TAB_WIDTH * 0.75 : TAB_WIDTH * 0.25) + 'px',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              color: 'var(--jieqi-accent, var(--dsw-alias-brand-primary, #4d6bfe))',
            },
          }, h('svg', { width: '6', height: '9', viewBox: '0 0 6 9', 'aria-hidden': 'true', focusable: 'false' },
            h('path', {
              d: shape.side === 'left' ? 'M1 1l3.5 3.5L1 8' : 'M5 1L1.5 4.5 5 8',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '1.3',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }))) : null
        ),
        h('div', {
          ref: panelNode,
          'aria-hidden': open ? 'false' : 'true',
          style: Object.assign({}, styles.panel, {
            width: cardWidth + 'px',
            left: (left - wrapperLeft) + 'px',
            top: openUp ? '0px' : (edge ? TAB_HEIGHT + 'px' : size + 'px'),
            paddingTop: openUp ? '0px' : '9px',
            paddingBottom: openUp ? '9px' : '0px',
            transform: openUp ? 'translateY(-100%)' : 'none',
            pointerEvents: open ? 'auto' : 'none',
          }, cardDrag ? {
            // Carried by hand the panel rides a compositor transform: its layout
            // box never moves, so the pointer never triggers a reflow.
            transform: (openUp ? 'translateY(-100%) ' : '')
              + (cardDrag.fling
                ? 'translate3d(' + (cardDrag.left - cardDrag.baseX) + 'px, ' + (cardDrag.top - cardDrag.baseY) + 'px, 0)'
                : 'translate3d(' + live.current.x + 'px, ' + live.current.y + 'px, 0)'),
            transition: cardDrag.fling ? 'transform ' + FLING_MS + 'ms cubic-bezier(0.16, 0.84, 0.28, 1)' : 'none',
            willChange: 'transform',
          } : null),
        },
          h('div', {
            ref: cardNode,
            'data-dsh-jieqi-card': true,
            'data-inflate': open ? 'on' : 'off',
            role: 'dialog',
            'aria-label': info.term + '节气',
            'aria-hidden': open ? 'false' : 'true',
            title: '拖动可移动整个窗口 · 点卡片复制摘要 · Esc 收起',
            style: Object.assign({}, styles.card, {
              width: cardWidth + 'px',
              padding: compact ? '8px 11px 9px' : styles.card.padding,
              opacity: open ? 1 : 0,
              // Hidden, not merely transparent: a closed card must stop
              // collecting Tab stops nobody can see.
              visibility: open ? 'visible' : 'hidden',
              pointerEvents: open ? 'auto' : 'none',
              transform: open ? 'none' : 'translate3d(' + bubble.bx + ', ' + bubble.by + ', 0) scale(' + bubble.sx + ', ' + bubble.sy + ')',
              transformOrigin: bubble.ox + ' ' + bubble.oy,
              transition: open
                ? 'none'
                : 'opacity ' + CLOSE_MS + 'ms ease, transform ' + CLOSE_MS + 'ms cubic-bezier(0.36, 0, 0.86, 0.42), visibility 0s linear ' + CLOSE_MS + 'ms',
              cursor: sliding ? 'grabbing' : 'grab',
              // A touch that starts on the card is a drag, never a scroll.
              touchAction: 'none',
              '--jq-bx': bubble.bx,
              '--jq-by': bubble.by,
              '--jq-sx': String(bubble.sx),
              '--jq-sy': String(bubble.sy),
            }, morph ? {
              // The box holds the old height for one frame, then rides to the
              // new one while the incoming face fades in.
              height: (morph.phase === 'to' ? morph.to : morph.from) + 'px',
              transition: morph.phase === 'to'
                ? 'height ' + MORPH_MS + 'ms cubic-bezier(0.2, 0.7, 0.25, 1)'
                : 'none',
            } : null),
          },
            // A drawer handle: the one affordance that says the whole thing is
            // held, without a tooltip anybody has to hover for.
            compact ? null : h('span', {
              'aria-hidden': true,
              style: {
                display: 'block',
                width: '26px',
                height: '3px',
                margin: '0 auto 7px',
                borderRadius: '2px',
                background: 'currentColor',
                opacity: '0.16',
              },
            }, null),
            info.isTermDay ? h('div', { style: styles.accent }) : null,
            h('div', {
              key: compact ? 'narrow' : page,
              style: { animation: 'dsh-jieqi-in ' + FADE_MS + 'ms ease' },
            }, compact ? narrowBody : (page === 'year' ? yearBody : page === 'gua' ? guaBody : page === 'hou' && detail ? houBody : fullBody))
          )
        ),
        edge && open ? h('div', {
          'aria-hidden': true,
          style: {
            position: 'absolute',
            left: (TAB_WIDTH / 2 - 26) + 'px',
            top: (TAB_HEIGHT / 2 - 26) + 'px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--jieqi-ripple, rgba(88, 116, 255, 0.34)) 0%, transparent 68%)',
            animation: 'dsh-jieqi-bloom 620ms ease-out both',
            pointerEvents: 'none',
          },
        }) : null
      )
    }
    function apply(ctx) {
      ctx.effect(() => {
        if (!document.getElementById('dsh-jieqi-keyframes')) {
          const style = document.createElement('style')
          style.id = 'dsh-jieqi-keyframes'
          style.textContent = KEYFRAMES
          document.head.appendChild(style)
        }
        return () => {
          const style = document.getElementById('dsh-jieqi-keyframes')
          if (style) style.remove()
        }
      }, 'dsh-jieqi: keyframes')

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'jieqi-card',
      }, JieqiCard))
    }

    return { name: NS, inject: ['slots'], apply }
  },
})
