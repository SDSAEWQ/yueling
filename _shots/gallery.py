"""Compose the 1080x1080 market gallery from the transparent card crops.

Input:  _shots/cards/<face>.png  (transparent, 4x device scale)
Output: docs/screens/01-today.png … 06-help.png
"""
from PIL import Image, ImageDraw, ImageFilter
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CARDS = os.path.join(HERE, 'cards')
SCREENS = os.path.join(ROOT, 'docs', 'screens')

W = H = 1080
GOLD = (214, 193, 126)
SS = 2  # supersample factor for the dial


def background():
    base = Image.new('RGB', (W, H), (8, 9, 12))
    glow = Image.new('L', (W, H), 0)
    pen = ImageDraw.Draw(glow)
    cx, cy, radius = W / 2, H * 0.44, 640
    steps = 90
    for i in range(steps, 0, -1):
        rr = radius * i / steps
        value = int(24 * (1 - i / steps) ** 1.5)
        pen.ellipse([cx - rr, cy - rr * 0.92, cx + rr, cy + rr * 0.92], fill=value)
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    tinted = Image.new('RGB', (W, H), (17, 19, 25))
    return Image.composite(tinted, base, glow)


def dial_layer():
    size = W * SS
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pen = ImageDraw.Draw(layer)
    cx = cy = size / 2
    radius = 470 * SS
    for i in range(24):
        angle = math.radians(i * 15 - 90)
        cardinal = i % 6 == 0
        length = (34 if cardinal else 17) * SS
        width = (3 if cardinal else 2) * SS
        colour = (186, 158, 84, 210) if cardinal else (255, 255, 255, 26)
        x0 = cx + (radius - length) * math.cos(angle)
        y0 = cy + (radius - length) * math.sin(angle)
        x1 = cx + radius * math.cos(angle)
        y1 = cy + radius * math.sin(angle)
        pen.line([x0, y0, x1, y1], fill=colour, width=width)
    # The ring itself, a hairline under the ticks.
    pen.ellipse([cx - radius, cy - radius, cx + radius, cy + radius],
                outline=(255, 255, 255, 16), width=2 * SS)
    return layer.resize((W, H), Image.LANCZOS)


def dot_layer():
    size = W * SS
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pen = ImageDraw.Draw(layer)
    cx, cy, r = size / 2, 126 * SS, 21 * SS
    pen.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GOLD + (255,))
    return layer.resize((W, H), Image.LANCZOS)


def place(canvas, card, width=None, height=None, top=None, left=None):
    scale = None
    if width:
        scale = width / card.width
    elif height:
        scale = height / card.height
    box = (max(1, round(card.width * scale)), max(1, round(card.height * scale)))
    sprite = card.resize(box, Image.LANCZOS)
    x = (W - box[0]) // 2 if left is None else left
    y = (H - box[1]) // 2 if top is None else top
    canvas.alpha_composite(sprite, (x, y))
    return (x, y, box[0], box[1])


def frame(cards, placements):
    canvas = background().convert('RGBA')
    canvas.alpha_composite(dial_layer())
    canvas.alpha_composite(dot_layer())
    for card, options in zip(cards, placements):
        place(canvas, card, **options)
    return canvas.convert('RGB')


def main():
    os.makedirs(SCREENS, exist_ok=True)
    load = lambda name: Image.open(os.path.join(CARDS, name + '.png')).convert('RGBA')
    today, hou, year, gua, day, help_card = (load(n) for n in ('today', 'hou', 'year', 'gua', 'day', 'help'))

    shots = {
        '01-today': frame([today], [{'width': 800}]),
        '02-day': frame([day], [{'width': 720}]),
        '03-gua': frame([gua], [{'height': 900, 'top': 152}]),
        '04-year': frame([year], [{'width': 720}]),
        '06-help': frame([help_card], [{'width': 700, 'top': 150}]),
        '05-faces': frame(
            [today, hou, year, day],
            [
                {'width': 380, 'top': 118, 'left': 112},
                {'width': 380, 'top': 118, 'left': 588},
                {'width': 380, 'top': 566, 'left': 112},
                {'width': 380, 'top': 566, 'left': 588},
            ],
        ),
    }
    for name, image in shots.items():
        path = os.path.join(SCREENS, name + '.png')
        image.save(path, optimize=True)
        print(name, image.size, os.path.getsize(path), 'bytes')


if __name__ == '__main__':
    main()
