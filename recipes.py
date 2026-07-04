from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, PageBreak, HRFlowable, Image, KeepTogether)
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.platypus.flowables import Flowable
from PIL import Image as PILImage
import io, os

# ─── COLOUR PALETTE ───────────────────────────────────────────────────────────
DARK_BG      = colors.HexColor("#1A1008")   # near-black chocolate
BROWN_DEEP   = colors.HexColor("#3D1F00")   # dark espresso
BROWN_MID    = colors.HexColor("#6B3A1F")   # rich cacao
AMBER        = colors.HexColor("#C8701A")   # warm amber / gold
AMBER_LIGHT  = colors.HexColor("#E8922A")   # highlight
CREAM        = colors.HexColor("#F5EDD6")   # parchment cream
CREAM_DARK   = colors.HexColor("#E8D9B8")   # slightly darker parchment
OFF_WHITE    = colors.HexColor("#FAF6ED")
TEXT_DARK    = colors.HexColor("#1E0E00")   # near-black for body text
TEXT_MID     = colors.HexColor("#3D1F00")
ACCENT_TEAL  = colors.HexColor("#1A6B6B")   # science callout accent
ACCENT_RED   = colors.HexColor("#8B1A1A")   # warning accent

PAGE_W, PAGE_H = A4
MARGIN = 22*mm
LOGO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Logo.png")

# ─── PAGE TEMPLATE ────────────────────────────────────────────────────────────
class PageTemplate:
    def __init__(self, module_name=""):
        self.module_name = module_name

    def draw_background(self, c, doc):
        """Full dark background with decorative elements."""
        c.saveState()
        # Full page dark background
        c.setFillColor(DARK_BG)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

        # Decorative side panel — left
        c.setFillColor(BROWN_DEEP)
        c.rect(0, 0, 14*mm, PAGE_H, fill=1, stroke=0)

        # Thin amber line inside left panel
        c.setFillColor(AMBER)
        c.rect(12*mm, 0, 1.5*mm, PAGE_H, fill=1, stroke=0)

        # Top header bar
        c.setFillColor(BROWN_DEEP)
        c.rect(0, PAGE_H - 22*mm, PAGE_W, 22*mm, fill=1, stroke=0)
        c.setFillColor(AMBER)
        c.rect(0, PAGE_H - 23.5*mm, PAGE_W, 1.5*mm, fill=1, stroke=0)

        # Bottom footer bar
        c.setFillColor(BROWN_DEEP)
        c.rect(0, 0, PAGE_W, 16*mm, fill=1, stroke=0)
        c.setFillColor(AMBER)
        c.rect(0, 15.5*mm, PAGE_W, 1.5*mm, fill=1, stroke=0)

        # Corner ornament dots
        for x, y in [(16*mm, PAGE_H - 11*mm), (PAGE_W - 10*mm, PAGE_H - 11*mm)]:
            c.setFillColor(AMBER)
            c.circle(x, y, 1.5*mm, fill=1, stroke=0)

        c.restoreState()

    def draw_header(self, c, doc):
        c.saveState()
        # Logo (small, top-left corner area)
        try:
            logo_size = 14*mm
            c.drawImage(LOGO_PATH, 16*mm, PAGE_H - 20*mm, width=logo_size, height=logo_size,
                        mask='auto', preserveAspectRatio=True)
        except:
            pass

        # Module name in header
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(AMBER_LIGHT)
        c.drawString(34*mm, PAGE_H - 12*mm, "HARSH CAKE ZONE  ·  BAKING MASTERCLASS")

        # Module name right
        if self.module_name:
            c.setFont("Helvetica", 7)
            c.setFillColor(CREAM_DARK)
            text_w = c.stringWidth(self.module_name, "Helvetica", 7)
            c.drawString(PAGE_W - MARGIN - text_w, PAGE_H - 12*mm, self.module_name)

        c.restoreState()

    def draw_footer(self, c, doc):
        c.saveState()
        # Page number
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(AMBER)
        page_text = f"Page  {doc.page}"
        c.drawCentredString(PAGE_W / 2, 6*mm, page_text)

        # Left footer text
        c.setFont("Helvetica", 7)
        c.setFillColor(CREAM_DARK)
        c.drawString(16*mm, 6*mm, "Harsh Gajjar  |  @harsh_cake_zone")

        # Right footer
        c.drawRightString(PAGE_W - 10*mm, 6*mm, "+91 88663 19009")
        c.restoreState()

    def __call__(self, c, doc):
        self.draw_background(c, doc)
        self.draw_header(c, doc)
        self.draw_footer(c, doc)


# ─── STYLES ───────────────────────────────────────────────────────────────────
def make_styles():
    s = {}

    s['cover_title'] = ParagraphStyle('cover_title',
        fontName='Helvetica-Bold', fontSize=46, textColor=AMBER,
        alignment=TA_CENTER, leading=56, spaceAfter=6)

    s['cover_sub'] = ParagraphStyle('cover_sub',
        fontName='Helvetica', fontSize=16, textColor=CREAM,
        alignment=TA_CENTER, leading=22, spaceAfter=4)

    s['cover_tagline'] = ParagraphStyle('cover_tagline',
        fontName='Helvetica-Bold', fontSize=10, textColor=AMBER_LIGHT,
        alignment=TA_CENTER, leading=14, spaceAfter=2, letterSpacing=2)

    s['cover_info'] = ParagraphStyle('cover_info',
        fontName='Helvetica', fontSize=11, textColor=CREAM_DARK,
        alignment=TA_CENTER, leading=18)

    s['module_chapter'] = ParagraphStyle('module_chapter',
        fontName='Helvetica-Bold', fontSize=22, textColor=AMBER,
        alignment=TA_CENTER, leading=28, spaceBefore=6, spaceAfter=4)

    s['module_subtitle'] = ParagraphStyle('module_subtitle',
        fontName='Helvetica', fontSize=12, textColor=CREAM,
        alignment=TA_CENTER, leading=16, spaceAfter=16)

    s['h1'] = ParagraphStyle('h1',
        fontName='Helvetica-Bold', fontSize=16, textColor=AMBER,
        leading=20, spaceBefore=18, spaceAfter=6,
        leftIndent=0, borderPad=0)

    s['h2'] = ParagraphStyle('h2',
        fontName='Helvetica-Bold', fontSize=13, textColor=AMBER_LIGHT,
        leading=17, spaceBefore=14, spaceAfter=5)

    s['h3'] = ParagraphStyle('h3',
        fontName='Helvetica-Bold', fontSize=11, textColor=CREAM,
        leading=15, spaceBefore=10, spaceAfter=4)

    s['body'] = ParagraphStyle('body',
        fontName='Helvetica', fontSize=9.5, textColor=CREAM_DARK,
        leading=15, spaceBefore=3, spaceAfter=3, alignment=TA_JUSTIFY)

    s['body_bold'] = ParagraphStyle('body_bold',
        fontName='Helvetica-Bold', fontSize=9.5, textColor=CREAM,
        leading=15, spaceBefore=2, spaceAfter=2)

    s['bullet'] = ParagraphStyle('bullet',
        fontName='Helvetica', fontSize=9.5, textColor=CREAM_DARK,
        leading=14, spaceBefore=2, spaceAfter=2, leftIndent=14,
        bulletIndent=4, bulletFontName='Helvetica', bulletFontSize=9.5)

    s['sub_bullet'] = ParagraphStyle('sub_bullet',
        fontName='Helvetica', fontSize=9, textColor=CREAM_DARK,
        leading=13, spaceBefore=1, spaceAfter=1, leftIndent=26,
        bulletIndent=16)

    s['science_box'] = ParagraphStyle('science_box',
        fontName='Helvetica', fontSize=9.5, textColor=colors.HexColor("#C8F0F0"),
        leading=14, spaceBefore=2, spaceAfter=2)

    s['warning_box'] = ParagraphStyle('warning_box',
        fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.HexColor("#FFD0D0"),
        leading=14, spaceBefore=2, spaceAfter=2)

    s['tip_box'] = ParagraphStyle('tip_box',
        fontName='Helvetica', fontSize=9.5, textColor=colors.HexColor("#FFF0C0"),
        leading=14, spaceBefore=2, spaceAfter=2)

    s['recipe_label'] = ParagraphStyle('recipe_label',
        fontName='Helvetica-Bold', fontSize=10, textColor=AMBER,
        leading=14, spaceBefore=2, spaceAfter=2)

    s['toc_module'] = ParagraphStyle('toc_module',
        fontName='Helvetica-Bold', fontSize=12, textColor=AMBER,
        leading=18, spaceBefore=6, spaceAfter=2)

    s['toc_item'] = ParagraphStyle('toc_item',
        fontName='Helvetica', fontSize=10, textColor=CREAM_DARK,
        leading=15, spaceBefore=1, spaceAfter=1, leftIndent=16)

    return s


# ─── CUSTOM FLOWABLES ─────────────────────────────────────────────────────────
class ColorBox(Flowable):
    """Colored background box for callouts."""
    def __init__(self, content_paragraphs, bg_color, border_color,
                 pad=8, radius=4):
        Flowable.__init__(self)
        self.content = content_paragraphs
        self.bg = bg_color
        self.border = border_color
        self.pad = pad
        self.radius = radius
        self._content_height = None

    def wrap(self, availW, availH):
        inner_w = availW - self.pad * 2
        total_h = self.pad
        for p in self.content:
            w, h = p.wrap(inner_w, availH)
            total_h += h + 4  # slightly more spacing to prevent clipping
        total_h += self.pad
        self.width = availW
        self.height = total_h
        self._inner_w = inner_w
        return availW, total_h

    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(self.bg)
        c.setStrokeColor(self.border)
        c.setLineWidth(1.2)
        c.roundRect(0, 0, self.width, self.height, self.radius, fill=1, stroke=1)
        y = self.height - self.pad
        for p in self.content:
            w, h = p.wrap(self._inner_w, self.height)
            y -= h
            p.drawOn(c, self.pad, max(y, self.pad / 2))
            y -= 4
        c.restoreState()


class DividerLine(Flowable):
    def __init__(self, color=AMBER, thickness=0.8, space_before=6, space_after=6):
        Flowable.__init__(self)
        self.color = color
        self.thickness = thickness
        self.sb = space_before
        self.sa = space_after

    def wrap(self, w, h):
        self.width = w
        self.height = self.thickness + self.sb + self.sa
        return w, self.height

    def draw(self):
        c = self.canv
        c.setStrokeColor(self.color)
        c.setLineWidth(self.thickness)
        c.line(0, self.sa, self.width, self.sa)


class SectionBadge(Flowable):
    """Amber pill badge for section labels."""
    def __init__(self, text, font_size=9):
        Flowable.__init__(self)
        self.text = text
        self.font_size = font_size

    def wrap(self, w, h):
        self.width = w
        self.height = 7*mm
        return w, self.height

    def draw(self):
        c = self.canv
        c.saveState()
        tw = c.stringWidth(self.text, "Helvetica-Bold", self.font_size)
        bw = tw + 12
        c.setFillColor(AMBER)
        c.roundRect(0, 1*mm, bw, 5*mm, 2.5*mm, fill=1, stroke=0)
        c.setFillColor(DARK_BG)
        c.setFont("Helvetica-Bold", self.font_size)
        c.drawString(6, 2.8*mm, self.text)
        c.restoreState()


# ─── BUILDER HELPERS ──────────────────────────────────────────────────────────
def S(styles): return styles  # alias

def h1(text, styles):
    items = []
    items.append(Spacer(1, 4))
    items.append(Paragraph(text, styles['h1']))
    items.append(HRFlowable(width="100%", thickness=0.6, color=AMBER, spaceAfter=4))
    return items

def h2(text, styles):
    return [Paragraph(text, styles['h2'])]

def h3(text, styles):
    return [Paragraph(text, styles['h3'])]

def body(text, styles):
    return [Paragraph(text, styles['body'])]

def bullet(text, styles, sub=False):
    key = 'sub_bullet' if sub else 'bullet'
    return [Paragraph(f"◆  {text}", styles[key])]

def science_box(title, items_list, styles):
    bg = colors.HexColor("#0D2E2E")
    border = colors.HexColor("#1A6B6B")
    paras = [Paragraph(f"<b>🔬 {title}</b>", styles['science_box'])]
    for item in items_list:
        paras.append(Paragraph(f"• {item}", styles['science_box']))
    return [ColorBox(paras, bg, border, pad=10)]

def warning_box(title, items_list, styles):
    bg = colors.HexColor("#2E0D0D")
    border = colors.HexColor("#8B1A1A")
    paras = [Paragraph(f"<b>⚠️  {title}</b>", styles['warning_box'])]
    for item in items_list:
        paras.append(Paragraph(f"  {item}", styles['warning_box']))
    return [ColorBox(paras, bg, border, pad=10)]

def tip_box(title, items_list, styles):
    bg = colors.HexColor("#2E2200")
    border = colors.HexColor("#C8701A")
    paras = [Paragraph(f"<b>💡 {title}</b>", styles['tip_box'])]
    for item in items_list:
        paras.append(Paragraph(f"  {item}", styles['tip_box']))
    return [ColorBox(paras, bg, border, pad=10)]

def recipe_ingredient_table(ingredients, styles):
    """Two-column ingredient table."""
    data = [["INGREDIENT", "QUANTITY"]]
    for ing, qty in ingredients:
        data.append([ing, qty])
    t = Table(data, colWidths=["60%", "40%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#2A1400")),
        ('TEXTCOLOR', (0,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#2A1400"), colors.HexColor("#221000")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    return [Spacer(1, 4), t, Spacer(1, 6)]

def steps_table(steps, styles):
    """Numbered steps in a styled box."""
    data = []
    for i, step in enumerate(steps, 1):
        data.append([f"{i}", step])
    t = Table(data, colWidths=["8%", "92%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), BROWN_DEEP),
        ('TEXTCOLOR', (0,0), (0,-1), AMBER),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (0,-1), 11),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor("#220F00")),
        ('TEXTCOLOR', (1,0), (1,-1), CREAM_DARK),
        ('FONTNAME', (1,0), (1,-1), 'Helvetica'),
        ('FONTSIZE', (1,0), (1,-1), 9.5),
        ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor("#3D1F00")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('ROWBACKGROUNDS', (1,0), (1,-1), [colors.HexColor("#220F00"), colors.HexColor("#1A0A00")]),
    ]))
    return [Spacer(1, 4), t, Spacer(1, 6)]

def two_col_table(left_items, right_items, styles):
    """Side-by-side two column layout."""
    left_text = "<br/>".join([f"◆ {i}" for i in left_items])
    right_text = "<br/>".join([f"◆ {i}" for i in right_items])
    data = [[Paragraph(left_text, styles['bullet']), Paragraph(right_text, styles['bullet'])]]
    t = Table(data, colWidths=["50%", "50%"])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    return [t]

def info_table(data_rows, styles):
    """General info table."""
    t = Table(data_rows, colWidths=["30%", "25%", "25%", "20%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#2A1400")),
        ('TEXTCOLOR', (0,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#2A1400"), colors.HexColor("#221000")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    return [Spacer(1, 4), t, Spacer(1, 6)]

# ─── MODULE DIVIDER PAGE ──────────────────────────────────────────────────────
def module_divider(module_num, title, subtitle, styles):
    """Full decorative module divider page."""
    story = [PageBreak()]
    story.append(Spacer(1, 55*mm))

    # Module number badge area
    num_style = ParagraphStyle('num_badge', fontName='Helvetica-Bold', fontSize=72,
                               textColor=colors.HexColor("#3D1F00"), alignment=TA_CENTER, leading=80)
    story.append(Paragraph(f"0{module_num}", num_style))

    story.append(Spacer(1, 2*mm))
    story.append(HRFlowable(width="60%", thickness=2, color=AMBER,
                             hAlign='CENTER', spaceAfter=6, spaceBefore=6))

    label_style = ParagraphStyle('mod_label', fontName='Helvetica-Bold', fontSize=10,
                                  textColor=AMBER_LIGHT, alignment=TA_CENTER, letterSpacing=4)
    story.append(Paragraph("MODULE", label_style))
    story.append(Spacer(1, 6))

    title_style = ParagraphStyle('mod_title', fontName='Helvetica-Bold', fontSize=28,
                                  textColor=CREAM, alignment=TA_CENTER, leading=36)
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 6))

    sub_style = ParagraphStyle('mod_sub', fontName='Helvetica', fontSize=12,
                                textColor=CREAM_DARK, alignment=TA_CENTER, leading=18)
    story.append(Paragraph(subtitle, sub_style))

    story.append(PageBreak())
    return story


# ─── COVER PAGE ───────────────────────────────────────────────────────────────
def build_cover(styles):
    story = []

    story.append(Spacer(1, 18*mm))

    # Logo centered, large
    try:
        logo = Image(LOGO_PATH, width=60*mm, height=60*mm)
        logo.hAlign = 'CENTER'
        story.append(logo)
    except:
        pass

    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width="70%", thickness=2, color=AMBER, hAlign='CENTER',
                             spaceAfter=8, spaceBefore=4))

    story.append(Paragraph("HARSH CAKE ZONE", styles['cover_tagline']))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("BAKING MASTERCLASS", styles['cover_title']))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph("Complete Beginner to Professional", styles['cover_sub']))
    story.append(Spacer(1, 2*mm))

    sub2_style = ParagraphStyle('sub2', fontName='Helvetica', fontSize=12,
                                 textColor=AMBER_LIGHT, alignment=TA_CENTER)
    story.append(Paragraph("5-Module Comprehensive Course Notes", sub2_style))

    story.append(HRFlowable(width="70%", thickness=2, color=AMBER, hAlign='CENTER',
                             spaceAfter=10, spaceBefore=10))

    story.append(Spacer(1, 6*mm))

    # Info box
    info_bg = colors.HexColor("#2A1400")
    info_data = [
        [Paragraph("<b>Instructor</b>", styles['cover_info']),
         Paragraph("Harsh Gajjar", styles['cover_info'])],
        [Paragraph("<b>Instagram</b>", styles['cover_info']),
         Paragraph("@harsh_cake_zone", styles['cover_info'])],
        [Paragraph("<b>WhatsApp</b>", styles['cover_info']),
         Paragraph("+91 88663 19009", styles['cover_info'])],
        [Paragraph("<b>Modules</b>", styles['cover_info']),
         Paragraph("5 Comprehensive Modules", styles['cover_info'])],
    ]
    t = Table(info_data, colWidths=[50*mm, 80*mm], hAlign='CENTER')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), info_bg),
        ('TEXTCOLOR', (0,0), (0,-1), AMBER_LIGHT),
        ('TEXTCOLOR', (1,0), (1,-1), CREAM),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#4A2A00")),
        ('ROUNDEDCORNERS', [4]),
    ]))
    story.append(t)

    story.append(Spacer(1, 8*mm))
    tagline_style = ParagraphStyle('tagline2', fontName='Helvetica', fontSize=10,
                                    textColor=CREAM_DARK, alignment=TA_CENTER, fontStyle='italic')
    story.append(Paragraph('"Precision, Passion &amp; Professional Technique"', tagline_style))

    story.append(PageBreak())
    return story


# ─── TABLE OF CONTENTS ────────────────────────────────────────────────────────
def build_toc(styles):
    story = []
    story.append(Spacer(1, 8*mm))
    story.append(Paragraph("TABLE OF CONTENTS", ParagraphStyle('toc_head',
        fontName='Helvetica-Bold', fontSize=22, textColor=AMBER, alignment=TA_CENTER,
        spaceAfter=4)))
    story.append(HRFlowable(width="100%", thickness=1.5, color=AMBER, spaceAfter=10))

    modules = [
        ("Module 1", "Course Introduction & Equipment Guide",
         ["Course roadmap", "Measuring & Preparation tools", "Baking Essentials",
          "Frosting & Decorating tools", "Chocolate Making tools", "Packaging & Storage",
          "Essential Flavors & Consumables"]),
        ("Module 2", "Master Sponges & Baking Science",
         ["Ingredient Science", "Master Vanilla Premix recipe", "Baking the Sponge — OTG & Tawa",
          "Cooling & Storage rules", "Chocolate & Red Velvet variations",
          "Fruit & Fusion Sponges"]),
        ("Module 3", "Creams, Ganache & Cake Assembly",
         ["Tin Sizes & Layering Guide", "Dairy vs. Non-Dairy Cream",
          "Whipping Cream technique", "Step-by-step Assembly",
          "Soaking, Layering & Filling", "Crumb Coat & Sharp Edges",
          "Chocolate Ganache (1:1 and 1:2 ratios)"]),
        ("Module 4", "Gourmet Cupcakes & The Ultimate Brownie",
         ["Cupcake batter science", "Cupcake formula & yield", "Baking instructions",
          "Flavor variations & fillings", "Signature Dark Fudge Brownie recipe",
          "Brownie science & baking", "Storage rules"]),
        ("Module 5", "The Art of Chocolates",
         ["Compound vs. Couverture chocolate", "Melting techniques",
          "Mix-in chocolates (Almond, Butterscotch, Fusions)",
          "Center-filled chocolates (Shell technique)",
          "Truffle, Fruit, Salted Caramel fillings",
          "Storage, condensation & transportation"]),
    ]

    for mod, title, items in modules:
        story.append(Paragraph(f"◈  {mod}  —  {title}", styles['toc_module']))
        for item in items:
            story.append(Paragraph(f"    ›  {item}", styles['toc_item']))
        story.append(Spacer(1, 4))

    story.append(PageBreak())
    return story


# ─── MODULE 1 ─────────────────────────────────────────────────────────────────
def build_module1(styles):
    story = []
    story += module_divider(1, "Course Introduction", "Equipment Guide & Course Roadmap", styles)

    story.append(Spacer(1, 4))
    story += h1("Course Roadmap", styles)
    story += body("Welcome to the <b>Complete Beginner to Professional Baking Masterclass!</b> Over 5 comprehensive modules, you will learn the exact science, recipes, and professional techniques used by top home bakers. Here is a quick overview of what you will master:", styles)
    story.append(Spacer(1, 4))

    overview = [
        ("Module 1", "Course Introduction & Equipment Guide", "Setting up your professional baking toolkit"),
        ("Module 2", "Master Sponges & Baking Science", "Commercial eggless premix, Vanilla, Chocolate, Red Velvet, Fruit sponges"),
        ("Module 3", "Frosting, Ganache & Cake Assembly", "Whipping cream, 1:1 & 1:2 Ganache, Slicing, Soaking, Sharp edges"),
        ("Module 4", "Gourmet Cupcakes & The Ultimate Brownie", "Dome-shaped cupcakes, fillings, dense fudgy dark chocolate brownie"),
        ("Module 5", "The Art of Chocolates", "Compound vs. Couverture, Mix-ins, Center-filled, Storage & Transportation"),
    ]
    data = [["MODULE", "TITLE", "KEY TOPICS"]] + [[m, t, d] for m,t,d in overview]
    t = Table(data, colWidths=["15%", "32%", "53%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#2A1400")),
        ('TEXTCOLOR', (0,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#2A1400"), colors.HexColor("#221000")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story += [t, Spacer(1, 8)]

    # Equipment
    story += h1("The Master Equipment List", styles)
    story += body("To bake professionally, you need the <b>right tools</b> — not a commercial kitchen. Below is your complete equipment list to build your bakery from scratch.", styles)
    story.append(Spacer(1, 4))

    sections = [
        ("⚖  MEASURING, PREPARATION & HYGIENE",
         [("Digital Weighing Scale", "Mandatory! Never rely solely on cups."),
          ("Measuring Cups & Spoons Set", "Standardized sets for small liquid and dry measurements."),
          ("Mixing Bowls", "Set of 2–3 large bowls — Glass or Stainless Steel preferred."),
          ("Silicone Spatulas", "For folding batters and scraping every last drop from bowls."),
          ("Wire Whisk", "For blending dry ingredients and mixing wet liquids smoothly."),
          ("Flour Sieve (Channi)", "Essential for aerating flour and cocoa powder."),
          ("Silicone Brush", "For greasing tins, brownie pans, and brushing liquids."),
          ("Tissue Paper Box", "For wiping piping nozzles, cleaning palette knives, and keeping boards spotless.")]),
        ("🎂  BAKING ESSENTIALS",
         [("6-inch Round Aluminum Tin", "Primary tin for half-kg cakes."),
          ("6-inch Square Tin", "Crucial for cutting perfect brownies."),
          ("Cupcake / Muffin Tray", "Standard 6-cavity or 12-cavity metal tray."),
          ("Paper Cupcake Liners", "To line the muffin tray."),
          ("Good Quality Baking Paper", "Brand: Ecobake. Avoid cheap parchment for brownies — it sticks!"),
          ("Stovetop Setup", "Heavy-bottomed Kadhai/Tawa + small steel ring/stand + tight-fitting Patila lid.")]),
        ("🧁  FROSTING & DECORATING",
         [("Electric Hand Beater", "Mandatory for whipping cream — minimum 250W to 300W."),
          ("Cake Turntable", "Smoothly rotating stand for professional icing."),
          ("Serrated Bread Knife", "Long jagged knife for slicing sponges without squishing."),
          ("Straight Palette Knife", "For spreading and leveling cream on cake surfaces."),
          ("Offset (Bent) Palette Knife", "Makes spreading cream much easier on sides."),
          ("Bench Scraper / Comb", "Metal/plastic flat edge for smooth sides and sharp edges."),
          ("Piping Bags", "Disposable plastic — buy a pack of 50 or 100."),
          ("Piping Nozzles", "Start with 1M Star Nozzle (swirls & borders) + basic round nozzle.")]),
        ("🍫  CHOCOLATE MAKING TOOLS",
         [("Plastic (Polycarbonate) Molds", "Essential for shiny finish and center-filled chocolates. Get deep-cavity molds."),
          ("Microwave-Safe Bowls", "Plastic or glass — for melting chocolate without burning."),
          ("Chocolate Scraper", "To scrape excess chocolate off molds for clean edges.")]),
        ("📦  PACKAGING & STORAGE",
         [("Cake Boards", "Buy 7-inch or 8-inch boards for half-kg cakes."),
          ("Tall Cake Boxes", "Ensure enough height so decorations don't get crushed."),
          ("Cupcake Boxes", "With cavity inserts to prevent frosting damage."),
          ("Chocolate Cavity Boxes", "Sectioned boxes for gourmet chocolates."),
          ("Cling Wrap", "Vital for wrapping sponges airtight and storing chocolate slabs."),
          ("Paper or Cloth Delivery Bags", "Insulates cake and chocolate boxes from heat during transport.")]),
        ("🎨  ESSENTIAL FLAVORS & CONSUMABLES",
         [("Vanilla Essence", "Absolute must-have — use a good quality brand."),
          ("Other Essences", "Strawberry, Pineapple, Paan, Rasmalai etc. based on preference."),
          ("Gel Food Colors", "Always choose GEL over liquid — they don't thin out your batters."),
          ("Fruit Crushes", "Strawberry, Pineapple, Blueberry — for layering cakes and center-filled chocolates.")]),
    ]

    for section_title, items in sections:
        story.append(Spacer(1, 4))
        badge_style = ParagraphStyle('badge_h', fontName='Helvetica-Bold', fontSize=10,
                                      textColor=AMBER, leading=14, spaceBefore=8, spaceAfter=4)
        story.append(Paragraph(section_title, badge_style))
        story.append(HRFlowable(width="100%", thickness=0.4, color=BROWN_MID, spaceAfter=4))

        eq_data = [["ITEM", "PURPOSE / NOTE"]] + list(items)
        t = Table(eq_data, colWidths=["38%", "62%"])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), BROWN_DEEP),
            ('TEXTCOLOR', (0,0), (-1,0), AMBER_LIGHT),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#1E0A00")),
            ('TEXTCOLOR', (0,1), (0,-1), CREAM),
            ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (1,1), (1,-1), CREAM_DARK),
            ('FONTNAME', (1,1), (1,-1), 'Helvetica'),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#1E0A00"), colors.HexColor("#160600")]),
            ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor("#3D1F00")),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 7),
        ]))
        story += [t, Spacer(1, 4)]

    return story


# ─── MODULE 2 ─────────────────────────────────────────────────────────────────
def build_module2(styles):
    story = []
    story += module_divider(2, "Master Sponges", "Baking Science & The Eggless Premix System", styles)

    story += h1("The Science of Our Ingredients", styles)
    story += body("Baking is chemistry! Before you bake, understand <i>why</i> each ingredient plays its specific role. This knowledge will help you troubleshoot and customize recipes confidently.", styles)
    story.append(Spacer(1, 4))

    ing_science = [
        ("All-Purpose Flour (Maida)", "Provides the structure/skeleton of the cake through gluten proteins."),
        ("Sugar", "Does more than sweeten — holds moisture (keeping cake soft) and aids browning."),
        ("Corn Flour", "The secret softening agent. Dilutes gluten in maida, making the crumb incredibly tender — similar to expensive 'cake flour'."),
        ("Citric Acid", "Dry acid trigger. When wet ingredients are added, it reacts with baking soda to create CO₂ bubbles, causing the cake to rise."),
        ("Baking Soda & Baking Powder", "Leavening agents. Baking powder gives slow heat-lift; baking soda (reacting with citric acid) provides fast, powerful lift. Both together = tall, fluffy sponge."),
        ("Salt", "Just a pinch enhances all sweet flavors and balances overall taste."),
        ("Refined Sunflower Oil", "Provides fat for moisture. Must be tasteless and odorless. Mustard or peanut oil will ruin the smell and taste!"),
        ("Water vs. Milk", "Water → longer shelf life (ideal for commercial orders). Milk → slightly richer taste but spoils faster."),
    ]
    data = [["INGREDIENT", "SCIENCE / PURPOSE"]] + ing_science
    t = Table(data, colWidths=["35%", "65%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#1E0A00")),
        ('TEXTCOLOR', (0,1), (0,-1), CREAM),
        ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1,1), (1,-1), CREAM_DARK),
        ('FONTNAME', (1,1), (1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#1E0A00"), colors.HexColor("#160600")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
    ]))
    story += [t, Spacer(1, 8)]

    story += h1("Recipe 1: The Master Vanilla Premix (Dry Base)", styles)
    story += body("Instead of measuring all dry ingredients every time, make this <b>Master Dry Mix</b> in advance and store it. You can instantly whip up a cake whenever you receive an order!", styles)
    story.append(Spacer(1, 4))

    story += recipe_ingredient_table([
        ("All-Purpose Flour (Maida)", "130g"),
        ("Sugar (Normal or Caster)", "120g"),
        ("Corn Flour", "2 tbsp"),
        ("Baking Powder", "1 tsp"),
        ("Baking Soda", "½ tsp"),
        ("Citric Acid", "¼ tsp"),
        ("Salt", "1 pinch"),
    ], styles)

    story += h3("Method — Making the Premix", styles)
    story += steps_table([
        "Measure all dry ingredients precisely using a digital weighing scale.",
        "Transfer everything into a mixer-grinder jar.",
        "Pulse in the mixer — this ensures sugar becomes fine and leavening agents are perfectly distributed.",
        "Sieve the ground mixture 1–2 times. This aerates the flour (adds air) and makes the cake lighter.",
        "Storage: Store in an airtight container in the fridge. Lasts for months!",
    ], styles)

    story += h1("Baking the Sponge (Yield: 500g Cake with Icing)", styles)
    story += body("When ready to bake a standard <b>half-kg cake</b>, use the following formula to convert your stored premix into batter.", styles)
    story.append(Spacer(1, 4))

    story += recipe_ingredient_table([
        ("Master Vanilla Premix", "180g"),
        ("Water or Milk", "Add gradually — 'flowing ribbon' consistency"),
        ("Flavorless Oil (Sunflower)", "1 tbsp"),
        ("Vanilla Essence", "¼ tsp"),
    ], styles)

    story += h3("Batter Preparation", styles)
    story += steps_table([
        "Take a 5-inch round cake tin. Grease inside lightly with oil and line the bottom with baking paper.",
        "Mix 180g premix with your liquid (water/milk) using a whisk until smooth.",
        "Add the oil and vanilla essence. Mix gently until just combined. Do NOT overmix!",
        "Pour into the lined tin and tap the tin twice on the counter to release large air bubbles.",
    ], styles)

    story += h2("Baking Methods", styles)

    baking_data = [
        ["METHOD", "TEMPERATURE", "TIME", "KEY SETTINGS"],
        ["Oven (OTG/Convection)", "170°C", "20–25 min", "Lower rack, Lower rod ON, Fan ON"],
        ["Stovetop (Tawa/Kadhai)", "Low-Medium Flame", "25–30 min", "Ring stand inside kadhai, tight lid"],
    ]
    t = Table(baking_data, colWidths=["28%", "22%", "18%", "32%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#2A1400")),
        ('TEXTCOLOR', (0,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#2A1400"), colors.HexColor("#221000")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story += [t, Spacer(1, 6)]

    story += h2("Cooling, Storage & Handling", styles)
    story += steps_table([
        "Let the cake rest in the tin for 1 hour after baking. Once cool, it will demould easily.",
        "For orders 2–3 days away: wrap cooled sponge tightly in cling wrap and store in the fridge. This locks in moisture.",
        "The Golden Rule: NEVER do final icing on a cold cake straight from the fridge! Let the wrapped sponge come completely to room temperature before decorating.",
    ], styles)

    story += h1("Flavor Variations", styles)
    story += body("You can easily alter the dry premix or wet batter to create different cake bases. Master one formula and create infinite flavors!", styles)
    story.append(Spacer(1, 4))

    variations = [
        ["CAKE FLAVOR", "FLOUR", "CHANGE FROM BASE", "SPECIAL NOTES"],
        ["Vanilla (Base)", "130g Maida", "—", "Base recipe as above"],
        ["Chocolate Sponge", "120g Maida", "+ 10–12g Dark Cocoa Powder", "Always use Dark cocoa for rich color & deep flavor"],
        ["Red Velvet", "125g Maida", "+ 5g Cocoa Powder", "Use Buttermilk instead of milk/water + Red Gel Color"],
        ["Strawberry", "130g Maida", "No change in dry", "Add Strawberry essence + Pink/Red gel color to wet batter"],
        ["Blueberry", "130g Maida", "No change in dry", "Add Blueberry essence + Purple/Violet gel color"],
        ["Pineapple", "130g Maida", "No change in dry", "Add Pineapple essence + Yellow gel color"],
        ["Paan / Rasmalai", "130g Maida", "No change in dry", "Add Paan/Rasmalai essence + Green or Yellow color"],
    ]
    t = Table(variations, colWidths=["20%", "18%", "30%", "32%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#1E0A00")),
        ('TEXTCOLOR', (0,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#1E0A00"), colors.HexColor("#160600")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story += [t, Spacer(1, 6)]

    story += tip_box("PRO TIP — Fruit & Fusion Sponges",
                      ["You do NOT need 10 different recipes to make 10 different cakes!",
                       "Just use your Master Vanilla Sponge and change the essence + gel color in the wet batter.",
                       "This saves time, reduces waste, and keeps your workflow simple and efficient."], styles)

    return story


# ─── MODULE 3 ─────────────────────────────────────────────────────────────────
def build_module3(styles):
    story = []
    story += module_divider(3, "Creams & Cake Assembly", "Ganache, Sharp Edges & Professional Finishing", styles)

    story += h1("Tin Sizes & Layering Guide — The Pro Formula", styles)
    story += body("Never guess your tin size! Use this professional guide to ensure your cakes are always perfectly proportioned and structurally sound.", styles)
    story.append(Spacer(1, 4))

    layer_data = [
        ["CAKE WEIGHT", "TIN SIZE (NORMAL)", "TIN SIZE (HEIGHTENED)", "LAYERS"],
        ["Half Kg", "6-inch", "N/A", "3 Layers"],
        ["1 Kg", "7-inch", "6-inch", "4 (Normal) / 5 (Heightened)"],
        ["2 Kg", "8-inch", "7-inch", "TBD based on height"],
    ]
    story += info_table(layer_data, styles)

    story += h1("The Science of Whipping Cream", styles)

    comp_data = [
        ["", "DAIRY CREAM", "NON-DAIRY WHIPPING CREAM"],
        ["Source", "Cow's milk fat", "Vegetable fats"],
        ["Texture", "Rich and very heavy", "Light, smooth, bright white"],
        ["Use Case", "Entremets, Mousse cakes (small bites)", "Birthday cakes, frosting (professional standard)"],
        ["Weather Stability", "Melts quickly — difficult in heat", "Holds shape better in warm weather"],
        ["Recommended Brands", "Premium desserts only", "Tropolite, Silver Mark"],
    ]
    t = Table(comp_data, colWidths=["22%", "38%", "40%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BACKGROUND', (0,1), (0,-1), BROWN_DEEP),
        ('TEXTCOLOR', (0,1), (0,-1), AMBER_LIGHT),
        ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (1,1), (-1,-1), colors.HexColor("#1E0A00")),
        ('TEXTCOLOR', (1,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (1,1), (-1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (1,1), (-1,-1), [colors.HexColor("#1E0A00"), colors.HexColor("#160600")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
    ]))
    story += [t, Spacer(1, 6)]

    story += h2("Storage & Thawing Rules", styles)
    story += steps_table([
        "Always store unopened or leftover un-whipped cream in the <b>freezer</b>.",
        "Transfer from freezer to fridge the <b>night before</b> your baking session.",
        "The cream must be <b>100% liquid but extremely chilled</b> before whipping. Never whip cream with ice crystals!",
        "Once whipped, cream lasts about <b>1 week in the fridge</b>. Keep tightly covered with cling wrap.",
    ], styles)

    story += h2("How to Whip Cream Perfectly — The 'Bowl Flip' Test", styles)
    story += body("Equipment: Electric hand beater — minimum <b>250W to 300W</b>. Quantity for a standard half-kg cake: <b>240g–250g chilled liquid non-dairy cream</b>.", styles)
    story += steps_table([
        "Pour chilled liquid cream into a deep, cold bowl.",
        "Start beater on <b>Low Speed for exactly 2 minutes</b> to introduce small, stable air bubbles.",
        "Increase speed gradually. Watch the cream reach 'Soft Peaks' — like a cloud that flops over.",
        "Switch to <b>High Speed</b> and whip until you reach 'Stiff Peaks'.",
        "<b>The Bowl Flip Test:</b> Flip your bowl completely upside down and give it a firm jerk. If cream stays perfectly stuck — it is ready!",
    ], styles)

    story += tip_box("PRO TIP — Large Cakes",
                      ["For 2kg or 3kg cakes, do NOT whip all the cream at once!",
                       "Whip in small batches and take it out of the fridge only as you need it — keeps it cold and workable."], styles)
    story.append(Spacer(1, 6))

    story += tip_box("WATER HACK — Professional Finishing",
                      ["If whipped cream looks bubbly, grainy, or 'cracked' while working (due to heat):",
                       "Spray clean water over the cake using a spray bottle, then gently smooth with bench scraper.",
                       "The water re-hydrates the cream — instantly giving you a silky, bubble-free, professional finish!"], styles)
    story.append(Spacer(1, 6))

    story += h1("Step-by-Step Cake Assembly", styles)

    story += h2("Step 1 — Preparation & Setup", styles)
    story += steps_table([
        "<b>Anti-Slip Trick:</b> Place a damp wet tissue or wet cloth on your turntable/board, then place the cake board on top. Prevents sliding while icing!",
        "<b>Thread Trick:</b> No serrated knife? Wrap clean sewing thread around the cake, cross the ends, and pull through for a perfectly straight professional cut.",
    ], styles)

    story += h2("Step 2 — Soaking (The Secret to Moisture)", styles)
    story += body("Always use <b>room temperature</b> liquid for soaking. Never use cold water — it doesn't absorb well.", styles)

    soak_data = [
        ["CAKE FLAVOR", "SOAKING LIQUID FORMULA"],
        ["Chocolate Cake", "1 tbsp Ganache mixed into ½ cup water"],
        ["All Other Flavors", "1 tbsp of the specific Fruit Crush mixed into ½ cup water"],
    ]
    t = Table(soak_data, colWidths=["40%", "60%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BROWN_MID),
        ('TEXTCOLOR', (0,0), (-1,0), CREAM),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#1E0A00")),
        ('TEXTCOLOR', (0,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story += [t, Spacer(1, 6)]

    story += h2("Step 3 — Layering & Filling", styles)
    story += steps_table([
        "<b>Bottom Layer:</b> Always keep the original bottom layer of the sponge at the bottom for stability.",
        "<b>Filling:</b> Spread an even layer of cream with an offset spatula.",
        "Chocolate Cake: Add 2 tbsp ganache over the cream, spread, and sprinkle chocochips.",
        "Other Cakes: Add 1 tbsp of fruit crush per layer.",
        "<b>Flat Top:</b> Place the upper sponge layer (the one that was on top while baking) in the center of the cake stack — ensures a flat top.",
    ], styles)

    story += h2("Step 4 — Crumb Coat & Final Icing", styles)
    story += steps_table([
        "<b>Crumb Coat:</b> Apply a very thin layer of cream to seal in loose crumbs. Refrigerate for 15–30 minutes.",
        "<b>Final Icing:</b> Fill piping bag. Pipe in round-and-round motion from bottom to top.",
        "<b>Smoothing:</b> Hold sturdy bench scraper at 45° angle to the cake. Spin the turntable steadily.",
        "<b>Sharp Edges:</b> Move palette knife from outside to center of the top surface, scraping off excess cream. Keep the knife clean between each pass!",
    ], styles)

    story += warning_box("SUMMER WARNING",
                          ["Working with whipped cream and chocolate truffle frosting during Indian summers is challenging.",
                           "Always work in a cool place or AC room to prevent cream from melting while smoothing edges!"], styles)
    story.append(Spacer(1, 6))

    story += h1("Masterclass: Chocolate Ganache", styles)
    story += body("Ganache is a luxurious mixture of cream and chocolate. Master both ratios and you can frost, fill, and drip-decorate any cake professionally.", styles)
    story.append(Spacer(1, 4))

    ganache_data = [
        ["GANACHE TYPE", "RATIO", "FORMULA EXAMPLE", "USE CASE"],
        ["Truffle Frosting", "1 Cream : 2 Chocolate", "50g cream + 100g dark compound", "Filling & frosting rich Chocolate Truffle Cakes"],
        ["Drip & Glaze", "1 Cream : 1 Chocolate", "50g cream + 50g dark compound", "Beautiful chocolate drips down the sides of a cake"],
        ["Brownie Frosting", "1 Cream : 3 Chocolate", "30g cream + 90g dark compound", "Ultra-thick ganache specifically for brownie tops"],
    ]
    t = Table(ganache_data, colWidths=["22%", "18%", "28%", "32%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#1E0A00")),
        ('TEXTCOLOR', (0,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#1E0A00"), colors.HexColor("#160600")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story += [t, Spacer(1, 6)]

    story += h2("The Ganache Method", styles)
    story += steps_table([
        "Chop your compound chocolate into small, even pieces.",
        "Heat the non-dairy cream in a pan until warm/steaming — do NOT boil rapidly.",
        "Pour warm cream over chopped chocolate. Let sit for 1 minute.",
        "Stir gently from center outwards until perfectly glossy.",
        "<b>Sieve it:</b> Always sieve to remove any un-melted lumps.",
        "<b>Resting:</b> For truffle cakes, let the 1:2 ganache rest for 3–4 hours at room temperature to stabilize.",
    ], styles)

    story += science_box("Why Does Ganache Split?",
                          ["Ganache is an 'emulsion' — forcing fat and water to mix.",
                           "Because we use non-dairy cream (vegetable oils), over-mixing or over-heating causes the oil to separate.",
                           "FIX: If it splits, add 1 tbsp of warm milk/water and whisk vigorously to re-emulsify."], styles)

    return story


# ─── MODULE 4 ─────────────────────────────────────────────────────────────────
def build_module4(styles):
    story = []
    story += module_divider(4, "Gourmet Cupcakes", "& The Signature Dark Fudge Brownie", styles)

    story += h1("Part 1: Cupcakes & Muffins", styles)
    story += body("Cupcakes use the exact same Master Vanilla and Chocolate dry premixes from Module 2. However, the wet batter preparation is slightly different for the perfect dome-shaped cupcake.", styles)
    story.append(Spacer(1, 4))

    story += science_box("The Science of Cupcake Batter",
                          ["Batter Consistency — Thicker is Better: A cake batter is 'flowing' to stay moist for days. A cupcake is often eaten dry (without soaking). Too thin = gummy/doughy texture. Cupcake batter must be slightly thicker for a soft, pleasant bite.",
                           "The Vinegar Boost: Cupcakes bake quickly in just 15–20 minutes. Adding ½ tsp White Vinegar ensures a fast, powerful rise by instantly reacting with baking soda.",
                           "Filling Rule: Only fill liners 1/3 full (or just under half). Cupcakes rise significantly — you need empty space for piping frosting!"], styles)
    story.append(Spacer(1, 6))

    story += h2("Cupcake Formula & Yield", styles)
    tip_style = ParagraphStyle('tip_p', fontName='Helvetica-Bold', fontSize=11,
                                textColor=AMBER, alignment=TA_CENTER, leading=16)
    formula_box = ColorBox(
        [Paragraph("180g of Master Premix = 4 Standard Cupcakes", tip_style),
         Paragraph("For any quantity: Number of Cupcakes × 45g = Premix needed", styles['tip_box']),
         Paragraph("Example: 6 cupcakes → 6 × 45g = 270g Premix", styles['tip_box'])],
        colors.HexColor("#2A1800"), AMBER, pad=12
    )
    story += [formula_box, Spacer(1, 6)]

    story += h2("Preparation Method", styles)
    story += steps_table([
        "Calculate your required dry premix and place it in a bowl.",
        "Gradually add liquid (milk or water) until you reach a consistency slightly thicker than normal cake batter.",
        "Mix in ¼ tsp Vanilla Essence, 1 tbsp Oil, and ½ tsp Vinegar.",
        "Lightly grease paper cupcake liners with a drop of oil.",
        "Fill liners only 1/3 full — leave empty space for beautiful frosting!",
    ], styles)

    story += h2("Baking Instructions", styles)
    bake_data = [
        ["METHOD", "TEMPERATURE", "TIME", "NOTES"],
        ["Oven (OTG/Convection)", "150°C", "15–20 min", "Lower rod ON, Fan ON"],
        ["Stovetop (Tawa/Kadhai)", "Low-Medium Flame", "Start checking at 10–12 min", "Same ring-stand setup as cakes"],
    ]
    t = Table(bake_data, colWidths=["28%", "20%", "24%", "28%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#2A1400")),
        ('TEXTCOLOR', (0,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#2A1400"), colors.HexColor("#221000")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story += [t, Spacer(1, 6)]

    story += h2("Flavor Variations & Center Fillings", styles)
    story += body("Once cupcakes are completely cooled, transform them into gourmet treats with fillings and flavored frostings.", styles)

    filling_data = [
        ["CUPCAKE TYPE", "METHOD"],
        ["Fruit Cupcakes (Strawberry, Pineapple, Blueberry, Black Currant)",
         "Carve a hole in cooled vanilla cupcake → fill with fruit crush → pipe matching colored cream on top."],
        ["Chocolate Truffle Cupcakes",
         "Carve hole in chocolate cupcake → fill with 1:2 Ganache → decorate with a ganache swirl on top."],
        ["Gourmet Spread Cupcakes",
         "Fill centers and top the icing with premium spreads like Nutella or Biscoff."],
        ["Dry Muffins (No Icing)",
         "Add chopped dry fruits, pistachios, tutti-frutti, or choco-chips directly into thick batter before baking."],
    ]
    t = Table(filling_data, colWidths=["38%", "62%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BROWN_MID),
        ('TEXTCOLOR', (0,0), (-1,0), CREAM),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#1E0A00")),
        ('TEXTCOLOR', (0,1), (0,-1), CREAM),
        ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1,1), (1,-1), CREAM_DARK),
        ('FONTNAME', (1,1), (1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#1E0A00"), colors.HexColor("#160600")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
    ]))
    story += [t, Spacer(1, 8)]

    story += h1("Part 2: The Signature Dark Fudge Brownie", styles)
    story += body("A brownie is <b>NOT a cake!</b> A cake is light and airy — a brownie is <b>dense, rich, and fudgy.</b> The recipe and baking method are completely different by design.", styles)
    story.append(Spacer(1, 4))

    recipe_note = ColorBox(
        [Paragraph("Yield:  4 large pieces  or  9 small pieces", styles['h3']),
         Paragraph("Total Baked Weight: Approximately 320g–330g", styles['body'])],
        colors.HexColor("#1A0E00"), AMBER, pad=10
    )
    story += [recipe_note, Spacer(1, 6)]

    story += h3("Liquid / Fat Ingredients", styles)
    story += recipe_ingredient_table([
        ("Dark Compound Chocolate (Chopped)", "70g"),
        ("Butter (Good quality)", "50g"),
        ("Flavorless Oil", "1 tbsp"),
        ("Milk (Room Temperature)", "40g"),
        ("Vanilla Essence", "¼ tsp"),
    ], styles)

    story += h3("Dry Ingredients", styles)
    story += recipe_ingredient_table([
        ("All-Purpose Flour (Maida)", "100g"),
        ("Powdered Sugar", "55g"),
        ("Dark Cocoa Powder", "2 tbsp"),
        ("Baking Powder", "¼ tsp"),
        ("Baking Soda", "1 pinch"),
        ("Salt", "1 pinch"),
    ], styles)

    story += h2("Preparation Method", styles)
    story += steps_table([
        "<b>Prep the Tin:</b> Line a 6-inch square tin — bottom AND all four sides — with good quality baking paper (Ecobake), lightly greased with oil. Never use cheap parchment for brownies — it will stick permanently!",
        "Melt chopped Dark Compound and Butter together using a double boiler or microwave until warm and smooth.",
        "To the warm chocolate mix, whisk in Powdered Sugar, Oil, Milk, and Vanilla Essence. This is your 'Liquid Bowl.'",
        "In a separate bowl, sieve together the Maida, Cocoa Powder, Baking Powder, Baking Soda, and Salt.",
        "<b>The Mix:</b> Add sifted dry ingredients into your liquid bowl. Gently fold with a spatula. DO NOT OVERMIX!",
        "Fold in a handful of chocochips or extra compound chunks. Pour into lined tin. Top with more chocochips.",
    ], styles)

    story += science_box("Why Dry into Liquid? — Brownie vs. Cake Science",
                          ["For cakes, we alternate dry and wet ingredients.",
                           "For brownies, we pour dry ingredients DIRECTLY into the fat/chocolate liquid.",
                           "This allows fat to immediately coat the flour particles, which stops gluten from forming.",
                           "Less gluten = a dense, meltingly fudgy brownie rather than a fluffy, dry cake!"], styles)
    story.append(Spacer(1, 6))

    story += tip_box("Making Nutty Brownies — The Flour Trick",
                      ["Toss chopped nuts (Hazelnut, Walnut, Dry Fruits) in ½ tbsp of dry flour before folding into batter.",
                       "The flour creates a rough friction layer around the heavy nuts, preventing them from sinking to the bottom!"], styles)
    story.append(Spacer(1, 6))

    story += h2("Baking the Brownie", styles)
    story += body("Brownies require heat from ALL directions to get that famous crinkly, shiny top.", styles)

    bake_box = ColorBox(
        [Paragraph("Bake ONLY in Oven/OTG — NOT on stovetop", styles['body_bold']),
         Paragraph("Settings: BOTH Rods ON, Fan ON", styles['body']),
         Paragraph("Temperature: 170°C  |  Time: 25–30 minutes", styles['body']),
         Paragraph("Test: Toothpick should come out with a few thick, moist crumbs — NOT completely clean like a cake!", styles['body'])],
        colors.HexColor("#1A0A00"), AMBER, pad=10
    )
    story += [bake_box, Spacer(1, 6)]

    story += h2("Cooling, Frosting & Decoration", styles)
    story += steps_table([
        "<b>Patience is Key:</b> Let brownie cool completely to room temperature in the tin. Then grab the edges of butter paper and lift the whole square out — perfect!",
        "Cut into 4 or 9 pieces.",
        "<b>Brownie Ganache Frosting:</b> Make special ultra-thick ganache using 3:1 ratio (90g chocolate + 30g cream). Spread generously on top.",
        "<b>Gourmet Alternatives:</b> Spread Hazelnut/Nutella or melted Biscoff over the top instead of ganache.",
    ], styles)

    story += warning_box("GOLDEN RULE — Brownie Storage",
                          ["NEVER store brownies in the fridge!",
                           "The cold temperature turns them into hard, unpleasant bricks due to the high butter and chocolate content.",
                           "Store in an airtight container at ROOM TEMPERATURE — they stay delicious for 4–5 days!"], styles)

    return story


# ─── MODULE 5 ─────────────────────────────────────────────────────────────────
def build_module5(styles):
    story = []
    story += module_divider(5, "The Art of Chocolates", "Theory, Mix-ins, Center-Filled & Professional Storage", styles)

    story += h1("Part 1: Chocolate Theory & Science", styles)

    story += h2("What Is Chocolate?", styles)
    story += body("True chocolate comes from the <b>cacao bean</b>. After harvesting and roasting, it is ground into cocoa liquor, which is then separated into <b>cocoa solids</b> (powder) and <b>cocoa butter</b> (fat). The combination and processing of these elements determines the type and quality of chocolate.", styles)
    story.append(Spacer(1, 6))

    comp_data = [
        ["", "COUVERTURE (REAL CHOCOLATE)", "COMPOUND CHOCOLATE"],
        ["Fat Used", "Pure Cocoa Butter", "Vegetable fats (Cocoa butter replaced)"],
        ["Cost", "Expensive", "Much cheaper — accessible"],
        ["Tempering Required?", "YES — complex thermometer process", "NO — simply melt and mold"],
        ["Mouth Feel", "Perfect melt-in-mouth", "Good, slightly less refined"],
        ["Shine / Snap", "Brilliant after tempering", "Good with polycarbonate molds"],
        ["Recommended For", "Premium artisan chocolates", "Commercial home production"],
        ["Brands in India", "Callebaut, Valrhona", "Vanleer (Premium), Morde (Standard)"],
    ]
    t = Table(comp_data, colWidths=["22%", "39%", "39%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BACKGROUND', (0,1), (0,-1), BROWN_DEEP),
        ('TEXTCOLOR', (0,1), (0,-1), AMBER_LIGHT),
        ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (1,1), (-1,-1), colors.HexColor("#1E0A00")),
        ('TEXTCOLOR', (1,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (1,1), (-1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (1,1), (-1,-1), [colors.HexColor("#1E0A00"), colors.HexColor("#160600")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
    ]))
    story += [t, Spacer(1, 6)]

    story += h2("Choosing the Right Molds", styles)
    mold_data = [
        ["MOLD TYPE", "BEST FOR", "AVOID FOR"],
        ["Plastic (Polycarbonate)", "ALL chocolates — brilliant shine, easy demolding, MANDATORY for center-filled chocolates", "—"],
        ["Silicone Molds", "Small decorations: fondant/chocolate letters, cake toppers", "Center-filled chocolates — too flexible, doesn't give shine"],
    ]
    t = Table(mold_data, colWidths=["24%", "44%", "32%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BROWN_MID),
        ('TEXTCOLOR', (0,0), (-1,0), CREAM),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#1E0A00")),
        ('TEXTCOLOR', (0,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#1E0A00"), colors.HexColor("#160600")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
    ]))
    story += [t, Spacer(1, 6)]

    story += warning_box("THE GOLDEN RULE OF CHOCOLATE — Water is the Enemy!",
                          ["Even a SINGLE DROP of water or steam will cause the chocolate to 'Seize.'",
                           "Seizing: sugar in the chocolate absorbs the water, turning smooth melted chocolate into a hard, grainy paste that CANNOT be fixed.",
                           "Ensure your bowls, spatulas, and molds are 100% BONE-DRY before starting!"], styles)
    story.append(Spacer(1, 6))

    story += h1("Part 2: Melting Techniques", styles)

    story += h2("Method 1 — The Double Boiler", styles)
    story += steps_table([
        "Fill a saucepan with 1 inch of water and bring to a gentle simmer.",
        "Place a heatproof glass or steel bowl over the pan. The bottom of the bowl must NOT touch the water.",
        "Add finely chopped compound to the bowl. The gentle steam heats the bottom of the bowl and melts the chocolate.",
        "Stir gently until completely smooth.",
    ], styles)

    story += h2("Method 2 — The Microwave Method", styles)
    story += steps_table([
        "Place chopped compound in a microwave-safe plastic or glass bowl.",
        "Heat for 30 seconds on normal power. Take out and stir.",
        "Heat for another 15 seconds and stir. Repeat in 10–15 second bursts until completely smooth.",
        "NEVER heat for a minute straight — the chocolate will burn and turn bitter!",
    ], styles)

    story += h1("Part 3: Basic Mix-In Chocolates", styles)
    story += body("Storage for plain chocolates: Fridge, up to <b>1 month</b>.", styles)
    story.append(Spacer(1, 4))

    story += h2("1. Roasted Almond / Dry Fruit (The Best-Seller)", styles)
    story += steps_table([
        "Chop almonds into 4–5 small pieces.",
        "In a heavy-bottomed pan, melt 1 tsp butter. Add almonds and roast on medium flame until slightly brown and nutty-aromatic.",
        "CRUCIAL: Immediately transfer to a cool bowl so they don't burn in the hot pan. Let them come to room temperature.",
        "Fold cooled nuts into melted dark or milk chocolate.",
        "Spoon into plastic molds. Tap mold firmly on counter 3–4 times to force air bubbles to the top.",
        "Freeze for 10 minutes to set. Demold immediately.",
    ], styles)

    story += h2("2. Crunchy Rice Crispies & Butterscotch", styles)
    story += body("<b>Rice Crispies:</b> Buy readymade white bakery crispies. Test: if they feel soft, dry-roast for 1 minute. Mix into melted chocolate and mold.", styles)
    story += body("<b>Butterscotch:</b> Use readymade butterscotch praline chunks. Crush slightly to fit the mold, mix with milk or white chocolate, and mold.", styles)
    story.append(Spacer(1, 4))

    story += h2("3. Unique Indian Fusion Flavors", styles)
    fusion_data = [
        ["FLAVOR", "RECIPE"],
        ["Orange Crunch", "Crush orange hard candies into semi-chunks (NOT powder) and mix into white compound."],
        ["Chai Masala", "Stir instant Chai Premix powder directly into melted white chocolate for an Indian fusion treat!"],
    ]
    t = Table(fusion_data, colWidths=["25%", "75%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BROWN_MID),
        ('TEXTCOLOR', (0,0), (-1,0), CREAM),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#1E0A00")),
        ('TEXTCOLOR', (0,1), (0,-1), CREAM),
        ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1,1), (1,-1), CREAM_DARK),
        ('FONTNAME', (1,1), (1,-1), 'Helvetica'),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
    ]))
    story += [t, Spacer(1, 8)]

    story += h1("Part 4: Center-Filled Chocolates", styles)
    story += body("Premium chocolates with a <b>hard outer shell</b> and <b>soft, flowing center.</b> Always use a deep-cavity polycarbonate mold for these.", styles)
    story.append(Spacer(1, 4))

    story += h2("The Shell Technique — Foundation for ALL Filled Chocolates", styles)
    story += steps_table([
        "Clean your plastic mold thoroughly with a dry cotton cloth.",
        "Pour room-temperature melted chocolate into cavities, filling them to the top. Tap firmly.",
        "Wait approximately 60 seconds to let a thin shell set against the cold plastic walls.",
        "<b>Flip it!</b> Turn the mold upside down over your chocolate bowl to drain out the excess wet chocolate. Tap the back of the mold to help drain.",
        "Use a bench scraper to scrape the top of the mold completely clean.",
        "Place in freezer for 10 minutes. You now have perfect empty chocolate shells!",
    ], styles)

    story += h2("Recipe 1 — Chocolate Truffle Bomb", styles)
    story += body("Use your <b>1:2 Truffle Ganache</b> from Module 3 — must be at room temperature before piping.", styles)
    story += steps_table([
        "Pipe ganache into set shells. Leave a 2mm gap at the top — overfilling prevents proper sealing!",
        "Freeze for 10 minutes.",
        "<b>Sealing Trick:</b> Lightly blow warm air from a hair dryer over the mold for 2 seconds to soften the top edge. Pour melted chocolate over the top, scrape flat, and freeze to set.",
    ], styles)

    story += h2("Recipe 2 — Fruit Centers (Blueberry, Strawberry, Paan)", styles)
    story += body("Always use <b>White Compound</b> for fruit flavors — it acts as a blank canvas, allowing fruit color and taste to shine!", styles)

    formula_box2 = ColorBox(
        [Paragraph("Crush Filling Formula", ParagraphStyle('ff', fontName='Helvetica-Bold',
                    fontSize=10, textColor=AMBER, leading=14)),
         Paragraph("1 Part Fruit Crush  :  ½ Part Melted White Chocolate", styles['tip_box']),
         Paragraph("Example: 2 tbsp Blueberry Crush + 1 tbsp Melted White Chocolate", styles['tip_box'])],
        colors.HexColor("#1A1600"), AMBER_LIGHT, pad=10
    )
    story += [formula_box2, Spacer(1, 4)]
    story += body("Fill the white chocolate shells with the crush mixture, freeze, seal with white chocolate, and demold.", styles)
    story.append(Spacer(1, 6))

    story += h2("Recipe 3 — Gourmet Spreads (Nutella / Biscoff)", styles)
    story += body("Pipe premium spreads straight into the chocolate shells. For Hazelnut Nutella: pipe a little Nutella, drop in a roasted hazelnut, and seal with chocolate!", styles)
    story.append(Spacer(1, 6))

    story += h2("Recipe 4 — The Ultimate Salted Caramel", styles)
    story += recipe_ingredient_table([
        ("Sugar", "½ cup"),
        ("Dairy Cream (warmed)", "½ cup"),
        ("Butter", "2 tbsp"),
        ("Salt", "½ tsp"),
    ], styles)
    story += steps_table([
        "Melt the sugar in a dry pan on low heat until it turns an amber liquid.",
        "Turn off the heat. Carefully whisk in the butter.",
        "Slowly pour in the warm cream — it will bubble violently! Stay calm and keep whisking.",
        "Reheat gently so everything blends together well. Add the salt.",
        "Let cool completely to room temperature before piping into Dark or Milk chocolate shells.",
    ], styles)

    story += science_box("Coloring & Flavoring Chocolate — Important Science",
                          ["You CAN color white chocolate to match the flavor (e.g., light purple for blueberry).",
                           "You MUST use ONLY oil-based candy colors or powder colors.",
                           "For essences, use ONLY oil-based essences.",
                           "If you use liquid water-based food colors or water-based essences, your chocolate will INSTANTLY seize and become hard rocks!"], styles)
    story.append(Spacer(1, 8))

    story += h1("Part 5: Storage, Condensation & Transportation", styles)

    story += h2("The Science of 'Sweating' (Condensation)", styles)
    story += body("When cold chocolates are taken from the fridge into a hot, humid room, moisture from the air collects on the cold chocolate surface. This is called <b>'sugar bloom'</b> or sweating — it ruins the shiny finish permanently.", styles)
    story.append(Spacer(1, 4))

    story += tip_box("Fix for Indian Summers",
                      ["Always demold your chocolates in an AC room.",
                       "If no AC: demold very quickly and instantly place in an airtight container before air touches them!"], styles)
    story.append(Spacer(1, 6))

    story += h2("Shelf Life & Storage Reference", styles)
    shelf_data = [
        ["PRODUCT", "STORAGE LOCATION", "SHELF LIFE"],
        ["Raw Compound Slabs (Cool Weather)", "Room temperature — dry, dark cupboard", "Months"],
        ["Raw Compound Slabs (Hot Weather)", "Fridge in airtight container/cling film", "Months — take only what you need!"],
        ["Plain Finished Chocolates", "Room temperature in airtight container", "Up to 1 month"],
        ["Center-Filled Chocolates", "Fridge", "7–10 days"],
        ["Center-Filled Chocolates", "Room temperature", "Up to 2 days"],
        ["Whipped Cream (once whipped)", "Fridge, covered with cling wrap", "Up to 1 week"],
        ["Baked Sponge (wrapped)", "Fridge in cling wrap", "2–3 days safely"],
        ["Brownies", "Room temperature, airtight container", "4–5 days"],
    ]
    t = Table(shelf_data, colWidths=["36%", "34%", "30%"])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AMBER),
        ('TEXTCOLOR', (0,0), (-1,0), DARK_BG),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#1E0A00")),
        ('TEXTCOLOR', (0,1), (-1,-1), CREAM_DARK),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#1E0A00"), colors.HexColor("#160600")]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#4A2A00")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story += [t, Spacer(1, 6)]

    story += h2("Transportation Rules", styles)
    story += steps_table([
        "<b>Timing:</b> Always try to deliver large cakes (especially in summers) and chocolates in the evening or at night to avoid the harsh afternoon sun.",
        "<b>Packaging:</b> Place chocolates in high-quality cavity boxes. Wrap the entire box in cling film, then place it in a paper or cloth bag to insulate from outside heat.",
        "<b>The Summer Hack:</b> Travelling more than 15–20 minutes without AC? Place the boxed chocolates inside a slightly damp cloth bag. The evaporation keeps the inside temperature significantly cooler!",
        "<b>Client Instructions:</b> Always instruct the client to immediately place the box in the fridge upon receiving it.",
    ], styles)

    return story


# ─── MAIN BUILD ───────────────────────────────────────────────────────────────
def build_pdf():
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "HarshCakeZone_Baking_Masterclass_Notes.pdf")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    styles = make_styles()

    # We'll collect all pages and their module names
    # Using a list of (story_chunk, module_name) to assign templates
    # Simpler: build full story and use a single callback that tracks page

    full_story = []
    full_story += build_cover(styles)
    full_story += build_toc(styles)
    full_story += build_module1(styles)
    full_story += build_module2(styles)
    full_story += build_module3(styles)
    full_story += build_module4(styles)
    full_story += build_module5(styles)

    # We'll use a state-tracking page template
    module_pages = {}  # page_num: module_name (filled during build)

    class TrackingTemplate(PageTemplate):
        def __call__(self, c, doc):
            super().__call__(c, doc)

    template = PageTemplate("")

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=MARGIN + 6*mm,   # extra left for side panel
        rightMargin=MARGIN - 4*mm,
        topMargin=26*mm,
        bottomMargin=20*mm,
    )

    doc.build(full_story, onFirstPage=template, onLaterPages=template)
    print(f"PDF built: {output_path}")
    return output_path

if __name__ == "__main__":
    path = build_pdf()
    print(f"Done: {path}")