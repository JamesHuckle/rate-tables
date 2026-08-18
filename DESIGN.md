---
name: Rate tables
description: A transparent, source-aware workbench for turning pricing PDFs into reviewable benefit costs.
colors:
  carbon: "#242424"
  carbon-hover: "#41413e"
  carbon-soft: "#5f5f5b"
  carbon-faint: "#85857e"
  paper: "#ffffff"
  canvas: "#f7f7f5"
  canvas-deep: "#f0f0ed"
  hairline: "#e4e4df"
  hairline-strong: "#d2d2cc"
  signal-orange: "#e84a13"
  signal-orange-dark: "#a9320b"
  signal-orange-wash: "#fff4ef"
  signal-orange-stroke: "#ffb79d"
  success-green: "#237a4b"
  success-wash: "#eef8f2"
  caution-amber: "#8a5a08"
  caution-wash: "#fff8e7"
  error-red: "#b32929"
  error-wash: "#fff1f1"
typography:
  display:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(48px, 6.2vw, 82px)"
    fontWeight: 640
    lineHeight: 0.99
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 750
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 520
    lineHeight: 1.55
  action:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1
  label:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 750
    lineHeight: 1.45
    letterSpacing: "0.035em"
  data:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.45
    fontFeature: "tnum"
rounded:
  mark: "2px"
  citation: "4px"
  tag: "5px"
  chip: "6px"
  control: "8px"
  card: "9px"
  surface: "10px"
  panel: "14px"
spacing:
  micro: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.paper}"
    typography: "{typography.action}"
    rounded: "{rounded.card}"
    padding: "9px 14px"
    height: "39px"
  button-primary-hover:
    backgroundColor: "{colors.carbon-hover}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    typography: "{typography.action}"
    rounded: "{rounded.card}"
    padding: "9px 14px"
    height: "39px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    typography: "{typography.data}"
    rounded: "{rounded.control}"
    padding: "7px 9px"
    height: "36px"
  file-chip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.carbon-soft}"
    rounded: "{rounded.chip}"
    padding: "5px 7px"
  tab-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    typography: "{typography.label}"
    padding: "0 1px"
    height: "42px"
  citation-trigger:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.signal-orange-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.citation}"
    padding: "3px"
  persona-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.card}"
    padding: "11px 34px 11px 11px"
  persona-card-selected:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.card}"
    padding: "11px 34px 11px 11px"
  status-success:
    backgroundColor: "{colors.success-wash}"
    textColor: "{colors.success-green}"
    rounded: "{rounded.tag}"
    padding: "4px 6px"
  drop-zone:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.panel}"
    padding: "48px"
  rate-table:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon-soft}"
    typography: "{typography.data}"
    width: "100%"
---

# Design System: Rate tables

## Overview

**Creative North Star: "The Evidentiary Workbench"**

Rate tables feels like a quiet operations desk where every number can be inspected, tested, and traced back to paper. The system is compact and analytical without becoming clinical: paper-white surfaces, warm off-white canvas, carbon controls, hairline rules, and one signal orange create an environment that makes source truth visible rather than presenting a black-box answer.

The landing view introduces the same world with more air and one physical metaphor: a PDF upload sheet resting over offset paper layers. Once a source is loaded, decoration recedes and the interface becomes a single adjoining work surface. Density is intentional, hierarchy is typographic, and state is explained in words as well as colour.

**Key Characteristics:**

- Paper-white working surfaces over a warm, low-contrast canvas.
- Compact Manrope typography with decisive weight and tabular figures.
- Signal orange reserved for provenance, active state, and required attention.
- Hairline divisions that make tables, rules, configuration, and cost read as one model.
- Soft elevation only for real overlap: uploaded sheets, popovers, and processing states.
- Source-aware details placed beside the values or decisions they explain.

## Colors

The palette is operational and mostly neutral; orange acts like an annotation mark, while green, amber, and red communicate explicit evaluation states.

### Primary

- **Signal Orange** (`signal-orange`): Marks citations, active tabs, selected checks, focus outlines, and the upload action's icon treatment.
- **Burnt Annotation** (`signal-orange-dark`): Carries source links and compact text actions where full orange would be too bright.
- **Orange Paper Wash** (`signal-orange-wash`): Highlights the matched rate, selected binary choice, and source-related icon wells without flooding a surface.
- **Selection Peach** (`signal-orange-stroke`): Provides the doubled hairline around selected cards and binary choices.

### Secondary

- **Verified Green** (`success-green`) and **Verified Wash** (`success-wash`): Confirm privacy, source notes, availability, and successful evaluation.
- **Review Amber** (`caution-amber`) and **Review Wash** (`caution-wash`): Mark extraction or evaluation states that need human attention.
- **Blocking Red** (`error-red`) and **Blocking Wash** (`error-wash`): Mark invalid files, disallowed choices, and exclusion rules.

### Neutral

- **Carbon** (`carbon`): Primary text, high-confidence totals, and the main action surface.
- **Carbon Hover** (`carbon-hover`): The sole lifted tone for a hovered primary action.
- **Soft Carbon** (`carbon-soft`): Supporting copy, table values, and secondary control text.
- **Faint Carbon** (`carbon-faint`): Metadata, helper copy, inactive tabs, and step labels.
- **Paper** (`paper`): The working surface for upload, review, fields, cards, and final cost.
- **Warm Canvas** (`canvas`): The page ground and the configuration/persona bands inside the workbench.
- **Pressed Canvas** (`canvas-deep`): Counts, effect tags, progress tracks, and other inset utility surfaces.
- **Hairline** (`hairline`) and **Strong Hairline** (`hairline-strong`): Structural divisions and interactive control boundaries.

### Named Rules

**The Annotation Ink Rule.** Orange identifies provenance, selection, focus, or a required fact; it is not a general-purpose fill for large regions.

**The State Has a Name Rule.** Green, amber, and red always appear with readable status text or an icon, never as the only carrier of meaning.

## Typography

**Display Font:** Manrope (with system sans-serif fallbacks)  
**Body Font:** Manrope (with system sans-serif fallbacks)  
**Data Font:** Manrope with tabular numerals; the raw schema alone uses the system monospace stack.

**Character:** One variable sans family keeps the product direct and contemporary. Personality comes from unusually tight display spacing, compact labels, and confident weights rather than from pairing decorative typefaces.

### Hierarchy

- **Display** (640, fluid 48–82px, 0.99 line-height): The landing promise and processing headline; mobile settles at 50px.
- **Headline** (700, 23px, 1.2 line-height): Upload and empty-state action headings.
- **Title** (750, 14px, 1.25 line-height): Numbered workflow sections and pane headings.
- **Body** (520, 13px, 1.55 line-height): Descriptive product copy and supporting explanations, generally kept under 500px.
- **Action** (700, 13px, 1 line-height): Main buttons and decisive controls.
- **Label** (750, 10px, 1.45 line-height): Field labels, metadata, table headings, and compact operational copy. Kicker labels may rise to weight 800 and use uppercase tracking.
- **Data** (500, 11px, 1.45 line-height): Dense tables and cost lines; currency columns and totals use tabular numerals.

### Named Rules

**The Compact Evidence Rule.** Metadata and provenance stay small but never faint enough to disappear; reserve the display scale for the entry story, not the working surface.

**The Numbers Hold Still Rule.** All monetary values, step numbers, and totals use tabular figures so comparisons do not shift as values change.

## Layout

The product has two spatial modes. The landing composition is centered within a 1160px maximum, pairing a concise promise with a decisive upload sheet. The loaded state becomes one white workspace capped at 1540px, with a source strip and person scenarios above an adjoining review/configuration split. The desktop split gives roughly two-thirds of the width to evidence and one-third to configuration.

The base rhythm is compact and repeats 8px, 16px, and 24px intervals. Masthead and pane edges align to 24px on desktop and 16px on small screens. Tables favor information density, 10px vertical cell padding, and 9px header type; they scroll horizontally instead of crushing columns.

At 1024px the split tightens and source controls wrap. At 780px, the landing becomes one column, person cards stack, and the workbench unfolds into the narrative sequence: test a person, review the model, configure the benefit, then read the cost. At 480px, tab rows may scroll and secondary masthead metadata disappears. The 64px sticky masthead remains the stable product anchor throughout.

**The One Surface Rule.** Inside the loaded workspace, adjoining panes and hairlines express relationship; do not turn every section into a floating card.

**The Story Survives Collapse Rule.** Responsive stacking must preserve source → person → evidence → configuration → cost in that order.

## Elevation & Depth

The system is flat by default. Tonal bands and one-pixel rules carry most hierarchy. Shadows are reserved for physical or temporal overlap: the upload document stack, processing sheet, persona editor, and citation popover. Even elevated elements retain a visible hairline so depth never replaces structure.

### Shadow Vocabulary

- **Button Press** (`0 1px 1px rgb(0 0 0 / 12%)`): A minimal grounding shadow on the carbon primary button.
- **Document Lift** (`0 18px 55px rgb(31 31 26 / 8%)`): The upload sheet above its offset paper layers.
- **Processing Lift** (`0 18px 60px rgb(31 31 26 / 8%)`): The isolated processing panel.
- **Popover Lift** (`0 16px 40px rgb(27 27 23 / 14%)`): The editable-person overlay.
- **Citation Lift** (`0 10px 30px rgb(30 30 26 / 13%)`): The small evidence excerpt above a table or trace.

### Named Rules

**The Overlap Earns Shadow Rule.** A surface receives a shadow only when it physically overlaps another surface or represents temporary focus; persistent workspace regions stay flat.

## Shapes

The form language is gently squared: compact controls use 8–10px corners, large document-like sheets use 14px, and tiny evidence tags use 4–6px. The softened geometry keeps dense operations UI approachable without making it bubbly. The four-tile brand mark is the exception: 2px corners, a slight counter-clockwise tilt, and alternating carbon/orange blocks give the masthead a human registration-mark quality.

Borders are one-pixel neutral hairlines. Selected controls retain their original silhouette and add a peach outline plus a one-pixel inset line rather than changing size. Circular forms are limited to status glyphs and the processing orbit.

**The Soft Square Rule.** Prefer compact rounded rectangles over pills; radius communicates scale, not decoration.

## Components

### Buttons

Buttons feel decisive and restrained, with a tiny physical press rather than ornamental animation.

- **Shape:** Soft square controls (9px radius) with a 39px minimum height; compact actions use 34px.
- **Primary:** Carbon fill, white action text, and 9px × 14px padding. Hover moves to Carbon Hover; active state moves down 1px.
- **Secondary:** Paper fill with a Strong Hairline border; hover shifts to Warm Canvas.
- **Text:** Burnt Annotation text on no fill; underline appears only on hover.
- **Focus:** A 2px Signal Orange outline offset by 2px applies across all interactive controls.

### Chips

Chips are document metadata, not promotional badges.

- **Style:** Warm Canvas fill, Hairline border, Soft Carbon text, a 6px radius, and 5px × 7px padding.
- **State:** File icons use Signal Orange; page counts use Faint Carbon. Status and rule-effect tags use the semantic wash/text pair and a tighter 5px radius.

### Cards / Containers

Cards appear only for discrete selectable objects or actual sheets.

- **Corner Style:** Person cards use 9px; popovers and utility surfaces use 8–10px; the upload sheet uses 14px.
- **Background:** Paper over Warm Canvas, with Pressed Canvas reserved for inset utility areas.
- **Shadow Strategy:** Person and formula cards stay flat; only overlapping sheets and popovers use the shadow vocabulary.
- **Border:** Hairline by default, Strong Hairline for inputs, Selection Peach for selected controls.
- **Internal Padding:** Compact cards use 11–18px; document panels may use up to 48px.

### Inputs / Fields

Inputs are compact, plain, and source-aware.

- **Style:** Paper fill, Strong Hairline stroke, 8px corners, 36px minimum height, and 7px × 9px padding.
- **Focus:** Signal Orange border with a translucent orange 2px halo; global keyboard focus also keeps the offset outline.
- **Error / Disabled:** Error borders pair with a red explanatory line and warning icon. Disabled choices include “unavailable” in their option text.

### Navigation

The 64px sticky masthead uses a translucent paper layer with backdrop blur and a single bottom hairline. Workspace tabs are compact text controls on the working surface; the active tab switches to Carbon and receives a 2px Signal Orange underline. Count badges use Pressed Canvas rather than the accent.

### Rate Tables

Tables are the evidentiary core: uppercase compact headers on Warm Canvas, hairline-separated rows, right-aligned tabular currency, bold totals, and an Orange Paper Wash for the matched row. Source citations sit in the row they support. On narrow screens the table keeps its 650px minimum width and scrolls within a labelled keyboard-focusable region.

### Person Scenarios

Person cards combine a compact avatar, identity, relevant facts, and an explicit selected check. Selection uses a peach double hairline and orange check without filling the entire card, preserving readability and comparison across scenarios.

### Source Citations

Citation triggers are small Burnt Annotation links placed adjacent to the rate, rule, or cost trace they substantiate. Opening one creates an 8px-corner paper popover with source name, page number, and excerpt; provenance stays local to the decision rather than moving to a detached references screen.

### Cost Summary

The cost summary anchors the bottom of the configuration pane on Paper with a Strong Hairline top edge. The 30px total leads, employer/employee rows use aligned figures, and a textual semantic badge states Available, Unavailable, Needs review, or Declined. The expandable trace preserves citations for each cost contribution.

## Do's and Don'ts

### Do:

- **Do** keep the loaded experience as one adjoining workbench divided by one-pixel hairlines.
- **Do** place a citation trigger beside the exact value, rule, or cost contribution it supports.
- **Do** use Signal Orange for active, selected, focused, required, and source-aware moments.
- **Do** preserve compact Manrope labels and tabular figures in dense tables and cost summaries.
- **Do** pair every semantic colour with readable status text or a recognisable icon.
- **Do** preserve the workflow order when the desktop panes collapse to a single column.

### Don't:

- **Don't** use Signal Orange as a large decorative background or a default button fill.
- **Don't** add shadows to persistent tables, configuration groups, or ordinary cards.
- **Don't** separate evidence from the value or decision it substantiates.
- **Don't** replace hairline structure with a collection of floating rounded cards.
- **Don't** compress tables until columns become ambiguous; keep horizontal scrolling and its labelled region.
- **Don't** use colour alone to communicate extraction confidence, availability, or errors.
