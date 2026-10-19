"""Parse the EHANS Guide to Less Toxic Products (text extracted from the print PDF)
into structured JSON for SensiThrive. Original wording is preserved verbatim in
`blocks`; products are extracted from rating blocks.

usage: python3 -I parse.py guide.txt out.json
"""
import json, re, sys
from collections import OrderedDict, defaultdict

SRC, OUT = sys.argv[1], sys.argv[2]
L = open(SRC, encoding='utf-8').read().split('\n')
L = [l.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"').replace('', '').rstrip() for l in L]
# fix glued heading
L[2973] = L[2973].replace('known to be in nano form. Blush', 'known to be in nano form.')

# (line, kind, slug, title, section, group)
# kind: section | article | category | group | skip
S = []
def add(line, kind, slug, title, section, group=None, **kw):
    S.append(dict(line=line, kind=kind, slug=slug, title=title, section=section, group=group, **kw))

add(1, 'skip', '', '', '')
add(13, 'article', 'about-ehans', 'EHANS: Who We Are and What We Do', 'about')
add(58, 'skip', '', '', '')
for ln, slug, title in [(68, 'things-can-change', 'Warning: Things Can Change'), (75, 'greenwashing', 'Beware of Greenwashing'),
                        (88, 'natural-isnt-always-safe', "Everything Natural Isn't Safe, and Vice Versa"),
                        (98, 'read-the-labels', 'Learn to Read Labels'), (120, 'routes-of-exposure', 'Routes of Exposure'),
                        (172, 'pollution-in-people', 'Pollution in People'),
                        (193, 'nanoparticles', 'Nanoparticles: Something New to Watch Out For'),
                        (217, 'essential-oils', 'Essential Oils: Tips & Cautions')]:
    add(ln, 'article', slug, title, 'consumer-advice')
add(264, 'section', 'baby-care', 'Baby Care', 'baby-care')
B = 'baby-care'
for ln, slug, title in [(312, 'breastfeeding', 'Breastfeeding'), (344, 'baby-food', 'Baby Food'), (362, 'clean-environment', 'A Clean Environment')]:
    add(ln, 'category', slug, title, B)
add(372, 'skip', '', '', '')
for ln, slug, title in [(374, 'anti-bacterials', 'Anti-bacterials'), (410, 'baby-bedding', 'Beds, Bedding & Mattresses'),
                        (477, 'bottles-nipples', 'Bottles & Nipples'), (512, 'bubble-bath', 'Bubble Bath'), (518, 'baby-clothing', 'Clothing'),
                        (559, 'cradle-cap', 'Cradle Cap'), (563, 'nursery-decorating', 'Decorating the Nursery'), (590, 'diapers', 'Diapers & Diaper Rash')]:
    add(ln, 'category', slug, title, B)
add(651, 'skip', '', '', '')
for ln, slug, title in [(653, 'baby-furniture', 'Furniture & Cribs'), (668, 'baby-lotion', 'Lotion & Diaper Ointment'), (717, 'baby-oil', 'Baby Oil'),
                        (740, 'baby-powder', 'Baby Powder'), (757, 'baby-shampoo', 'Baby Shampoo'), (783, 'baby-soap', 'Baby Soap & Cleansers'),
                        (827, 'soothers', 'Soothers'), (833, 'teething', 'Teething'), (837, 'toys', 'Toys'), (855, 'baby-wipes', 'Diaper Wipes')]:
    add(ln, 'category', slug, title, B)
add(887, 'article', 'baby-care-links', 'Baby Care Links', B)
add(919, 'article', 'chemical-hazards', 'Chemical Hazards', 'chemical-hazards')
add(1066, 'section', 'household-cleaners', 'Household Cleaners', 'household-cleaners')
add(1129, 'article', 'cleaning-product-ingredients', 'Common Hazardous Ingredients in Cleaning Products', 'household-cleaners', ingredients='cleaning')
add(1252, 'skip', '', '', '')
H = 'household-cleaners'
for ln, slug, title in [(1254, 'air-freshener', 'Air Freshener, Deodorizer, Odour Remover'), (1296, 'all-purpose-cleaner', 'All-Purpose Cleaner'),
                        (1358, 'bleach', 'Bleach'), (1396, 'carpet-cleaner', 'Carpet Cleaner'), (1444, 'carpet-deodorizer', 'Carpet Deodorizer'),
                        (1453, 'dishwashing-liquid', 'Dishwashing Liquid (Hand)'), (1469, 'dishwasher-detergent', 'Dishwasher Detergent (Automatic)'),
                        (1498, 'disinfectant', 'Disinfectant'), (1557, 'drain-opener', 'Drain Opener'), (1594, 'dry-cleaning', 'Dry Cleaning'),
                        (1630, 'dusting', 'Dusting'), (1644, 'fabric-softener', 'Fabric Softener'), (1694, 'floor-cleaner', 'Floor Cleaner, Wax, Polish'),
                        (1749, 'floor-furniture-polish', 'Floor and Furniture Polish'), (1781, 'glass-cleaner', 'Glass Cleaner'),
                        (1813, 'heavy-duty-cleaner', 'Heavy Duty Cleaner'), (1844, 'laundry-detergent', 'Laundry Detergent'),
                        (1908, 'laundry-stain-remover', 'Laundry Stain Remover'), (1954, 'laundry-starch', 'Laundry Starch'),
                        (1996, 'lime-mineral-remover', 'Lime or Mineral Remover'), (2025, 'metal-polish', 'Metal Cleaner & Polish'),
                        (2082, 'mould-mildew-cleaner', 'Mould and Mildew Cleaners'), (2125, 'oven-cleaner', 'Oven Cleaner'),
                        (2165, 'scouring-powder', 'Scouring Powder'), (2192, 'sink-tub-tile', 'Sink, Tub and Tile'),
                        (2239, 'shoe-care', 'Shoe Cleaners, Conditioners & Polish'), (2265, 'spot-remover', 'Spot Remover'),
                        (2302, 'toilet-bowl-cleaner', 'Toilet Bowl Cleaner and Deodorizer'), (2336, 'upholstery-cleaner', 'Upholstery Cleaner'),
                        (2370, 'vacuums', 'Vacuums'), (2397, 'window-cleaner', 'Window Cleaner')]:
    add(ln, 'category', slug, title, H)
add(2401, 'article', 'institutional-cleaners', 'Institutional & Industrial Cleaners', 'institutional')
P = 'personal-care'
add(2459, 'section', P, 'Cosmetics & Personal Care', P)
add(2524, 'article', 'personal-care-ingredients', 'Common Hazardous Ingredients in Personal Care Products', P, ingredients='personal-care')
add(2870, 'article', 'sources-and-resources', 'Sources and Resources', P)
add(2906, 'article', 'where-to-buy', 'Where to Buy Products', P)
groups = [
    (2945, 'makeup', 'Eye and Face Make-up', 'Spring 2011', [(2975, 'blush', 'Blush'), (3047, 'concealer', 'Concealer'), (3110, 'eyeliner', 'Eyeliner'),
        (3182, 'eye-shadow', 'Eye Shadow'), (3257, 'face-powder', 'Face Powder'), (3317, 'foundation', 'Foundation'), (3386, None, None),
        (3390, 'lipstick', 'Lipsticks and Lip Liners'), (3472, 'makeup-remover', 'Make-up Remover'), (3542, 'mascara', 'Mascara')]),
    (3608, 'dental', 'Dental and Oral Hygiene', 'Spring 2011', [(3610, 'dental-floss', 'Dental Floss'), (3628, 'denture-cleaners', 'Denture Cleaners'),
        (3641, 'mouthwash', 'Mouthwash'), (3700, 'toothpaste', 'Toothpaste'), (3773, 'tooth-whiteners', 'Tooth Whiteners')]),
    (3800, 'feminine-hygiene', 'Feminine Hygiene', 'Spring 2011', [(3811, 'douches', 'Douches'), (3834, 'menstrual-products', 'Tampons, Pads and other Menstrual Products')]),
    (3879, 'hair-care', 'Hair Care', 'Spring 2011', [(3881, 'conditioner', 'Conditioner'), (3983, 'hair-colouring', 'Hair Colouring'),
        (4043, 'hair-oils-pomades', 'Hair Oils and Pomades'), (4103, 'hair-relaxers', 'Hair Relaxers and Straighteners'), (4169, 'hair-styling', 'Hair Styling'),
        (4267, 'permanent-waves', 'Permanent Waves'), (4291, 'shampoo', 'Shampoo')]),
    (4402, 'hair-removal', 'Hair Removal', 'Spring 2011', [(4412, 'waxing-sugaring', 'Waxes & Sugaring Compounds')]),
    (4465, 'nail-products', 'Nail Products', 'Spring 2011', [(4470, 'nail-polish', 'Nail Polish'), (4548, 'nail-polish-remover', 'Nail Polish Remover'),
        (4581, 'artificial-nails', 'Artificial Nails')]),
    (4602, 'skin-products', 'Skin Products', 'Summer 2011', [(4604, 'toners', 'Astringents and Toners'), (4727, 'bath-products', 'Bath Products'),
        (4847, 'body-massage-oil', 'Body and Massage Oil'), (4926, 'body-powder', 'Body Powder'), (4997, 'body-wash', 'Cleansers and Body Washes'),
        (5131, 'deodorant', 'Deodorants and Antiperspirants'), (5273, 'exfoliants', 'Exfoliants and Scrubs'), (5377, 'facial-masks', 'Facial Masks and Steam Baths'),
        (5476, 'facial-mists', 'Facial Mists'), (5508, 'lip-balm', 'Lip Glosses, Balms and Protectors'), (5656, 'lotions-moisturizers', 'Lotions, Creams and Moisturizers'),
        (5840, 'lubricants', 'Lubricants'), (5888, 'shaving', 'Shaving Products'), (5968, 'after-shave', 'After Shave'), (6061, 'soap', 'Soap'),
        (6187, 'sun-protection', 'Sun Protection')]),
]
for gl, gslug, gtitle, rev, cats in groups:
    add(gl, 'group', gslug, gtitle, P, gslug, revised=rev)
    for ln, slug, title in cats:
        if slug is None:
            add(ln, 'skip', '', '', '')
        else:
            add(ln, 'category', slug, title, P, gslug, revised=rev)
add(6361, 'article', 'maintenance-chemicals-in-schools', 'Maintenance Chemicals in Schools', 'institutional',
    byline='By Karen Robinson, CASLE (1996, revised 2003)')
add(6687, 'skip', '', '', '')
U = 'using-this-guide'
for ln, slug, title in [(6696, 'why-a-guide', 'Why a Guide to Less Toxic Products?'), (6745, 'who-needs-this-guide', 'Who Needs a Guide to Less Toxic Products?'),
                        (6792, 'product-selection-process', 'Our Product Selection Process'),
                        (6841, 'rating-categories', 'Our Categories: Best, Good, Less Toxic, and Simply Unscented'),
                        (6864, 'why-no-synthetic-fragrances', 'Why No Synthetic Fragrances?'),
                        (6930, 'unscented-vs-scent-free', 'Does "Unscented" Really Mean Scent-Free?'),
                        (6965, 'what-people-are-saying', 'What People Are Saying About the Guide'),
                        (7072, 'help-fund-the-guide', 'Help Fund the Guide to Less Toxic Products')]:
    add(ln, 'article', slug, title, U)
S.sort(key=lambda d: d['line'])

# PDF glue: two list items fused on one line (line 5212). Split and shift later headings.
_g = next(i for i, l in enumerate(L) if 'DeodorantDesert' in l)
L[_g:_g + 1] = ['  Burt\'s Bees Outdoor Herbal Deodorant', '  Desert Essence' + L[_g].split('DeodorantDesert Essence', 1)[1]]
for e in S:
    if e['line'] > _g + 1: e['line'] += 1
# ---------------------------------------------------------------- helpers
def ind(s): return len(s) - len(s.lstrip(' '))

TIER_RE = re.compile(r"^(Best|Good|Simply Unscented|Less[- ]?[Tt]oxic Alternatives?|Not as Good as Good[^\n]*|Avoid)\b(.*)$")
OTHER_RE = re.compile(r"^(Tips|Home-?made Alternatives?|Health Alert|Caution|Warning)\b(.*)$", re.I)

def tier_key(s):
    s0 = s.lower()
    if s0.startswith('best'): return 'best'
    if s0.startswith('good'): return 'good'
    if s0.startswith('simply'): return 'unscented'
    if s0.startswith('less'): return 'less-toxic'
    if s0.startswith('not as good'): return 'widely-available'
    if s0.startswith('avoid'): return 'avoid'
    return None

def is_marker(line):
    s = line.strip()
    if not s or len(s) > 140: return None
    i = ind(line)
    exact = re.match(r'^(Best|Good|Simply Unscented|Less[- ]?[Tt]oxic Alternatives?|Tips|Home-?made Alternatives?)$', s)
    if 2 <= i <= 8 and (i >= 3 or exact):
        m = TIER_RE.match(s)
        if m and (len(s) < 25 or s[len(m.group(1)):].lstrip().startswith('(') or s.lower().startswith('not as good')):
            return ('tier', tier_key(s), s)
        m = OTHER_RE.match(s)
        if m and len(s) < 40:
            k = m.group(1).lower()
            k = 'homemade' if k.startswith('home') else ('tips' if k == 'tips' else 'alert')
            return ('note', k, s)
    return None

def groups_of(lines):
    """split (indent, text) lines into blank-separated groups"""
    out, cur = [], []
    for l in lines:
        if l.strip(): cur.append(l)
        elif cur: out.append(cur); cur = []
    if cur: out.append(cur)
    return out

def join_prose(ls):
    return re.sub(r'\s+', ' ', ' '.join(x.strip() for x in ls)).strip()

def merge_broken(gs):
    """merge groups split by page breaks: group not ending a sentence + next starting lowercase"""
    out = []
    for g in gs:
        if out:
            prev = out[-1][-1].strip(); first = g[0].strip()
            if prev and prev[-1] not in '.:!?)"' and first[:1].islower() and ind(g[0]) == ind(out[-1][-1]):
                out[-1] = out[-1] + g; continue
        out.append(g)
    return out

def prose_blocks(lines):
    """generic: paragraphs and bullet lists"""
    blocks = []
    for g in merge_broken(groups_of(lines)):
        deep = [l for l in g if ind(l) >= 8]
        if len(deep) == len(g):
            items = []
            for l in g:
                if items and (ind(l) > 10 or l.strip()[:1].islower()) and not items[-1].endswith('.'):
                    items[-1] += ' ' + l.strip()
                elif items and ind(l) >= 10 and len(items[-1]) > 95:
                    items[-1] += ' ' + l.strip()
                else:
                    items.append(l.strip())
            if blocks and blocks[-1]['type'] == 'list': blocks[-1]['items'] += items
            else: blocks.append({'type': 'list', 'items': items})
        else:
            short = all(len(l.strip()) < 70 for l in g)
            if short and len(g) > 1 and not g[-1].strip().endswith('.'):
                blocks.append({'type': 'lines', 'lines': [l.strip() for l in g]})
            else:
                blocks.append({'type': 'p', 'text': join_prose(g)})
    return blocks

LOWBRAND = re.compile(r"^(bare[A-Za-z]*|rms beauty|evanHealy|face naturals)\b")
GLUES = [('DeodorantDesert', 'Deodorant\n  Desert')]

def tier_items(lines):
    """items and notes inside a rating block"""
    items, notes = [], []
    for g in merge_broken(groups_of(lines)):
        txt = join_prose(g)
        longlines = [l for l in g if len(l.strip()) >= 100]
        prose = txt.endswith('.') and (len(longlines) >= 1 and len(g) >= 2 or len(g) == 1 and len(txt) > 110) and not re.search(r'www\.[^ ]+\.?$', txt)
        if prose and not re.match(r"^[A-Z0-9][\w'&.!]+(\s[\w'&.!]+){0,4}\s[-–]\s", txt):
            notes.append(txt); continue
        cur = None; lastlen = 0
        if items and g[0].strip()[:1].islower() and not LOWBRAND.match(g[0].strip()):
            items[-1] += ' ' + join_prose(g); continue
        for l in g:
            s = l.strip()
            lowbrand = bool(LOWBRAND.match(s))
            complete = cur is not None and (cur.rstrip().endswith((')', '.')) or re.search(r'www\.\S+$', cur.rstrip()))
            cont = cur is not None and (
                (s[:1].islower() and not lowbrand) or s[:1] in '(;,' or cur.count('(') > cur.count(')')
                or cur.rstrip().endswith((';', ',', '-', '/', '&', ' and', ' or')) or (lastlen >= 98 and not complete))
            if cont:
                cur += ' ' + s
            else:
                if cur: items.append(cur)
                cur = s
            lastlen = len(l.rstrip())
        if cur: items.append(cur)
    return items, notes

def body_blocks(lines, start_line):
    """split category body into prose / tier / note blocks"""
    blocks, buf, mode = [], [], None  # mode = None | ('tier',key,label) | ('note',key,label)
    def flush():
        nonlocal buf
        if mode is None:
            blocks.extend(prose_blocks(buf))
        elif mode[0] == 'tier':
            items, notes = tier_items(buf)
            blocks.append({'type': 'tier', 'tier': mode[1], 'label': mode[2], 'items': items, 'notes': notes})
        else:
            blocks.append({'type': mode[1], 'label': mode[2], 'blocks': prose_blocks(buf)})
        buf = []
    pending_label = False
    for l in lines:
        m = is_marker(l)
        if m:
            flush(); mode = m
            pending_label = m[2].count('(') > m[2].count(')')
            continue
        if pending_label and l.strip():
            mode = (mode[0], mode[1], mode[2] + ' ' + l.strip()); pending_label = False
            continue
        # a new top-level paragraph heading-like line after a note block ends the note
        buf.append(l)
    flush()
    # drop empty tier blocks
    return [b for b in blocks if not (b['type'] == 'tier' and not b['items'] and not b['notes'])]

# ---------------------------------------------------------------- products
GENERIC_START = re.compile(r"^(of course|pharmacies|central vac|for information|alcohol$|tsp$|untreated|unwaxed|microfib|cotton|wool |plain|glass|stainless|silicone|baking soda|vinegar|olive oil|vitamin e|aloe vera gel|lanolin|100% cotton|any |a |an |the following|most |many |some |look |check |use |try |cornstarch|food grade|essential oil|beeswax$|castile soap$|soap nuts|washing soda$|borax$|sea salt|epsom|hydrogen peroxide|lemon|salt$|wooden|hardwood|solid wood|central vacuums|hepa|dryerballs|lip balm with sun protection)", re.I)

def slugify(s):
    s = s.lower().replace('&', ' and ').replace("'", '')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:80].strip('-')

def parse_item(text):
    t = text.strip().rstrip('.')
    websites = re.findall(r'(?:https?://)?www\.[A-Za-z0-9.\-/]+[A-Za-z0-9/]', t)
    head = re.split(r'\s\(|\s-\s|\s–\s|\s--\s', t, 1)
    brand = None; name = None
    m = re.match(r"^(.{2,50}?)\s*[-–]\s+(.+)$", t)
    if m and not m.group(1).lower().startswith(('pre-', 'non-', 'e-')):
        brand = m.group(1).strip()
        rest = re.split(r'\s\(', m.group(2), 1)[0].strip()
        rest = rest.split(';')[0].strip()
        lower_desc = rest[:1].islower()
        if lower_desc: rest = re.split(r'[,.]', rest, 1)[0]
        name = f"{brand} {rest}" if lower_desc else f"{brand} {rest}" if not rest.lower().startswith(brand.lower()) else rest
    else:
        name = re.split(r'\s\(', t, 1)[0].strip()
    name = re.sub(r'(?:https?://)?www\.\S+', '', name)
    name = re.sub(r'\s+', ' ', name).strip(' ,;:-')
    if len(name) > 90: name = name[:90].rsplit(' ', 1)[0]
    generic = bool(GENERIC_START.match(t)) or (t[:1].islower() and not LOWBRAND.match(t))
    return dict(name=name, brand=brand, websites=websites, generic=generic)

# ---------------------------------------------------------------- ingredient lists
def parse_ingredients(blocks):
    out, intro = [], []
    for b in blocks:
        if b['type'] != 'p':
            if out: out[-1]['blocks'].append(b)
            else: intro.append(b)
            continue
        m = re.match(r"^([A-Z0-9][^.]{1,70}?)\s*[-–]\s+(.*)$", b['text'])
        if m and not m.group(1).startswith(('In ', 'The ', 'This ', 'Note', 'Sources')) and len(m.group(1).split()) <= 9:
            out.append({'name': m.group(1).strip(), 'blocks': [{'type': 'p', 'text': m.group(2).strip()}]})
        elif out and not b['text'].startswith(('Sources', 'In preparing')):
            out[-1]['blocks'].append(b)
        else:
            intro.append(b)
    return intro, out

# ---------------------------------------------------------------- walk
sections = OrderedDict()
SECTION_META = {
    'about': ('About EHANS', None),
    'consumer-advice': ('Consumer Advice', None),
    'baby-care': ('Baby Care', None),
    'chemical-hazards': ('Chemical Hazards', None),
    'household-cleaners': ('Household Cleaners', None),
    'institutional': ('Institutional & Schools', None),
    'personal-care': ('Cosmetics & Personal Care', None),
    'using-this-guide': ('Using This Guide', None),
}
for k, (t, _) in SECTION_META.items():
    sections[k] = {'slug': k, 'title': t, 'intro': [], 'groups': [], 'categories': [], 'articles': []}

categories, articles, groups_out, products, ingredients = [], [], [], OrderedDict(), []
pcount = 0
for idx, e in enumerate(S):
    if e['kind'] == 'skip': continue
    end = S[idx + 1]['line'] - 1 if idx + 1 < len(S) else len(L)
    lines = L[e['line']:end]  # skip heading line itself
    # drop duplicated heading lines and bylines
    while lines and (lines[0].strip() in (e['title'], 'Maintenance Chemicals in Schools', 'Shoe Polish') or lines[0].strip().startswith('By Karen Robinson')):
        lines = lines[1:]
    if e['kind'] == 'section':
        # drop table-of-contents list right after heading
        k = 0
        while k < len(lines) and (not lines[k].strip() or ind(lines[k]) >= 8 or lines[k].strip().startswith('See also')):
            k += 1
        blocks = prose_blocks(lines[k:])
        sections[e['section']]['intro'] = blocks
        continue
    if e['kind'] == 'group':
        blocks = body_blocks(lines, e['line'])
        groups_out.append({'slug': e['slug'], 'title': e['title'], 'section': e['section'], 'revised': e.get('revised'), 'blocks': blocks, 'categories': []})
        sections[e['section']]['groups'].append(e['slug'])
        continue
    if e['kind'] == 'article':
        blocks = body_blocks(lines, e['line'])
        art = {'slug': e['slug'], 'title': e['title'], 'section': e['section'], 'blocks': blocks}
        if e.get('byline'): art['byline'] = e['byline']
        if e.get('ingredients'):
            intro, ings = parse_ingredients(blocks)
            art['blocks'] = intro
            art['ingredientContext'] = e['ingredients']
            for ing in ings:
                ingredients.append({'slug': slugify(ing['name'].split('(')[0])[:60], 'name': ing['name'], 'context': e['ingredients'], 'blocks': ing['blocks']})
        articles.append(art)
        sections[e['section']]['articles'].append(e['slug'])
        continue
    # category
    blocks = body_blocks(lines, e['line'])
    cat = {'slug': e['slug'], 'title': e['title'], 'section': e['section'], 'group': e.get('group'), 'revised': e.get('revised') or 'Early 2011', 'blocks': blocks}
    for b in blocks:
        if b['type'] != 'tier': continue
        new_items = []
        for it in b['items']:
            if it.strip()[:1].islower() and len(it) < 12 and new_items:
                new_items[-1]['text'] += ' ' + it; continue
            if it.strip() == 'Lip Balm with Sun Protection':
                new_items.append({'text': it, 'subhead': True}); continue
            p = parse_item(it)
            entry = {'text': it}
            if not p['generic'] and len(p['name']) >= 3:
                slug = slugify(p['name'])
                if slug not in products:
                    products[slug] = {'slug': slug, 'name': p['name'], 'brand': p['brand'], 'websites': [], 'appearances': []}
                pr = products[slug]
                pr['appearances'].append({'category': e['slug'], 'tier': b['tier'], 'text': it})
                for w in p['websites']:
                    if w not in pr['websites']: pr['websites'].append(w)
                entry['product'] = slug
            new_items.append(entry)
        b['items'] = new_items
    categories.append(cat)
    if e.get('group'):
        next(g for g in groups_out if g['slug'] == e['group'])['categories'].append(e['slug'])
    else:
        sections[e['section']]['categories'].append(e['slug'])

# ---------------------------------------------------------------- brands
# brand inference for items without "Brand - product" form
known = defaultdict(int)
for p in products.values():
    if p['brand']: known[p['brand'].lower()] += 1
pref = defaultdict(int)
for p in products.values():
    w = p['name'].split()
    for n in range(1, min(5, len(w)) + 1):
        pref[' '.join(w[:n]).lower()] += 1
WEAK = {'the', 'dr.', 'dr', 'mineral', 'simply', 'pure', 'natural', 'organic', 'earth', 'green', 'true', 'real', 'big', 'all', 'my', 'st.', 'la', 'le', 'de', 'el'}
for p in products.values():
    if p['brand']: continue
    w = p['name'].split()
    best = None
    for n in (4, 3, 2, 1):
        if len(w) > n and ' '.join(w[:n]).lower() in known: best = ' '.join(w[:n]); break
    if not best:
        n = 1
        if pref[w[0].lower()] >= 2:
            while n < min(4, len(w) - 1) and pref[' '.join(w[:n + 1]).lower()] == pref[' '.join(w[:n]).lower()]:
                n += 1
        elif len(w) > 2 and (w[0].lower() in WEAK or len(w[0]) <= 3 or (w[1][:1].isupper() and w[1].lower() not in ('eye', 'lip', 'lips', 'face', 'mineral', 'organic', 'natural', 'baby', 'hair', 'body', 'skin', 'nail'))):
            n = 2
        if w[0].lower() in WEAK and n == 1 and len(w) > 2: n = 2
        best = ' '.join(w[:n])
    p['brand'] = best.strip(' ,:-')
# normalise brand spellings and merge prefix variants (e.g. "Moonsnail" / "Moonsnail Soapworks")
def bkey(b): return re.sub(r'[^a-z0-9]', '', b.lower())
for p in products.values():
    p['brand'] = re.split(r'\s\(', p['brand'])[0].strip(' ,;:-/&')
cnt = defaultdict(int); spell = defaultdict(lambda: defaultdict(int))
for p in products.values():
    cnt[bkey(p['brand'])] += 1; spell[bkey(p['brand'])][p['brand']] += 1
keys = sorted(cnt, key=len)
canon = {}
for k in keys:
    target = k
    for a in keys:
        if a != k and len(a) >= 4 and k.startswith(a) and cnt[canon.get(a, a)] >= cnt[k]:
            target = canon.get(a, a); break
    canon[k] = target
for k in keys:
    t = canon[k]
    while canon.get(t, t) != t: t = canon[t]
    canon[k] = t
for p in products.values():
    k = canon[bkey(p['brand'])]
    p['brand'] = max(spell[k].items(), key=lambda kv: kv[1])[0] if spell[k] else p['brand']
brands = OrderedDict()
for p in products.values():
    bslug = slugify(p['brand'])
    p['brandSlug'] = bslug
    b = brands.setdefault(bslug, {'slug': bslug, 'name': p['brand'], 'products': [], 'websites': []})
    b['products'].append(p['slug'])
    for w in p['websites']:
        if w not in b['websites']: b['websites'].append(w)
    # product defaults for the 2026 layer
    p.update({'status': 'unverified', 'officialUrl': None, 'affiliateUrl': None, 'update2026': None, 'lastVerified': None})

# dedupe ingredient slugs
seen = set()
for i in ingredients:
    s = i['slug'] or 'ingredient'
    while s in seen: s += '-' + i['context'][:4]
    seen.add(s); i['slug'] = s

data = {
    'source': {
        'title': 'The Guide to Less Toxic Products',
        'publisher': 'Environmental Health Association of Nova Scotia (EHANS)',
        'url': 'http://www.lesstoxicguide.ca',
        'lastRevised': 'Spring/Summer 2011',
        'copyright': '© 2004 Environmental Health Association of Nova Scotia. All Rights Reserved.',
    },
    'sections': list(sections.values()), 'groups': groups_out, 'categories': categories,
    'articles': articles, 'products': list(products.values()), 'brands': list(brands.values()), 'ingredients': ingredients,
}
json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('categories', len(categories), 'articles', len(articles), 'groups', len(groups_out), 'products', len(products),
      'brands', len(brands), 'ingredients', len(ingredients))
