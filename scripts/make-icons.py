"""Generate PWA icons, favicon, transparent logo parts and the default OG image
from public/brand/logo-original.png.  usage: python3 scripts/make-icons.py"""
from PIL import Image, ImageDraw, ImageFont, ImageOps
import os
root = os.path.join(os.path.dirname(__file__), '..', 'public')
src = Image.open(os.path.join(root, 'brand', 'logo-original.png')).convert('RGB')
BG = (252, 249, 248)

def to_alpha(im):
    im = im.convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            m = min(r, g, b)
            if m > 245: px[x, y] = (r, g, b, 0)
            elif m > 200:
                # soften anti-aliased edge
                px[x, y] = (r, g, b, int(255 * (245 - m) / 45))
    return im

mark = to_alpha(src.crop((150, 55, 345, 368)))
word = to_alpha(src.crop((118, 366, 382, 410)))
mark.save(os.path.join(root, 'brand', 'mark.png'))
word.save(os.path.join(root, 'brand', 'wordmark.png'))

def icon(size, pad=0.12, bg=BG):
    c = Image.new('RGBA', (size, size), bg + (255,))
    m = mark.copy(); inner = int(size * (1 - 2 * pad))
    m.thumbnail((inner, inner), Image.LANCZOS)
    c.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return c
os.makedirs(os.path.join(root, 'icons'), exist_ok=True)
icon(192).save(os.path.join(root, 'icons', 'icon-192.png'))
icon(512).save(os.path.join(root, 'icons', 'icon-512.png'))
icon(512, pad=0.22).save(os.path.join(root, 'icons', 'maskable-512.png'))
icon(180, pad=0.14).convert('RGB').save(os.path.join(root, 'apple-touch-icon.png'))
fav = icon(64, pad=0.04)
fav.save(os.path.join(root, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
icon(32, pad=0.04).save(os.path.join(root, 'icons', 'favicon-32.png'))

# Open Graph default 1200x630
og = Image.new('RGBA', (1200, 630), BG + (255,))
m = mark.copy(); m.thumbnail((300, 380), Image.LANCZOS)
og.alpha_composite(m, (110, (630 - m.height) // 2))
w = word.copy(); w = w.resize((int(w.width * 2.4), int(w.height * 2.4)), Image.LANCZOS)
og.alpha_composite(w, (480, 210))
d = ImageDraw.Draw(og)
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 34)
except Exception:
    f = ImageFont.load_default()
d.text((486, 340), 'The Guide to Less Toxic Products,', fill=(68, 72, 62), font=f)
d.text((486, 388), 'carried forward for 2026', fill=(68, 72, 62), font=f)
d.rectangle((486, 450, 560, 456), fill=(78, 101, 55))
og.convert('RGB').save(os.path.join(root, 'og-default.png'), optimize=True)
print('ok')
