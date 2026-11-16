"""Render the website's legal text without rewriting it."""
import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, KeepTogether

FONT_DIR = Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('Legal', str(FONT_DIR / 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('LegalBold', str(FONT_DIR / 'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('Legal', normal='Legal', bold='LegalBold')
MARGIN = 20 * mm
BODY_SIZE = 9
LINE_HEIGHT = 12
INK = colors.HexColor('#20252b')
MUTED = colors.HexColor('#626c75')
FORM_HEADINGS = {'Muster-Widerrufsformular', 'Model withdrawal form'}
styles = getSampleStyleSheet()
styles.add(ParagraphStyle('LegalBody', fontName='Legal', fontSize=BODY_SIZE, leading=LINE_HEIGHT, spaceAfter=6, textColor=INK, alignment=TA_LEFT))
styles.add(ParagraphStyle('LegalHeading', parent=styles['LegalBody'], fontName='LegalBold', fontSize=10.5, leading=14, spaceBefore=8, spaceAfter=6, keepWithNext=True))
styles.add(ParagraphStyle('LegalTitle', parent=styles['LegalHeading'], fontSize=21, leading=28, spaceAfter=17))

def footer(canvas, doc):
    canvas.setFont('Legal', 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, 14 * mm, 'StowGUI · Trainvent')
    canvas.drawRightString(A4[0] - MARGIN, 14 * mm, str(doc.page))

for locale, documents in json.load(sys.stdin).items():
    for kind, content in documents.items():
        path = Path(sys.argv[1]) / f'StowGUI-{kind}-{locale}.pdf'
        doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                                topMargin=19 * mm, bottomMargin=23 * mm, title=content['title'],
                                author='Trainvent', invariant=1)
        story = [Paragraph(escape(content['title']), styles['LegalTitle'])]
        for section in content['sections']:
            blocks = [Paragraph(escape(section['heading']), styles['LegalHeading'])]
            for paragraph in section['paragraphs']:
                blocks.append(Paragraph(escape(paragraph), styles['LegalBody']))
            story.extend([KeepTogether(blocks)] if section['heading'] in FORM_HEADINGS else blocks)
        doc.build(story, onFirstPage=footer, onLaterPages=footer)
        print(path)
