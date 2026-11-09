import re, sys, io
from docx import Document
from docx.shared import Pt, Inches, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

src, dst = sys.argv[1], sys.argv[2]
DOC_TITLE = sys.argv[3] if len(sys.argv) > 3 else 'Watts Up — IT Summary and Security Assessment'
lines = io.open(src, encoding='utf-8').read().split('\n')

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(11)
sec.left_margin = sec.right_margin = Inches(0.9)
sec.top_margin = sec.bottom_margin = Inches(0.9)
CONTENT_W = 8.5 - 1.8

st = doc.styles['Normal']
st.font.name = 'Calibri'; st.font.size = Pt(10.5)
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')
st.paragraph_format.space_after = Pt(5)
for name, size, color in (('Heading 1', 20, '1F3864'), ('Heading 2', 14, '1F3864'), ('Heading 3', 11.5, '2F5496')):
    h = doc.styles[name]
    h.font.name = 'Calibri'; h.font.size = Pt(size); h.font.bold = True
    h.font.color.rgb = RGBColor.from_string(color)
    h.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')
    h.paragraph_format.space_before = Pt(14 if name != 'Heading 1' else 0)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True

INLINE = re.compile(r'(\*\*.+?\*\*(?!\*)|`[^`]+`|\*[^*\s][^*]*?\*)')

def add_runs(p, text, base_bold=False, base_italic=False, size=None):
    for part in INLINE.split(text):
        if not part:
            continue
        if part.startswith('**') and part.endswith('**') and len(part) > 4:
            add_runs(p, part[2:-2], True, base_italic, size); continue
        if part.startswith('*') and part.endswith('*') and len(part) > 2 and not part.startswith('**'):
            add_runs(p, part[1:-1], base_bold, True, size); continue
        code = False
        if part.startswith('`') and part.endswith('`') and len(part) > 2:
            part = part[1:-1]; code = True
        r = p.add_run(part)
        r.bold = base_bold; r.italic = base_italic
        if size: r.font.size = Pt(size)
        if code:
            r.font.name = 'Consolas'
            r._element.rPr.rFonts.set(qn('w:eastAsia'), 'Consolas')
            r.font.size = Pt((size or 10.5) - 1)
            shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), 'EEF1F6')
            r._element.rPr.append(shd)

def shade(cell, fill):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), fill)
    tcPr.append(shd)

def cell_margins(table):
    tblPr = table._element.tblPr
    m = OxmlElement('w:tblCellMar')
    for side, w in (('top', 40), ('left', 90), ('bottom', 40), ('right', 90)):
        e = OxmlElement('w:' + side); e.set(qn('w:w'), str(w)); e.set(qn('w:type'), 'dxa'); m.append(e)
    tblPr.append(m)

def add_table(rows):
    ncol = len(rows[0])
    t = doc.add_table(rows=len(rows), cols=ncol)
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    cell_margins(t)
    # column widths from content length (clamped)
    wts = []
    for c in range(ncol):
        L = [len(re.sub(r'[*`]', '', r[c])) for r in rows if c < len(r)]
        wts.append(min(max(sum(L) / len(L), 9), 70))
    tot = sum(wts)
    widths = [Inches(CONTENT_W * w / tot) for w in wts]
    for ri, r in enumerate(rows):
        for ci in range(ncol):
            cell = t.cell(ri, ci)
            cell.width = widths[ci]
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            txt = r[ci] if ci < len(r) else ''
            add_runs(p, txt, base_bold=(ri == 0), size=9.5)
            if ri == 0:
                shade(cell, 'D9E2F3')
    # repeat header row
    trPr = t.rows[0]._tr.get_or_add_trPr()
    h = OxmlElement('w:tblHeader'); h.set(qn('w:val'), 'true'); trPr.append(h)
    for row in t.rows:
        trPr = row._tr.get_or_add_trPr()
        cs = OxmlElement('w:cantSplit'); cs.set(qn('w:val'), 'true'); trPr.append(cs)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

def para_border_bottom(p):
    pPr = p._p.get_or_add_pPr()
    b = OxmlElement('w:pBdr'); bt = OxmlElement('w:bottom')
    bt.set(qn('w:val'), 'single'); bt.set(qn('w:sz'), '8'); bt.set(qn('w:space'), '1'); bt.set(qn('w:color'), '8EAADB')
    b.append(bt); pPr.append(b)

i = 0
while i < len(lines):
    ln = lines[i]
    if not ln.strip():
        i += 1; continue
    m = re.match(r'^(#{1,3})\s+(.*)$', ln)
    if m:
        level = len(m.group(1))
        p = doc.add_paragraph(style='Heading %d' % level)
        add_runs(p, m.group(2))
        if level == 1:
            para_border_bottom(p)
        i += 1; continue
    if ln.lstrip().startswith('|'):
        block = []
        while i < len(lines) and lines[i].lstrip().startswith('|'):
            block.append(lines[i]); i += 1
        rows = []
        for b in block:
            cells = [c.strip() for c in b.strip().strip('|').split('|')]
            if all(re.match(r'^:?-{2,}:?$', c) for c in cells):
                continue
            rows.append(cells)
        add_table(rows); continue
    m = re.match(r'^(\s*)-\s+(.*)$', ln)
    if m:
        # bullet; gather continuation lines (indented, not starting a new item)
        text = m.group(2); i += 1
        while i < len(lines) and lines[i].startswith('  ') and not re.match(r'^\s*-\s+', lines[i]) and lines[i].strip():
            text += ' ' + lines[i].strip(); i += 1
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        add_runs(p, text); continue
    m = re.match(r'^(\d+)\.\s+(.*)$', ln)
    if m:
        num, text = m.group(1), m.group(2); i += 1
        while i < len(lines) and lines[i].startswith('   ') and lines[i].strip():
            text += ' ' + lines[i].strip(); i += 1
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.3)
        p.paragraph_format.first_line_indent = Inches(-0.25)
        p.paragraph_format.space_after = Pt(3)
        add_runs(p, num + '.  ' + text); continue
    # plain paragraph (merge following non-blank, non-special lines)
    text = ln.strip(); i += 1
    while i < len(lines) and lines[i].strip() and not re.match(r'^(#{1,3}\s|\||\s*-\s|\d+\.\s)', lines[i]):
        text += ' ' + lines[i].strip(); i += 1
    p = doc.add_paragraph()
    add_runs(p, text)

# header / footer
hp = sec.header.paragraphs[0]
hp.text = DOC_TITLE
hp.runs[0].font.size = Pt(8.5); hp.runs[0].font.color.rgb = RGBColor(0x59, 0x59, 0x59)
fp = sec.footer.paragraphs[0]
fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
def fld(par, code):
    r = par.add_run(); r.font.size = Pt(8.5)
    a = OxmlElement('w:fldChar'); a.set(qn('w:fldCharType'), 'begin')
    b = OxmlElement('w:instrText'); b.set(qn('xml:space'), 'preserve'); b.text = code
    c = OxmlElement('w:fldChar'); c.set(qn('w:fldCharType'), 'end')
    r._r.append(a); r._r.append(b); r._r.append(c)
r = fp.add_run('Page '); r.font.size = Pt(8.5)
fld(fp, 'PAGE')
r = fp.add_run(' of '); r.font.size = Pt(8.5)
fld(fp, 'NUMPAGES')

doc.core_properties.title = DOC_TITLE
doc.core_properties.author = 'Watts Up project'
doc.save(dst)
print('saved', dst)
