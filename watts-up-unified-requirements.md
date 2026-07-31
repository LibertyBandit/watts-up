# Watts Up — Unified Requirements
Supersedes: watts-up-requirements.txt, watts-up-revision-1- through revision-9-requirements.txt
Last updated: 2026-07-12 (through Revision 24 + column-layout follow-up fixes)

---

## 1. Program Overview

Single-file browser application for aircraft electrical load analysis. Organizes the aircraft
power distribution system as a hierarchical tree. Documents load changes associated with an
aircraft modification and calculates net changes, new loads, and remaining capacity for each
affected item.

---

## 2. Aircraft Metadata

Fields collected at startup and editable thereafter:
- Aircraft Make
- Aircraft Model
- Marketing Designation
- Serial Number
- Flight Phase / Scenario — free text, default: **Cruise**

---

## 3. Item Types

### 3.1 Root
- **Aircraft Total** — available only when Parent = "No Parent (New Root)"

### 3.2 Generation
- Generator
- Alternator
- Battery

### 3.3 Conversion (Paired IN/OUT)
Each conversion device is added as two linked nodes: the **IN** node (input side) is the parent;
the **OUT** node (output side) is its child. Labels are suffixed "(IN)" and "(OUT)".

Efficiency factor: default **0.85**; input = output / efficiency; output = input × efficiency.

| Type | IN side | OUT side | Default convPf |
|---|---|---|---|
| TRU | AC | DC | **0.95** |
| Inverter | DC | AC | 1.0 |
| Transformer | AC | AC | 1.0 |
| DC-DC Converter | DC | DC | 1.0 |
| Frequency Converter | AC | AC | 1.0 |

Power conversion input formulas:
- W(IN) = (V(OUT) × A(OUT)) / efficiency
- For AC input: VA(IN) = W(OUT) / (efficiency × convPf)

convPf applies to **all** AC conv-item calculations (capacity, existing load, load, net change,
new load). convPf field is visible in the dialog for TRU, Inverter, and Frequency Converter.

**Only TRU is offered for new items** *(2026-07-24)* — the other four conversion types are rare
enough in practice that they're no longer actively supported for new item creation. This is a
dropdown-level filter only (`SELECTABLE_CONVERSION_TYPES`): the table above, the IN/OUT AC-DC
lookups, `convPfDefault()`, and every conversion calculation remain fully generic and
type-agnostic — a node of a non-TRU conversion type already present in loaded data (an older
save, a JSON import) still calculates, renders, and exports correctly, and opening Edit on it
keeps its own type selectable in the dropdown (it just won't appear when creating a *new*
item). Restoring a type for new-item use is a one-line change to
`SELECTABLE_CONVERSION_TYPES`.

### 3.4 Distribution / Protection
- Feeder
- Bus
- Circuit Breaker
- Fuse

### 3.5 Load
Terminal node; has a Load Value field; no children allowed.

---

## 4. Power Units and Formulas

### 4.1 AC Items
**Capacity and Reserve:** Amps (A), Volt-Amps (VA)
**All load columns (Existing Load, Load, Net Change, New Load):** A, VA, W, VAR, pf

Formulas:
- VA = V × A = W / pf = √(W² + VAR²)
- W  = VA × pf = √(VA² − VAR²)
- pf = W / VA; valid range 0 ≤ pf ≤ 1
- VAR = √(VA² − W²) = √(VA² − (VA × pf)²)

Default on save (if user did not provide sufficient info): VAR = 0, pf = 1.
*(Applied only at save time; fields are left blank during entry.)*

**AC vector-sum aggregation:**
1. Add W and VAR algebraically across children
2. Recalculate VA = √(W² + VAR²)
3. Recalculate A = VA / V
4. Recalculate pf = W / VA

### 4.2 DC Items
**All columns (Capacity, Existing Load, Load, Net Change, New Load, Reserve):** Amps (A), Watts (W)

Formulas: A = W / V; W = V × A

**DC scalar-sum aggregation:** add amps; W = V × A.

---

## 5. Tree Display (Left-Hand Pane)

- Pre-order traversal; branches grouped under their parent node
- "Root" label suppressed from display
- Node label format: Description `[RefDes]` — RefDes in square brackets appended to description,
  rendered in subdued (secondary) text; RefDes omitted if blank
- Net change badge displayed per node:
  - AC items: VA value
  - DC items: A value
  - Positive NC: orange; Negative NC: green
- Collapse / expand toggle per node
- **Edit** button on each node
- **Add Child** button on each node — **hidden** for terminal nodes (Load type or Removed status)

---

## 6. Summary Table (Right-Hand Pane)

- Pre-order traversal matching the left-hand pane order
- Description column: same `Description [RefDes]` format; no separate RefDes column
- Column header units in parentheses, e.g., "Capacity (VA)"
- Rows color-coded for warnings (yellow) and overload (red)

### 6.1 DC Summary columns
| Capacity | Existing Load | Load | Net Change | New Load | Reserve |
|---|---|---|---|---|---|
| A, W | A, W | A, W | A, W | A, W | A, W |

### 6.2 AC Summary columns
| Capacity | Existing Load | Load | Net Change | New Load | Reserve |
|---|---|---|---|---|---|
| A, VA | A, VA, W, VAR, pf | A, VA, W, VAR, pf | A, VA, W, VAR, pf | A, VA, W, VAR, pf | A, VA |

### 6.3 Section ordering and labels
- Labels: **"DC Summary"** and **"AC Summary"**
- If the first root node is AC: AC Summary first, then DC Summary
- If the first root node is DC: DC Summary first, then AC Summary

---

## 7. Edit Item Dialog

*(Previously named "Edit Item(s)"; renamed to "Edit Item" in Revision 7.)*

### 7.1 Field layout
1. **Parent Item** dropdown (top of dialog)
   - Excludes children and descendants of the current item
   - Includes "No Parent (New Root)" option
2. **Item Type** dropdown
   - "Aircraft Total" visible only when Parent = "No Parent (New Root)"
3. **Status**: Existing / New / Removed
4. **Volts** and **AC / DC** (see §7.2 for locking rules)
5. Description (free text)
6. RefDes (optional)
7. Context-sensitive sections below (§7.3–7.9)

### 7.2 Volts and AC/DC locking rules
| Scenario | Volts | AC/DC |
|---|---|---|
| Parent exists; regular (non-conv) node | Locked to parent value | Locked to parent value |
| Conv IN node; parent exists | Locked to parent value | Locked to device type |
| Conv IN node; no parent | Editable | Locked to device type |
| Conv OUT node | Editable | Locked to device type |
| No parent (new root); regular node | Editable | Editable |

*Revised 2026-07-19 (Round 3):* this table still governs each node's own underlying voltage/
AC-DC values, but the top-level Volts/AC-DC row is now **hidden entirely** for any conversion
IN or OUT node — showing it made the dialog behave differently depending on which side of the
pair you opened Edit on (locked when editing IN, editable when editing OUT), which read as
inconsistent. Conversion items now show and edit both sides' voltage consistently via the
Conversion Parameters section's own Identity row instead — see §7.9.

### 7.3 Capacity section (non-load items)
- DC: A, W
- AC: A, VA
- **Reset button**: Clears all fields in this section (A and W for DC; A and VA for AC)

### 7.4 Existing Load section
- DC: A, W
- AC: Row 1 — A, VA; Row 2 — W, VAR, pf
- For **new** non-load items: replaced by a **Load** field; Load field hidden if item has children
- **Reset button**: Clears all fields in this section (A and W for DC; A, VA, W, VAR, pf for AC)

### 7.5 Load section (Load-type items only)
- DC: A, W
- AC: Row 1 — A, VA; Row 2 — W, VAR, pf
- **Reset button**: Clears all fields in this section (A and W for DC; A, VA, W, VAR, pf for AC)

### 7.6 Net Change Override section
- DC: W field + A field (A and W auto-derive from each other)
- AC: W field + VAR field (VAR defaults to 0 on save if left blank)
- **Hidden** when the item has children
- **Reset button**: Clears all fields in this section

### 7.7 AC field derivation formulas

*Revised in the Revision 27 Calculate & Save modification (2026-07-19).* Implemented once, in
`calcAcPowerGroup()`, and shared by every AC entry point in the app — the Edit Item dialog's
Save button, its Calculate button, the Add Item(s) modal's Save, and the grid's Calc and Save
buttons all apply these exact rules, instead of Save using a separate, more limited function
that could drift out of sync with Calculate (as it had before this revision). Never overwrites
a field the user already entered — only blank fields are filled in.

**Single field entered** (unity power factor assumed):

| Field(s) entered | Fields derived | Comments |
|---|---|---|
| A | VA, W | VAR = 0; pf = 1 |
| VA | A, W | VAR = 0; pf = 1 |
| W | A, VA | VAR = 0; pf = 1 |

**Two fields entered:**

| Field(s) entered | Fields derived | Comments |
|---|---|---|
| A, W | VA, VAR, pf | VA is derived from A first (VA = V×A); VAR and pf are then calculated from that derived VA and the given W |
| VA, W | A, VAR, pf | |
| A, VAR | VA, W, pf | |
| VA, VAR | A, W, pf | |
| W, VAR | A, VA, pf | VA = √(W²+VAR²), sign following W's sign |
| W, pf | A, VA, VAR | VA is derived from W and pf first (VA = W/pf); A and VAR are then calculated from that derived VA |

**Combinations not listed above** (A+VA, A+pf, VA+pf, VAR+pf alone) fall through to the same
general derivation logic rather than a special-cased rule: A+pf and VA+pf resolve completely
(both give a real answer), A+VA leaves W/VAR/pf blank (redundant inputs, no new information),
and VAR+pf alone stays entirely a no-op — there is no anchor value (A, VA, or W) to establish a
magnitude from, so nothing can be derived. If nothing at all is entered, the historical default
(VAR = 0, pf = 1, all magnitudes zero) still applies.

### 7.8 Auto-clear on first entry (Revision 9)
When the user types into any field in a section (Capacity, Existing Load, Load, Net Change Override)
for the first time after opening the dialog, all other fields in that section are automatically
cleared. This fires once per section per dialog open session, enabling a clean Calculate workflow
without requiring a manual Reset first.

### 7.9 Conversion parameters section (conversion items only)
- **Efficiency** input (default 0.85)
- **convPf** input — visible for TRU, Inverter, and Frequency Converter
  (default: TRU = 0.95, Inverter = 1.0, FC = 1.0)
- Four-row layout with Reset button per row (Identity row has no Reset — nothing there is
  cleared to blank, only edited):

| Row | DC-side fields | AC-side fields |
|---|---|---|
| Identity | IN Volts (read-only), IN AC/DC (read-only), OUT Volts (editable), OUT AC/DC (read-only) | same |
| Row 1 — Capacity | Input Cap (A), Input Cap (W) | Input Cap (A), Input Cap (VA) |
| Row 2 — Existing Load | Input Exist. Load (A), Input Exist. Load (W) | Input Exist. Load (A), Input Exist. Load (VA) |
| Row 3 — Efficiency/PF | Efficiency, Conv. Power Factor (Reset) | — |

Each row's Reset button clears all fields in that row.

**Identity row and dialog unification** *(added 2026-07-19, Round 3)*: this section — and now
the whole conversion-pair editing experience — is identical regardless of whether Edit was
opened on the IN node or the OUT node. IN Volts, IN AC/DC, and OUT AC/DC are read-only displays
(IN's voltage is governed by §7.2's normal rules; both AC/DC types are fixed by the conversion
Type per §3.3, never a free choice); OUT Volts is the one editable field here, since it's the
one voltage previously unreachable when Edit was opened from the IN side. The dialog's ordinary
top-level Volts/AC-DC row (§7.2) is hidden for conversion items entirely, avoiding two editable
fields for the same OUT voltage. Efficiency and Conv. Power Factor are now **always editable**
regardless of which side you opened Edit on (previously disabled when viewing OUT, which made
the dialog behave inconsistently depending on role) — both are validated (Efficiency: 0.01–1.0)
and persisted to the IN node's own stored fields regardless of which side's dialog you saved
from.

**Row 1 (Capacity) and Row 2 (Existing Load) cross-derivation** *(revised 2026-07-19)*, applied
identically by the Calculate button and by Save (Edit Item dialog and Add Item(s) modal alike):
- If the user enters values for **both** the IN and OUT side of a row (e.g. IN Cap (A) and OUT
  Cap (A)), each side is calculated independently — no cross-derivation, since both are already
  known.
- If the user enters a value for **only one side** and leaves the entire other side blank, that
  entered side's own missing unit is filled first (e.g. OUT Cap (A) → OUT Cap (W) using
  W = V×A), then the **opposite side's** values are derived from it via efficiency (and convPf,
  for whichever side happens to be AC) — matching §3.3's formulas (input = output / efficiency;
  output = input × efficiency). Previously the opposite side was simply left blank/zeroed
  instead of derived.

### 7.10 Duplicate button
- Copies the current node; appends "(copy)" to the description
- For Conv IN nodes: also copies the paired OUT child node (child of the copy)

### 7.11 Formula entry
All numeric fields accept Excel-style expressions starting with `=` (e.g., `=28*2` → `56`).

### 7.12 Calculate button
Fills blank fields from entered values using power formulas. Applies on button press; also
applies automatically on Save (the Edit Item dialog's Save, the Add Item(s) modal's Save, and
the grid's own Save button all run the identical derivation, not just a "remaining blanks"
pass — see §7.7).
- **AC sections**: derives per the field table in §7.7 (`calcAcPowerGroup()`, shared everywhere)
- **DC sections**: derives missing A or W using A = W/V or W = V×A
- **Conversion items**: Capacity and Existing Load cross-derive between the IN and OUT sides via
  efficiency and convPf when only one side was entered; both sides calculate independently when
  entered separately — see §7.9

---

## 8. Add Item(s) Dialog

### 8.1 Field layout

*Revised 2026-07-23 (Round 4).*
1. **Parent Item** dropdown (top)
   - Excludes children/descendants of any selected item
   - Includes "No Parent (New Root)" option
2. **Item Type** dropdown — "Aircraft Total" only when Parent = "No Parent"
3. **Volts** — a single shared, read-only field (one value for every row, since they all share
   the same Parent), positioned between Item Type and AC/DC. Locked to the parent's voltage
   whenever a parent is selected (same rule as Edit Item §7.2, for both regular and
   conversion-IN nodes); editable only when adding new root-level items. No longer a per-row
   column.
4. **AC / DC** selector — locked to parent's AC/DC when parent is selected
5. **Status**: Existing / New / Removed — now also determines which numeric column group the
   table shows (§8.3), not just node metadata
6. "Items to Add" table (§8.3)
7. **Duplicate row button** per row — copies the row and appends "(copy)" to the description
8. Modal width auto-adjusts to fit however many columns the current Type/AC-DC/Status
   combination needs (a simple non-conversion row fits around 1000px; a conversion row with
   its fuller field set can reach ~1250px), instead of a single fixed width.

### 8.2 State memory
- On open: fully reset the table (clear DOM and row data) and display one blank row
- Remember last-used Item Type and Status; restore on next open

### 8.3 Table columns (context-sensitive)

*Revised 2026-07-23 (Round 4):* the column set, order, and units-of-measure now match
whichever grid corresponds to the row's Status — Existing/Removed grid's columns for
existing/removed status, Installed grid's columns for installed status — with inapplicable
columns omitted entirely rather than shown disabled, since every row here is a distinct new item,
not a shared editing form. All row types still include Description and Ref Des first.

| Item / Status | Columns (in order) |
|---|---|
| Non-load, existing/removed | Capacity (A, VA or A, W) + **Existing Load** (A, VA, W, VAR, pf or A, W) |
| Non-load, installed | Capacity (A, VA or A, W) + **Net Change** (A, VA, W, VAR, pf or A, W) — every row is childless at creation, so this is always available for a new non-load item |
| Load, any status | **Load** (A, VA, W, VAR, pf or A, W) |
| Conversion item, any status | Eff., OUT Volts, then **IN Cap**, **IN Load**, **OUT Cap**, **OUT Load** in that order, each group showing (A) first followed by (VA) for an AC side or (W) for a DC side |

Existing Load and Net Change are mutually exclusive on the same row — matching how the
Existing/Removed and Installed grids never show both groups either.

**Calculation** *(added 2026-07-23, Round 4)*: every AC group that includes W/VAR/pf
(Existing Load, Load, Net Change) and every conversion Cap/Load pair no longer auto-calculates
on entry — the same `calcAcPowerGroup()`/`calcConvPairRow()` functions used everywhere else in
the app (§7.7, §7.9) now drive a per-row **Calc** button, and run automatically on Save for any
fields still blank. Capacity (a simple 2-key A/VA-or-W group with no VAR/pf) is unaffected and
keeps auto-deriving freely, same as it always has. Every column group — including Capacity —
gets its own **Reset** button, matching the grids' one-reset-per-group convention.

Formula entry applies to all numeric columns.

### 8.4 Volts and AC/DC locking
Same rules as Edit Item §7.2. Volts is now a single field shared by every row (§8.1); AC/DC
remains a single shared selector as before.

### 8.5 Root creation shortcut
**"+ Root" button** in the tree panel header opens the Add Item(s) dialog with
Parent pre-set to "No Parent (New Root)".

---

## 9. Multiple Root Nodes

- Any number of independent root nodes allowed
- Default root: type "Aircraft Total", Volts 115, AC
- Last remaining root node cannot be deleted
- Changing a node's parent to "No Parent (New Root)" promotes it to a root node
- "+ Root" button (§8.5) and Duplicate button (§7.10) are additional creation paths

---

## 10. Calculations

### 10.1 Net Change (bottom-up propagation)
| Node condition | Net Change value |
|---|---|
| Load, status = New | loadValue |
| Load, status = Removed | −loadValue |
| Load, status = Existing | zero |
| Non-load, status = Removed | −existingLoad |
| Non-load with netChangeOverride | override value |
| Non-load, standard | sum of children NCs (passing through efficiency for conv children) |
| Conv IN node | derived from conv OUT NC via efficiency and convPf |

### 10.2 Derived totals
- **New Load** = existingLoad + netChange
- **Reserve** (formerly "Remaining Capacity") = capacity − newLoad

---

## 11. Warnings

| Condition | Warning |
|---|---|
| Negative load value entered | Warn on entry |
| New load is negative after net changes applied | Warn |
| New load exceeds item capacity (a blank/never-entered capacity counts as zero for this comparison — a positive new load against no capacity at all warns exactly as it would against an explicit 0) | Warn |
| User adds children to a Load or Removed item | Warn |
| User adds children after manually entering a net change override | Warn |
| Non-load Removed item | Existing load entered as negative net change |
| Non-load Existing or Removed item has no existing load entered (existing load reads as zero — the data model can't distinguish "never entered" from an explicit 0, so 0 is treated as blank, same convention as the blank-capacity case above) | Warn |
| An Existing-status item's immediate Existing/Removed children's existing loads (existing load for non-load children, load value for Load children) sum to more than the item's own existing load — **W (real power) only.** The VAR half of this check (comparing summed children VAR against the parent's own VAR, AC items only) is **disabled** as of the Revision 36 cleanup round: rounding/derivation noise accumulated through the calculation chain produced too many spurious near-miss warnings in practice. A rounding-and-tolerance formula would be the better long-term fix; until then, only W is compared. | Warn |

---

## 12. Data Persistence

- **Export JSON**: metadata + full node tree → file named `WattsUp_{make}_{model}_{serial}_{date}.json`
- **Import JSON**: restores a previously exported analysis
- **Auto-save to localStorage**: state persisted across page refreshes

---

## 13. Print / Export Report (Revisions 10–13)

### 13.1 Print Settings Dialog
Clicking "Print Report" opens a settings dialog before printing. The dialog contains:
- **AC Summary — Columns to Include**: checkboxes for each sub-unit under each group (§13.2)
- **DC Summary — Columns to Include**: checkboxes for each sub-unit under each group (§13.3)
- **Options**: Conv IN NC-only toggle
- Buttons: Reset to Defaults | Cancel | Print

### 13.2 AC Report Column Groups and Defaults
All AC groups offer A, VA, W, VAR, pf for selection.

| Group | Default units selected |
|---|---|
| Capacity | VA |
| Existing Load | VA, W, VAR, pf |
| Installed (Removed) | W, VAR |
| Net Change | W, VAR |
| New Load | VA, W, VAR, pf |
| Reserve | VA |

### 13.3 DC Report Column Groups and Defaults
A and W selected by default for all groups: Capacity, Existing Load, Installed (Removed),
Net Change, New Load, Reserve.

### 13.4 Ampere Rating in Name (Protection Devices)
If the user deselects "A" from Capacity, Circuit Breakers and Fuses still show their
ampere rating right-justified within the description cell: `FWD UPPER CB [581CB1]  (7.5 A)`.
The amp text floats to the right side of the cell.

### 13.5 Conversion Input (IN) Nodes — Net Change Only
By default, Conv IN nodes (TRU input side, etc.) display values only in the Net Change columns;
all other columns show "—". This reflects that the input side change is driven by output loading.
Togglable via the "Conv IN NC-only" option in the Print Settings dialog.

### 13.6 Negative Values and Removed Loads
Negative values and removed-load entries are shown in parentheses instead of with a minus sign.
For example, a removed 2.5 A load displays as `(2.5)`.

### 13.7 Adaptive Number Rounding
| Range | Format |
|---|---|
| pf | X.XX (exactly 2 decimals) |
| \|n\| < 10 | X.XXX (trailing zeros suppressed) |
| 10 ≤ \|n\| < 100 | XX.XX |
| 100 ≤ \|n\| < 1,000 | XXX.X |
| 1,000 ≤ \|n\| < 10,000 | X,XXX |
| 10,000 ≤ \|n\| < 100,000 | round to nearest 10 |

Zero-valued cells (< 0.0005 absolute) display as "—".

### 13.8 Report Header
Includes: Make, Model, Marketing Designation, Serial #, Flight Phase, and print date.

### 13.9 Section Ordering and Labels
AC section first if the first root node is AC; DC section first otherwise. Warnings section
follows. Section labels include voltage: e.g., "115 VAC Summary" or "28 VDC Summary" (derived
from the root node voltage; falls back to "AC Summary" / "DC Summary" if no root voltage).

### 13.10 Tree Grouping, Layout, and Visual Hierarchy

Within each parent's children, items are ordered: existing first, then a "Removed" label row
followed by removed items, then an "Installed" label row followed by new items. Label rows span
the full table width at the same indentation as the items they introduce.

**Label suppression**: once a "Removed" or "Installed" label has been emitted for a given parent,
all descendants in that branch inherit the label context — no additional labels are inserted
for their children.

**Depth-based font sizes**: row font size = max(6.5, 8.5 − depth × 0.5) pt. Depth 0 rows
render at 8.5 pt; each additional level reduces by 0.5 pt, with a floor of 6.5 pt (reached at
depth ≥ 4). The font size applies to the entire row — description and all numeric cells.

**Branch-transition spacer rows**: when the tree traversal returns to a shallower depth (a new
sibling branch starts), a blank spacer row is inserted before the first node at the shallower
level. Spacer height = max(1.5, 7 − depth × 1.5) pt; bottom border weight =
max(0.75, 3 − depth × 0.5) pt solid. Spacer rows are not inserted before "Removed" or "Installed"
label rows.

**Parent-child separator border**: when a parent node and its first child both have non-zero
net changes (the child contributes to the parent's net change), a 0.75 pt top border is drawn
on the child's row to visually separate the parent-child boundary.

**Header**: the top-left header cell (description column) is blank — no "Component" label.

### 13.11 Status Formatting and Column Suppression

**Row text formatting:**
- Removed items: description in italic, black font
- New items: description in bold
- No strikethrough

**Column suppression by status** (live summary table and print report):

| Item status | Existing Load | New Load | Reserve |
|---|---|---|---|
| Existing | shown | shown | shown |
| New | — | shown | shown |
| Removed | shown | — | — |

New items have no pre-modification load to display; removed items have no post-modification
state to display.

---

## 14. Revision 14 — Document Metadata, References, and Notes

### 14.1 New `meta` fields

**Document identity:**
- `documentNumber` — e.g., "RPT1234"
- `revisionLevel` — e.g., "A", "B", "1"
- `preparedBy` — free text
- `approvedBy` — free text
- `revisionDate` — free text (e.g., "Jun-20-2026"; not a date picker)

**Document section prose** (editable in Watts Up; later round-tripped via Word content controls):
- `introText` — multi-line free text. Default: blank.
- `generalNotes` — ordered array of strings (bulleted in report). Default: `[]`.
- `complianceText` — multi-line free text. Default: blank.

**Reference list:**
- `references` — ordered array of reference objects (see §14.2). Default: `[]`.

### 14.2 Reference object schema

```json
{
  "key": "<uuid>",
  "organization": "Gulfstream",
  "docNumber": "GC514696308",
  "title": "Supplementary Electrical Load Analysis",
  "revision": "–",
  "date": "September 20, 2006"
}
```
- `key` — internal stable UUID; used by per-node `rowRefs` to survive reordering
- `organization`, `docNumber`, `title` — required
- `revision`, `date` — optional; omit or blank if not applicable
- Display number (1, 2, 3…) is derived from list order at render time, not stored

### 14.3 New per-node fields

Added to every node:
- `rowNotes` — ordered array of `{ key: "<uuid>", group: "<group id>"|null }` objects (0–N note
  associations tied to this row). `key` references an entry in `meta.rowNoteDefs` — the shared
  note-text bank (Revision 36, §39) — rather than storing text inline, so the same note can be
  associated with multiple items/groups without duplicating its text. `group` is `null` when the
  note is scoped to the item itself, or one of `cap`/`exload`/`nc`/`newload`/`rem` when scoped to
  a specific value-group (Revision 33 Phase 2, §34 — see there for the legal-group rules).
- `rowRefs` — ordered array of `{ key: "<uuid>", comment: "<string>", group: "<group id>"|null }`
  objects
  - `key` references an entry in `meta.references`
  - `comment` is optional; blank = no comment
  - `group` follows the same rules as `rowNotes.group` (Revision 33 Phase 2, §34)

`meta.rowNoteDefs` — ordered array of `{ key: "<uuid>", text: "<string>" }`, the shared note-text
bank (Revision 36, §39). Managed in the Document tab (§14.5) and via the Edit Item dialog's
Notes & References checklist (§14.6).

### 14.4 Top-level tab layout

The app gains two top-level tabs replacing the current single-panel layout:

- **Analysis** tab — the current tree + summary table view (unchanged)
- **Document** tab — all document metadata, references, notes, and section prose

The aircraft metadata bar (Make, Model, Designation, Serial #, Flight Phase) moves into the
Document tab. The toolbar (New, Import, Export JSON, Print Report) remains always visible.

### 14.5 Document tab layout

Five sub-sections within the Document tab:

**A. Aircraft & Document Identity** — compact inline fields:
`Make` | `Model` | `Designation` | `Serial #` | `Flight Phase` | `Doc #` | `Rev` | `Prepared by` | `Approved by` | `Rev Date`

**B. References** — managed ordered list. Each entry shows:
```
[1]  Organization  [Gulfstream              ]
     Doc Number    [GC514696308             ]
     Title         [Supplementary Electrical Load Analysis     ]
     Revision      [–        ]   Date  [September 20, 2006]
     [↑] [↓] [✕]
```
- `+ Add Reference` button appends a blank entry
- Numbers are display-only, derived from list position
- Revision and Date fields are visually de-emphasized (optional)

**C. General Notes** — managed ordered list of text inputs with `[↑] [↓] [✕]` controls.
`+ Add Note` button. Notes are bulleted (not numbered) in the report.

**D. Row Notes** (Revision 36, §39) — managed ordered list of `meta.rowNoteDefs`, structurally
identical to General Notes (`[↑] [↓] [✕]`, `+ Add Row Note`), but semantically distinct: these
are the shared bank of *per-item* notes attachable from the Edit Item dialog (§14.6), not
document-wide narrative text. Editing/reordering/removing here is immediate (matches References
and General Notes) — the same live-commit convention the Edit modal's own checklist uses for
editing a note's text. Removing an entry here doesn't check whether any item still references its
key; a dangling reference just stops rendering, same as removing a Reference.

**E. Section Text** — two labeled textareas:
- `Introduction` (maps to `introText`)
- `Compliance Statement` (maps to `complianceText`)

### 14.6 Per-row Notes & References in Edit Item dialog

New collapsible section **"Notes & References"** added below numeric fields:

**Row Notes** (Revision 36, §39 — redesigned from the original per-item text list): checklist of
all entries in `meta.rowNoteDefs` (the shared note-text bank), shown as:
```
☑  [Shared note text...................................]  Applies to: [Item ▾]
☐  [Brand new note.....................................]
```
- Check to associate this note with the item; the "Applies to" group `<select>` (same rules as
  before — see §34 — present only when the item's type/status allows group-scoped notes at all)
  appears only once checked.
- The note *text* itself is a live-editable field, not deferred to this dialog's own Save/Cancel —
  editing it here updates the shared bank entry immediately (persisted right away), exactly like
  editing a note in the Document tab's Row Notes list (§14.5), since it's shared document-level
  data rather than a per-item field.
- `+ Add New Note` appends a new, blank bank entry, checks it for the current item, and focuses
  its text field — satisfying the "select an existing note or add a new one" requirement from a
  single control, without needing a separate dialog.
- A ✕ button deletes the entry from the shared bank entirely (not just this item's own
  association) — warns with the count of *other* items still using it if any (e.g. "This note is
  also used by 2 other items. Delete it for all of them?"), or a plain "Delete this row note?"
  otherwise. Added same round as the cleanup items below (§40).
- If no row notes exist yet in `meta.rowNoteDefs`, shows dimmed message:
  *"No notes defined yet — use '+ Add New Note' below."*

**Row References:** checklist of all entries in `meta.references`, shown as:
```
☑  [1] Gulfstream GC514696308 — Supplementary Electrical Load Analysis
        Comment: [Load calculated using values from Table 3-2          ]  Applies to: [Item ▾]
☐  [2] Nextant NT0078-ELA0-0200 — ELA Supplement for SpaceX Starlink
```
- Comment field (and, when applicable, the group picker) appears only when the checkbox is checked
- If no references exist in `meta`, shows dimmed message:
  *"No references defined — add them in the Document tab."*

Same section added to the Add Item(s) dialog; comment/note fields are shared across all rows
in a batch-add session (per-row differentiation deferred).

### 14.7 Print report additions

**Notes column:** if any node has `rowNotes` or `rowRefs`, a narrow rightmost column is added
to the load table showing superscript-style markers (e.g., `¹` or `¹·³`).

**Note numbering:** assigned by DFS tree-walk order across the entire report. Row notes are
numbered sequentially (1, 2, 3…). Reference citations use the reference's display number from
`meta.references`.

**Sections added to the report** (between the report header and the load tables):

1. **General Notes** — bulleted list from `meta.generalNotes`
2. **References** — numbered list, each entry rendered as:
   `N. Organization. DocNumber. Title. Revision. Date.`
   (Revision and Date omitted if blank)

**Notes section** appended after load tables — two parts:
- Numbered list of row notes, number matching the superscript
- Row reference comments, cited as: `¹ Ref. [1]: comment text.`

### 14.8 Migration / backward compatibility

Existing JSON files load normally. Missing fields default:
- All new `meta` string fields → `''`
- `generalNotes`, `references` → `[]`
- Per-node `rowNotes` → `[]`, `rowRefs` → `[]`

---

## 15. Revision 15 — Word (.docx) Export (Phase 1)

*Last updated: 2026-06-20*

### 15.1 Overview

Add a **"Word Report"** button to the toolbar that generates and downloads a `.docx` file
containing a complete ELAA-format report. One-way export only; no JSON state is embedded and
the file cannot be re-imported in this revision. (Round-trip import deferred to Revision 16.)

The `.docx` is assembled in the browser using JSZip (loaded from CDN at runtime) by
constructing OOXML XML parts and packaging them into a ZIP archive — no server required.
JSZip requires an internet connection; the button shows an alert if JSZip is unavailable.

### 15.2 Document structure

Two sections with different page orientations:

**Section 1 — Portrait** (Letter, 1-inch margins, 9360 DXA usable width):

| Element | Content |
|---|---|
| Title | "Aircraft Electrical Load Analysis" — Heading 1 style, centered |
| Identity table | 4-column, 3-row table; each field is an inline plain-text content control |
| §1.0 Introduction | Heading 1 + block content control `wu-intro` |
| §2.0 General Notes | Heading 1 + block content control `wu-general-notes` |
| §3.0 References | Heading 1 + block content control `wu-references` |
| §4.0 Compliance Statement | Heading 1 + block content control `wu-compliance` |

**Section 2 — Landscape** (Letter, 0.75-inch margins, 13680 DXA usable width):

| Element | Content |
|---|---|
| Appendix A heading | Heading 1 |
| AC Summary (if present) | Heading 2 + load table |
| DC Summary (if present) | Heading 2 + load table |
| Notes (if any annotations) | Heading 2 + numbered list |

A continuous section break between §4 and Appendix A triggers the orientation change.

### 15.3 Identity header (content controls for field round-trip)

A 4-column table (4 × 2340 DXA columns) with three rows:

| Row | Fields |
|---|---|
| 1 | Make · Model · Designation · Serial # |
| 2 | Doc # · Rev · Prepared By · Approved By |
| 3 | Flight Phase · Rev Date · Report Date (spanning cols 3–4) |

Each field is an inline plain-text content control (`<w:sdt><w:text/>`), tagged:
`wu-make`, `wu-model`, `wu-designation`, `wu-serial`, `wu-docnumber`, `wu-revision`,
`wu-preparedby`, `wu-approvedby`, `wu-flightphase`, `wu-revdate`, `wu-reportdate`.

### 15.4 Prose sections (block content controls)

Each prose section is wrapped in a block-level `<w:sdt>` content control tagged with a stable
identifier. The tag enables Phase 2 (round-trip import) to locate and read back edits made
in Word.

| Section | Tag | Source data | When empty |
|---|---|---|---|
| Introduction | `wu-intro` | `meta.introText` | Empty paragraph placeholder |
| General Notes | `wu-general-notes` | `meta.generalNotes[]` | Empty paragraph placeholder |
| References | `wu-references` | `meta.references[]` | Empty paragraph placeholder |
| Compliance | `wu-compliance` | `meta.complianceText` | Empty paragraph placeholder |

Content controls are always present even when the source data is blank, so the document
structure is consistent regardless of fill state.

**References formatting:** each entry renders as:

```
N. Organization.  DocNumber.  Title (italic).  Rev. X.  Date.
```

Title is a separate italic run (`<w:i/>`); other fields are plain weight.

### 15.5 Load table format

Tables use `defaultPrintCfg()` column defaults (independent of the Print Settings dialog).

**Column widths** (landscape section, 13680 DXA total usable):

| Column | DXA |
|---|---|
| Description | 2880 |
| Notes (if any annotations exist) | 480 |
| Each numeric sub-column | (13680 − 2880 − 480*) ÷ column count |

*Notes column only present when at least one node has `rowNotes` or `rowRefs`.

**Row formatting** (identical rules to print report):
- New items: bold description
- Removed items: italic description
- Depth-based font size: `max(6.5, 8.5 − depth × 0.5)` pt, applied per run
- Removed / Added label rows: italic / bold text, single cell spanning full width
- Branch-transition spacer rows: 56 DXA (≈ 4 pt) exact-height empty row
- Parent-child separator: thin top border when both parent and first child have non-zero NC

**Table header:** two-row header with vertical merge on Description and Notes columns;
group labels span sub-columns horizontally; left border on first sub-column of each group.

### 15.6 Word styles defined

| Style ID | Name | Appearance |
|---|---|---|
| `Normal` | Normal | Calibri 10 pt, 0 pt before/after |
| `Heading1` | heading 1 | Calibri 13 pt bold, #2E4057, bottom border rule, keep-with-next |
| `Heading2` | heading 2 | Calibri 11 pt bold, #2E4057, keep-with-next |
| `TableGrid` | Table Grid | Standard grid borders (used by load tables) |

### 15.7 File naming

`WattsUp_{make}_{model}_{serial}_{YYYY-MM-DD}.docx`
(spaces replaced with underscores; special characters stripped)

### 15.8 OOXML parts

```
[Content_Types].xml
_rels/.rels
word/document.xml
word/_rels/document.xml.rels
word/styles.xml
word/settings.xml
```

### 15.9 Deferred to Revision 16

- Embedding JSON state as a Custom XML Part for round-trip project save/open
- "Open .docx Project" import
- Round-trip reading of prose content controls on import
- User-designed template support (base64-embedded template replacing generated structure)
- Cover page, Log of Revisions table, Table of Contents

---

## 16. Revision 16 — Word Round-Trip (Phase 2)

### 16.1 Overview

Make the `.docx` file the primary project save format by embedding the full Watts Up JSON
state as a Word Custom XML Part inside the ZIP. The existing **Open** button now also accepts
`.docx` files. On import, prose sections edited directly in Word (Introduction, General Notes,
Compliance) override the JSON-embedded values, so Word edits survive the round-trip.
References are not read back from Word; they are regenerated from JSON state.

### 16.2 Custom XML Part (JSON state)

Three new parts are added to the `.docx` ZIP at the **package root** (not inside `word/`):

```
customXml/item1.xml           — JSON state wrapped in a CDATA root element
customXml/itemProps1.xml      — declares the part's URI/namespace
customXml/_rels/item1.xml.rels — relationship from item1.xml to itemProps1.xml
word/_rels/document.xml.rels  — rId3 relationship to ../customXml/item1.xml
[Content_Types].xml           — overrides for item1.xml and itemProps1.xml
```

Format of `item1.xml` (as-built — XML entity encoding, not CDATA; CDATA was found to
truncate JSON containing `]]>` sequences and was replaced in the Revision 16 bugfix):
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<wuData xmlns="urn:watts-up:v1">
  <json>{ ... full JSON state, &amp;/&lt;/&gt; entity-escaped ... }</json>
</wuData>
```

### 16.3 Export flow (updated)

1. Build document XML (same as Revision 15)
2. Serialize current `state` to JSON, escaping `&`, `<`, `>` as XML entities
3. Write JSON into `customXml/item1.xml` (package root, not `word/customXml/`)
4. Assemble ZIP and download

### 16.4 Import flow ("Open .docx Project")

1. User selects a `.docx` file via file picker
2. JSZip opens the ZIP
3. Read `customXml/item1.xml` → extract text between `<json>...</json>` → decode XML
   entities → parse JSON → restore `state`
4. Read each prose content control by tag from `word/document.xml`:
   - `wu-intro` → `state.meta.introText`
   - `wu-general-notes` → `state.meta.generalNotes[]` (split on paragraph boundaries)
   - `wu-references` → ignored (references are authoritative in JSON state)
   - `wu-compliance` → `state.meta.complianceText`
5. Call `recalc()` and `renderAll()`

Step 4 means prose edits made in Word override the JSON-embedded values on import.
References are not read back from Word (the numbered list is regenerated from JSON state).

### 16.5 UI changes

- Existing **"Open"** button and hidden file picker updated to accept both `.json` and `.docx`
- File type detected by extension on change: `.docx` → Word import path; `.json` → existing path
- No new toolbar button required

### 16.6 Constraints and edge cases

- If `customXml/item1.xml` is missing (file was created externally or is a plain Word doc),
  import fails gracefully with a clear error message
- JSON schema version mismatch handled by `migrateLegacy()` (same as JSON import)
- Prose content-control extraction uses a lightweight XML text scan (not a full DOM parser);
  handles single-paragraph and multi-paragraph controls; ignores nested SDTs

---

## 17. Revision 17 — Template-Based Word Export

*Last updated: 2026-06-22*

### 17.1 Overview

Replace the generated-from-scratch document XML (Revisions 15–16) with a user-designed
Word template. `generateDocx()` no longer builds OOXML structure, styles, headers, footers,
TOC, or page numbering programmatically — it loads a template `.docx` (embedded in
`watts-up.html` as a base64 constant, `DOCX_TEMPLATE_B64`) and fills tagged content
controls with data from `state`. The template, not Watts Up code, controls layout,
typography, headers/footers, table of contents, and page numbering.

The template file is `Watts Up ELA Template.docx`, designed by the user in Word and
committed to the project root. It is expected to be revised iteratively; each new
template version must be re-embedded as the base64 constant.

### 17.2 Template structure

Three document sections, each its own page setup:

| Section | Orientation | Page size | Contents |
|---|---|---|---|
| Cover page | Portrait | Letter | Title block, identity fields, vertically centered |
| Body | Portrait | Letter | Header (`header2.xml`), intro/notes/references/compliance prose, log of revisions |
| Appendix | Landscape | Ledger/Tabloid (24480 × 15840 DXA) | Load tables, 22032 DXA usable width |

Footers use Word native field codes (`{ PAGE }`, `{ PAGEREF end }`) and are never modified
by Watts Up — page numbering is managed entirely in Word.

### 17.3 Content control tags

| Tag | Fill method | Source | Notes |
|---|---|---|---|
| `wu-docnumber` | inline | `meta.documentNumber` | Appears multiple times (cover + log of revisions) |
| `wu-revision` | inline | `meta.revisionNumber` / `revisionLevel` | Appears multiple times |
| `wu-make` | inline | `meta.make` | |
| `wu-model` | inline | `meta.model` | |
| `wu-designation` | inline | `meta.marketingDesignation` / `designation` | |
| `wu-serial` | inline | `meta.serialNumber` | |
| `wu-flightphase` | inline | `meta.flightPhase` | Nested SDT (inner SDT inside an untagged outer SDT) |
| `wu-preparedby` | inline | `meta.preparedBy` | |
| `wu-revdate` | block | `meta.revisionDate` | Multi-run paragraph (Word spellcheck splits text); filled via explicit replacement paragraph, not inline text substitution |
| `wu-intro` | block | `meta.introText` | One paragraph per newline |
| `wu-general-notes` | block | `meta.generalNotes[]` | Bulleted |
| `wu-references` | block | `meta.references[]` | Numbered, italic titles — added by user, not in original Revision 15/16 tag list |
| `wu-compliance` | block | `meta.complianceText` | One paragraph per newline |
| `wu-tables` | block | node tree | Ledger-width OOXML tables |

`wu-approvedby` and `wu-reportdate` are defined in the tag vocabulary but unused in the
current template.

`header2.xml` (body section header) independently carries `wu-docnumber`, `wu-revision`,
`wu-make`, `wu-model`, `wu-serial` and is filled separately from `word/document.xml`.

### 17.4 Fill mechanics

- `fillSdtText(xml, tag, value)` — locates `<w:tag w:val="...">`, walks back to the
  enclosing `<w:sdt>`, and replaces the first `<w:t>` run inside `<w:sdtContent>`.
  **Loops over every occurrence of the tag in the XML** (fixed in 17.1 — see below),
  so a tag repeated on the cover page and in the log of revisions is filled consistently.
- `fillSdtBlock(xml, tag, contentXml)` — same lookup, but replaces the entire
  `<w:sdtContent>...</w:sdtContent>` with caller-supplied XML. Also loops over every
  occurrence.
- `updateDocProp(xml, name, value)` — updates `docProps/custom.xml` custom document
  properties (`ReportNo`, `ReportRev`, `Make`, `Model`, `S/N`, `Flight Phase`) by name.

### 17.5 Export flow

1. Decode `DOCX_TEMPLATE_B64` into a JSZip instance
2. Fill identity fields and prose blocks in `word/document.xml`
3. Fill identity fields in `word/header2.xml`
4. Write `customXml/item1.xml` with full JSON state (same format as Revision 16)
5. Update `docProps/custom.xml` custom properties
6. Assemble ZIP and download as `WattsUp_{make}_{model}_{serial}_{YYYY-MM-DD}.docx`

### 17.6 Revision 17.1 — fill-all-occurrences fix

**Bug:** `fillSdtText` and `fillSdtBlock` used `indexOf`, which finds only the first
match. Tags appearing more than once in the same XML part (e.g. `wu-docnumber` on both
the cover page and the log of revisions) were only filled at their first occurrence;
later occurrences were left as template placeholder text.

**Fix:** both functions now loop, advancing a `searchFrom` cursor past each replaced
`<w:sdtContent>` block, until no further instances of the tag's `<w:tag w:val="...">`
marker remain in the XML string.

### 17.7 Superseded from Revisions 15–16

- Programmatic OOXML assembly (`buildDocumentXml` and related per-section builders) is
  replaced by template loading; helper functions retained are `buildBodyTextParas`,
  `buildGeneralNotesParas`, `buildRefsParas`, `buildTablesContent`, now used to produce
  *content* for `fillSdtBlock` rather than full document XML
- Letter landscape (13680 DXA usable) superseded by Ledger landscape (22032 DXA usable)
  for the Appendix, per the user's template design
- Generated cover page / log of revisions / TOC (deferred items from §15.9) are now
  provided by the template itself, not generated by Watts Up

### 17.8 Open items

- Template is expected to undergo further iteration; each revision requires
  re-embedding `DOCX_TEMPLATE_B64`
- Content-control locking (see §18) not yet implemented — currently nothing prevents a
  user from manually editing or deleting Watts-Up-managed content controls in Word

---

## 18. Revision 18 — Template Rev 1, Heading8 Table Titles, Word Export Settings

*Last updated: 2026-06-29*

### 18.1 Template Rev 1

The embedded template was replaced with `Watts Up ELA Template Rev 1.docx`
(`DOCX_TEMPLATE_B64`). Two changes from the original Revision 17 template:

- **Appendix orientation/size:** changed from Ledger/Tabloid landscape (24480×15840 DXA,
  22032 DXA usable) back to **Letter landscape** (15840×12240 DXA, margins L=1440 R=1008,
  **13392 DXA usable**). `buildTablesContent()`'s `TOTAL_W` constant updated accordingly.
- **New paragraph style `Heading8`** added to the template for use as the load-table
  title style (see §18.2).

All content control tags are unchanged from Revision 17 (§17.3) — confirmed identical
between the two template files.

### 18.2 Table title style

Load table titles generated by `buildTablesContent()` — e.g. "115 VAC Summary",
"28 VDC Summary" — now use the template's `Heading8` paragraph style instead of
`Heading2`. Only the table-title paragraphs changed; the "Notes" sub-heading inside
the tables block still uses `Heading2`.

### 18.3 Word Export Settings (column selection)

The Print/Export Settings dialog (`#print-opts`) is now mode-aware and shared between
the on-screen Print Report and the Word export, with **independent column-selection
state** for each:

- `printCfg` — column selection for `window.print()` / `buildPrintR10()` (unchanged
  from prior revisions)
- `wordCfg` — column selection for `buildTablesContent()` / the Appendix load tables
  in `generateDocx()`

`openPrintOpts(mode)` takes `'print'` or `'word'`, sets module-level `printOptsMode`,
retitles the dialog (`#print-opts-title`) and the action button (`#print-opts-go`)
accordingly ("Print / Export Settings" / "Print" vs. "Word Export Settings" /
"Export Word"), and populates checkboxes from the matching config object.
`applyPrintOpts()` and the "Reset to Defaults" button likewise operate on whichever
config matches the current mode.

Clicking **"Word Report"** now opens this dialog (mode `'word'`) instead of calling
`generateDocx()` directly; `generateDocx()` runs only after the user clicks
"Export Word" in the dialog.

**Rounding** is not separately configurable per export target — `fmtRpt()` /
`fmtPfRpt()` are shared by `buildRptRow` (print), `buildWordSectionRows`, and
`buildWordRptTable` (Word). A user-configurable rounding schedule remains a future
enhancement (§41).

---

## 19. Revision 19 — Word Export Fixes (pf rounding, header wrap, Notes column)

*Last updated: 2026-06-30*

Four defects reported after Revision 18 testing, all fixed:

### 19.1 Power factor rounding

`buildWordDataRow()`'s numeric-cell loop previously called `fmtRpt(val, isPf)` —
`fmtRpt()` takes a single argument and silently ignored `isPf`, so pf values got
generic magnitude-based rounding instead of the fixed 2-decimal pf format. Fixed by
branching explicitly: `isPf ? fmtPfRpt(val) : fmtRpt(val)`, matching the print path's
`rptTxt()`. pf values now render as e.g. `0.87`, `0.93`.

### 19.2 Column header word-wrap

Replaced the single uniform `numW` (one width applied to every numeric column) with a
**per-column `colWidths` array**, threaded through `buildWordTblHeader`,
`buildWordDataRow`, `buildWordSectionRows`, and `buildWordRptTable` in place of `numW`.

`computeColWidths(groups, cols, avail, pt)`:
1. Computes an even-share baseline width: `Math.floor(avail / cols.length)`.
2. For each column group present in `cols`, estimates the DXA width needed for the
   group label's **longest single unbreakable word** (split on whitespace only — e.g.
   "Rating / Capacity" → "Capacity", "Added (Removed)" → "(Removed)", "Remaining" →
   "Remaining" itself) at the header font size (7.5pt bold), divided across however many
   sub-columns that group has selected.
3. Each column's width is `Math.max(baseline, thatGroup'sMinPerCol)`.

Only groups whose selected-column count is too small to absorb their longest word get
widened; other columns stay at the even-share baseline. This avoids the bloat of
widening *every* column to satisfy the narrowest one (an earlier draft of this fix did
that and pushed total table width well past the page's usable width — rejected).
Multi-word labels may still wrap between words/hyphens (acceptable per spec); only a
hard mid-word break is treated as a defect.

The word-width heuristic (`Math.ceil(longestWordChars * pt * 9.5) + 160`) is an
approximation (~9.5 DXA per character per point for bold text, plus ~160 DXA for cell
padding) — not exact font metrics. Verified against a default-config AC table: total
width came to 13520 DXA (target usable width 13392), with only the `cap` (Rating /
Capacity, 1 selected column) and `rem` (Remaining, 1 selected column) groups widened
above the 699 DXA baseline, to 730 and 802 DXA respectively.

### 19.3 Notes column left divider

`buildWordTblHeader()`'s Notes header cells (row 1 and row 2) and
`buildWordDataRow()`'s Notes data cell now pass `leftBdr:true` to `wxTc()`, matching the
left border (`<w:left w:val="single" w:sz="12" w:color="777777"/>`) already used between
numeric column groups.

### 19.4 "Notes" sub-heading style

`buildTablesContent()`'s annotation-list heading (distinct from the per-column Notes
header in §19.3 and from the `wu-general-notes` content control) no longer sets
`style:'Heading2'`. It now renders as a Normal paragraph with a bold, 11pt run
(`wxRun('Notes',{b:true,sz:11})`), with no `w:pStyle` element.

---

## 20. Revision 20 — Sibling Reordering, Status Grouping, and New Report Tabs

*Last updated: 2026-07-08*

### 20.1 Sibling ordering and status grouping

Each node now carries an explicit ordered list of its children, rather than relying on
whatever order the nodes happened to be saved in. Within a given parent, siblings are
grouped in a fixed macro order — **Existing, then Removed, then New** — while preserving
the user's own custom order within each status group.

Up/down reorder controls appear on each tree row, letting the user move an item earlier
or later among its same-status siblings. The controls are disabled at the top/bottom of
that status group (an item cannot be reordered past a sibling with a different status).

This ordering is the single source of truth for sibling sequence everywhere in the
app — the tree, the Load Analysis Summary table (§6), Print Report (§13), and Word
export (§15–19) all reflect the same order and the same Existing → Removed → New
grouping.

Legacy save files (predating this revision) have their sibling order backfilled on load
from whatever order the nodes were previously stored in, so existing projects open with
their visual order unchanged.

### 20.2 AC/DC visual differentiation in the tree

DC-flagged tree rows are visually distinguished from AC rows with a background tint and
a left accent bar. This is a styling-only change — the tree is **not** structurally split
by AC/DC, since a conversion item's DC output can sit several levels beneath an AC
ancestor (e.g. a TRU's DC side under an AC bus); splitting the tree would break that
parent/child nesting and the "+ Child" workflow.

### 20.3 Power Distribution Summary (new tab)

A new read-only report, filtered to **Total Aircraft Load, Generation, Conversion, and
Distribution** items only — Circuit Breakers, Fuses, and terminal Loads are excluded.

Columns: **Capacity, Net Change, New Load, Remaining** (Existing Load and Load are
dropped from this report, since those columns are specific to Load-status rows).
Otherwise organized the same way as the Load Analysis Summary table (§6): AC/DC split
into separate sections, same indentation and section ordering rules.

### 20.4 Load Analysis Detail (new tab)

A new read-only report: one small table per non-Load item that has children, showing
just that item plus its immediate children, in the same column format as the current
Print Report configuration (§13).

Each table is preceded by a breadcrumb line showing the distribution path from the top
of that item's AC/DC system down to its immediate parent — e.g. `RH Main > Galley AC >`
for an item two levels under an AC bus, or `RH Main TRU > RH ACC #1 >` for an item past
a TRU conversion boundary onto a DC bus. The breadcrumb is omitted for root items and for
the entry point of each AC/DC system (an item whose immediate parent is on the other side
of a conversion boundary), since there is no useful same-system path to show for those.

Tables are presented in the same order the items appear in the Load Analysis Summary
table, grouped AC then DC (or DC then AC, matching whichever comes first at the root).

---

## 21. Revision 21 — Inline-Editable Existing/Removed and New Grids

*Last updated: 2026-07-09*

### 21.1 Overview

Two new tabs provide spreadsheet-style inline editing as an alternative to the Edit Item
(§7) and Add Item(s) (§8) dialogs for routine data entry — adding, editing, reordering,
duplicating, and deleting items without opening a modal for every change.

### 21.2 Existing/Removed tab

One row per item with status Existing or Removed, in the same hierarchical order as the
tree (§20.1).

**Editable columns:** Item Type, Description, Ref Des, Status, Efficiency, Power Factor,
then Capacity / Existing Load / Load column groups (same units per AC/DC as §6.1/§6.2).

Item Type changes are restricted to **same-shape swaps** — e.g. Bus ↔ Feeder, Generator
↔ Alternator ↔ Battery, Circuit Breaker ↔ Fuse. Type changes that would require
restructuring an item's capacity/load fields (switching into or out of a Load type or a
conversion role) are not offered in the grid.

Cells that don't apply to a given row (e.g. VA/VAR/pf for a DC item, or the Load columns
for a non-Load item) are shown disabled/dashed rather than hidden, so the column layout
stays consistent across rows.

**Row actions:** reorder (same up/down mechanism as the tree), **Duplicate**, **Delete**,
**+ Child** (opens the Add Item(s) dialog), and **Edit** (opens the full Edit Item
dialog, for Net Change Override and Notes/References — the two things this grid doesn't
expose inline). Duplicate and Delete prompt for confirmation when the item has children,
since both actions then apply to the entire branch — Duplicate deep-copies the item and
every descendant (with fresh internal identities); declining the prompt cancels the
action rather than falling back to a shallow copy.

### 21.3 New tab

Shows both **Existing**-status items (read-only, for context — so the user can see where
in the tree to attach a new item) and **New**-status items (fully editable). Status
cannot be changed from this grid in either direction.

**Editable columns for New rows:** Item Type (same restriction as §21.2), Description,
Ref Des, Efficiency, Power Factor, then Capacity / Load / Net Change column groups. Net
Change is a read-only computed display here (matching how it's shown in the Load
Analysis Summary table, §6), not a directly editable field.

### 21.4 Editing model

Edits commit immediately — changing a cell recalculates and re-renders right away, using
the same underlying calculation logic as the dialogs (no separate "apply"/"calculate"
step). A **Cancel** button reverts every change made since the tab was last opened (a
snapshot is taken each time the tab is entered); a **Save** button re-baselines that
snapshot.

### 21.5 AC/DC visual differentiation

Same tint/accent-bar treatment as the tree (§20.2), applied per grid row.

---

## 22. Revision 22 — Tab Reorganization, Voltage/AC-DC Grid Columns, DC Tint Intensity

*Last updated: 2026-07-11*

### 22.1 Tab reorganization

- **Power Distribution Summary** and **Load Analysis Detail** (§20.3–20.4) moved from
  top-level tabs to sub-tabs of the right-hand pane, positioned after Load Analysis
  Summary — alongside the Power Distribution Tree, which stays visible while viewing
  either report.
- **Existing/Removed** and **New** (§21) moved from right-hand-pane sub-tabs to
  top-level tabs, positioned next to Document. Full width; the Power Distribution Tree
  is hidden while either is active, matching the Document tab's existing layout.

### 22.2 Voltage and AC/DC columns in the Existing/Removed and New grids

Added immediately after the Status column, matching the Load Analysis Summary table's
column order (§6). Editability follows the same locking rules as the Edit Item and Add
Item(s) dialogs (§7.2/§8.4) exactly:

| Scenario | Volts | AC/DC |
|---|---|---|
| Parent exists; regular (non-conv) node | Locked to parent value | Locked to parent value |
| Conv IN node; parent exists | Locked to parent value | Locked to device type |
| Conv IN node; no parent | Editable | Locked to device type |
| Conv OUT node | Editable | Locked to device type |
| No parent (root); regular node | Editable | Editable |

In the New tab, Existing-status context rows force both columns read-only regardless of
the table above, consistent with every other column on those rows (§21.3).

### 22.3 DC row highlight intensity

Background tint opacity and accent-bar width increased in the Existing/Removed and New
grids specifically, to improve AC/DC differentiation. The tree's DC-row styling (§20.2)
is unchanged.

---

## 23. Revision 23 — Grid Editing Fix, Layout Polish, "+ Child" Rework, Report Polish

*Last updated: 2026-07-12*

### 23.1 Grid editing bug fix

The Existing/Removed and New grids (§21) had a real defect, not just a rough edge:
editing a cell in a multi-key value group (Capacity, Existing Load, Load) could silently
revert to its previous value. Cause: the underlying derivation helpers recompute a whole
group from a **fixed priority order** among its sub-fields (roughly W/VAR > VA+W > VA+PF
> W > VA > A last for AC; A before W for DC) — once a higher-priority field had any
value, editing a lower-priority one (commonly A) got discarded on the next recompute.

Fixed by making whichever key the user just edited authoritative: a legitimate two-field
pair (e.g. W+VAR entered together) is still honored if the edited key's pair partner also
has a value; otherwise the edited key alone drives the derivation. A **Reset** button was
also added per column-group per row, clearing that group back to blank — the simpler
alternative to auto-clear-on-edit that the original request had flagged as needing
careful one-time-per-session logic to avoid continually wiping re-entered values.

### 23.2 Grid layout and interaction changes (Existing/Removed and New)

- Description/Ref Des/Status columns widened (superseded by §26 — the widths chosen here
  still weren't sufficient; see below).
- Capacity's combined column split into two always-present columns, "VA (AC)" and
  "W (DC)", each inhibited (disabled, dashed) for the wrong AC/DC type — matching how the
  5-key groups already inhibit inapplicable sub-columns.
- Item and Status columns made sticky/frozen with horizontal scroll for the rest
  (**superseded by §26** — frozen columns were removed entirely after causing two rounds
  of layout bugs; see §26).
- Existing/Removed: status shown as a click-to-toggle badge (existing ↔ removed),
  matching Load Analysis Summary's badge style, replacing the dropdown. New: matching
  badge styling, display-only (status isn't editable there).
- New grid's existing-status context rows now genuinely hide (not just disable)
  Efficiency/PF/Capacity/Load/Net Change values, and lose the Edit button — both had
  previously only been disabled while still showing/offering their values.

### 23.3 "+ Child" behavior

Clicking **+ Child** in either grid now inserts a blank, immediately-editable child row
directly (status defaults to Existing for the Existing/Removed grid, New for the New
grid) instead of opening the Add Item(s) dialog. New child defaults to type **Load**.
**+ Child** is hidden entirely for Conversion-IN nodes, in both grids and the LH tree —
adding a child there is invalid since a conversion item's only valid child is its own
paired OUT node, which is created automatically as part of the conversion pair itself.

### 23.4 Power Distribution Summary and Load Analysis Detail polish

- Section headings include voltage ("115 VAC Summary"/"28 VDC Summary" for Power
  Distribution Summary; "115 VAC Detail"/"28 VDC Detail" for Load Analysis Detail).
- Conversion-IN items excluded from both reports as report *subjects* (Power Distribution
  Summary rows and Load Analysis Detail's own per-item tables) — the OUT side still shows,
  and an IN node still correctly appears as a child row within its actual parent's table
  in Load Analysis Detail.
- Load Analysis Detail: column widths made consistent across every table within a section
  (shared colgroup, computed once per AC/DC section); Removed/Added pseudo-label rows now
  appear per table (mirroring Print Report's convention), including the case where the
  table's own subject item is itself New (an "Added" label is inserted above that first
  row); the breadcrumb path moved from a line above the table into the table's own empty
  header cell; notes/references renumbered locally in this report's own top-to-bottom
  order and shown directly below each table, rather than collected globally at the end.
- **Zero vs. "not applicable" fixed at the shared formatter level** (`fmtRpt`/`fmtPfRpt`):
  previously any near-zero real value was collapsed to null and rendered as an em-dash,
  indistinguishable from a genuinely inapplicable cell. A real zero now renders as "0"/
  "0.00"; a true N/A cell (value never existed) still renders as "—". This fix is shared
  with Print Report and Word export, not just Load Analysis Detail.

---

## 24. Revision 24 — Grid Item Type & Column Overhaul, Live Refresh, Report Column Settings

*Last updated: 2026-07-12*

### 24.1 Item Type dropdown

Expanded from a "same-shape swaps only" restriction to the full Generation/Distribution/
Protection/Load type menu for any node that isn't Root and doesn't have a conversion role.
Conversion-role rows (TRU/Inverter/etc., IN or OUT) keep a fixed, single-option dropdown —
a conversion item is a paired IN/OUT structure, not a single-node type change, so free
switching isn't offered for those rows. Switching a node's type initializes whatever
fields the new type requires (capacity/existing load for capacity-bearing types, load
value for Load) if missing, without touching whatever the old type left behind.

### 24.2 Grid numeric-value display and editing

- Numeric cells display **rounded** values at rest, matching Load Analysis Summary's
  rounding tiers, while the full-precision value is retained in the underlying data and
  swapped in automatically while the cell is focused, so editing is always exact. The
  rounded display returns on blur if the value wasn't changed.
- Every numeric column within the Capacity/Existing Load/Load/Net Change groups given a
  uniform width, sized for the widest plausible value, instead of relying on the
  browser's default column-sizing (which let whichever column had the widest content that
  render pass squeeze its neighbors). Horizontal scrolling picks up the rest.
- Reset buttons (§23.1) now clear the affected group fully to blank, not to zero — the
  Existing Load reset had been zeroing the group instead of blanking it, inconsistent
  with the Load reset, which already blanked correctly.
- Cells that aren't available for editing (wrong AC/DC type, wrong item type, read-only
  context row) get a subtle fill so they read as visually distinct, not just faded.

### 24.3 Live refresh on every grid edit

Every grid edit (not just Save) now refreshes the Power Distribution Tree and every
report tab immediately — previously, ordinary cell edits only re-rendered the active
grid itself, leaving the tree and other reports stale until some unrelated action
happened to trigger a fuller refresh. Since grid edits already apply live, that staleness
was misleading regardless of which specific action triggered the refresh.

### 24.4 Power Distribution Summary — Print/Export column settings

Power Distribution Summary's columns (Capacity, Net Change, New Load, Remaining) are now
driven by the same Print/Export column-selection settings (§13.1) used elsewhere, instead
of a fixed, hardcoded column set — toggling a column checkbox in that dialog changes what
Power Distribution Summary shows, the same as it already did for Print Report.

### 24.5 Load Analysis Detail — two small fixes

- Group header labels (e.g. "Rating / Capacity") now wrap instead of clipping.
- The redundant "Added" pseudo-label is no longer repeated for an all-new item's already-
  new children — if the table's own subject row is itself New (and already labeled), its
  New-status children don't get a second, repeated label. Print Report and Word Report
  already handled this correctly via their own recursive tracking; Load Analysis Detail's
  simpler per-table logic just needed to match.

---

## 25. Revision 24 Follow-Up — Grid Column Layout Corrections

*Last updated: 2026-07-12*

Two rounds of user feedback after Revision 24 traced the Existing/Removed and New grids'
column-width problems to real bugs in the layout mechanics themselves — not to the tab
placement, the VA/W column split, or the frozen-column concept as such. Both fixes were
verified by measuring actual rendered pixel widths in-browser, not by re-reading the CSS.

### 25.1 First fix: two CSS bugs in the column-width mechanism

1. **Sticky-column selectors matched the wrong cells.** The frozen Item/Status columns
   were styled via `:nth-child(1)`/`:nth-child(2)`. The grid header is two physical
   table rows (group labels, then A/VA/W sub-labels) — `nth-child` is relative to each
   row's own children, so in the second row it matched the first two Capacity
   sub-header cells instead of Item/Status, forcing the frozen-column width and position
   onto them and corrupting that row's widths. Fixed with explicit CSS classes instead of
   positional selectors.
2. **The table wasn't sized to its own columns.** `table-layout:fixed` combined with
   `width:auto`/`min-width:100%` let the browser shrink the whole table to fit the visible
   pane and compress every column proportionally, instead of holding each to its declared
   width — `table-layout:fixed` only holds columns to their declared widths if the table's
   own width is at least the sum of them. Fixed by giving the table an explicit width
   equal to the exact sum of its declared column widths.

### 25.2 Second fix: Item Type / Description / Ref Des still not viewable

After 25.1, the numeric columns (Capacity, Existing Load, Net Change, Load) were
correctly and evenly sized, but Item Type, Description, and Ref Des still weren't usable.
Root cause: the frozen Item column crammed a badge, the Item Type dropdown, the
description, and the ref des into a single ~300px flex row — measured directly, the Item
Type dropdown was rendering at under 12px wide, with description and ref des stuck at
their bare minimum widths. 300px was never enough for all four.

Per the user's own stated fallback (prefer unrestricted horizontal scrolling over
obscuring these columns), **sticky/frozen columns were removed entirely** — the second
layout bug the mechanism had caused in as many rounds — rather than patched further.
Item Type, Description, and Ref Des are now three separate columns (240px/260px/100px)
instead of one cramped cell; the whole table scrolls horizontally together, including
what used to be the frozen columns. The DC-row blue tint and left accent bar now span all
the identity columns (Item Type through AC/DC) using explicit CSS classes rather than
column-position selectors, avoiding the same class of bug going forward.

---

## 26. Revision 24 Follow-Up (Round 2) — Grid Column Balance, Contrast, Density, Tab Navigation

*Last updated: 2026-07-14*

Four more usability items on the Existing/Removed and New grids, raised after §25's fixes
had settled. Verified live via `getBoundingClientRect()`/`scrollWidth` measurements on a
seeded 6-level-deep tree across both grid tabs, per the user's concern about repeated
regressions in this area — including the Tab-key fix's edit-then-rerender race condition.

### 26.1 Item Type vs. Description column balance

At depth 5-6 in the tree, the Item Type column's fixed width combined with per-level
indentation left too little room for longer type names (e.g. "Circuit Breaker" clipped in
its dropdown), while Description had far more width than any real description text needs.
Item Type widened (240→270px) and Description narrowed (260→170px); per-level indent
reduced (14→10px). Confirmed at depth 6: type dropdown now renders at 126px vs. a 125px
`scrollWidth` need, no clipping.

### 26.2 Disabled-cell fill contrast

The gray fill marking inapplicable/disabled cells (§24.2) was too subtle to read as
distinct from editable cells at a glance. Background raised from
`rgba(255,255,255,.06)` to `rgba(255,255,255,.16)`.

### 26.3 Grid density scaled for 100% zoom

Both grids had been designed at pixel/font values that read best at ~90% browser zoom.
Rather than only fix that at one zoom level again, grid font-sizes, cell padding, and all
column widths were scaled down by ~0.9 together in one pass, so 100% zoom now gives the
same density the user had been achieving manually at 90%. The column-width /
`table-layout:fixed` mechanism from §25.1 is unchanged — only the declared values were
scaled, not the mechanism.

### 26.4 Tab key advances to the next editable cell

Tab (Shift+Tab reverses) now moves focus to the next editable cell within the same row,
skipping disabled cells and the status-toggle button, rather than falling through to the
browser's default tab order. The tricky part: a value-changing edit's `change` handler
(`gridFieldChanged`) runs `recalc()`/`persist()`/`renderAll()` on blur, which rebuilds the
row's DOM and refocuses the *same* field — a race that would otherwise undo any Tab
navigation attempted through it. The new `keydown` handler captures the row's `data-nid`
and the field's position index before blurring, then resolves the actual next element
after a `setTimeout(0)`, so it runs after any synchronous rerender instead of before it.

---

## 27. Revision 27 — AC Sign Fix, Edit Modal Sections, Tab Reorg, Document Tab Restructure, Grid Polish, Calc-on-Demand, Net Change Override Entry

*Last updated: 2026-07-18*

Largest single wish-list round to date (14 top-level items across calculation logic, the Edit
Item dialog, the Analysis tab, the Document tab, and both data-entry grids), implemented and
verified in-browser across 7 phases, each confirmed before moving to the next.

### 27.1 AC sign-preservation fix

`deriveAcFromWVar(w,var_,v)` — the function nearly every AC derivation path funnels through —
computed `VA = √(W²+VAR²)`, always non-negative, discarding W's sign. A removed AC child
correctly produced a negative W in Net Change rollups, but VA and A (derived from it) came out
positive — a real sign-consistency bug, not just a display quirk. Fixed by making VA's sign
follow W's sign; `pf = W/VA` still resolves correctly since a matching sign pair divides to the
same positive ratio as before. The Edit Item modal's "Calculate" button (`doEditCalculate`'s
`calcAcGroup`, the `VAR → W` direction) had the same defect and received the same fix. Verified
against the exact reported scenario: an AC bus with a removed 200 W / 40 VAR load produces Net
Change W=-200, VA=-204, A=-1.77 at both the load and its parent, visible correctly in the tree
badge and Load Analysis Summary — not just in raw state.

### 27.2 Edit Item dialog: status-conditional sections

`efShowSections()` now also hides "Net Change Override" when Status = Removed, and "Existing
Load" (newly wrapped in its own `#ef-sec-exload` container) when Status = New — in addition to
the pre-existing hide conditions (has children, conversion pair), which remain unaffected.

### 27.3 Analysis tab position and LH pane column alignment

Analysis moved to the last tab position (after New) — a pure markup reorder; no CSS in the tab
bar depends on button order.

The "align status badges" / "align load change value" requests turned out not to be a
per-row vertical-centering problem (flexbox already centered everything correctly) but a
column-alignment-down-the-page problem: `.node-desc`'s `flex:1` absorbs whatever space isn't
used by the row's other elements, so any row that omitted an element — Load rows never showed
a net-change badge; Load/Removed/conversion-IN rows hid "+ Child"; the three status labels
("existing"/"new"/"removed") have different natural widths — let its description grow into
the freed space, shifting the status badge and net-change value to a different X position
depending on that row's particular combination. Fixed with three coordinated, tree-scoped
changes: the net-change value and "+ Child" button are now always rendered (`visibility:hidden`
reserving their layout space when not applicable, the same technique already used for leaf
nodes' toggle button) instead of omitted, and the status badge got a fixed width with centered
text instead of sizing to its own text length. Verified across 9 rows spanning 5 depth levels,
all three statuses, and a Load-type row: badge and net-change value land at the exact same X
position on every row.

### 27.4 Document tab restructuring

"Aircraft & Document Identity" split into **Document Properties** (Doc #, Rev, Prepared by, Rev
Date, new Revision Description) and **Aircraft Information** (Make, Model, Designation, Serial
#, Flight Phase, new Interval) — both inside one `<form>` so the existing name-keyed sync/
persistence wiring needed no changes. "Approved by" removed (it was never wired into the Word
export template anyway).

Rev Date is now a native date picker, stored internally as ISO (`YYYY-MM-DD`) and formatted to
**MMM-DD-YYYY** everywhere it is displayed or exported via a new shared `fmtRevDate()` helper —
the picker's own on-screen display follows the browser's locale, but the Word export's
`wu-revdate` content control always renders the requested format (verified by JSZip-decoding a
generated `.docx`). `migrateLegacy()` converts any pre-existing free-text date (e.g.
"Jun-20-2026") to ISO so older saves still populate the picker instead of appearing blank.

New meta fields: `revisionDescription` (multiline, default "Initial Release.") and `interval`
(default "Continuous") — document-tracking fields only; distinct from the full per-item
multi-interval load analysis still listed under Future Enhancements (§41).

General Notes are now numbered ("1.", "2.", …) and multiline (textarea instead of a single-line
input); editing, reordering, and persistence all continue to work unchanged.

### 27.5 Grid shared polish (Existing/Removed and New)

- Root row's Type cell now shows "Total Aircraft Load" (matching the Edit modal and reports)
  instead of the literal internal type string "Root".
- Del/Dup hidden on conversion-**output** rows — structurally paired with their IN parent, so
  duplicating/deleting independently doesn't make sense (both already happen via the IN row).
- Duplicate's confirmation is now a real 3-way choice (Item Only / Entire Branch / Cancel) via
  a new small reusable `showChoiceDialog()` overlay, replacing the old two-outcome
  `confirm()` (which could only offer "duplicate the whole branch" or abort entirely).
- `duplicateBranch()` now appends " (copy)" to every descendant, not just the top node.
- The DC row's left accent bar moved from the `<td>` onto the inner (already depth-indented)
  flex div and gained `border-radius`, so it starts at the badge's position and reads as
  rounded — matching the LH tree pane's treatment — instead of starting at the cell's outer
  edge with square corners. (The bar renders slightly shorter than the full row height, a minor
  cosmetic side effect of table cells not reliably honoring percentage heights; judged not
  worth a riskier fixed-row-height change to close entirely.)
- Footer message gained a second line: "Use Analysis tab to add TRUs." — an interim stopgap,
  not a new TRU-creation capability in the grids themselves.

### 27.6 Grid AC groups: Calc-on-demand instead of calc-on-every-edit

AC Existing Load / Load Value groups (both grids) no longer auto-derive the other 4 fields the
instant one cell is edited — `gridCommitPowerGroup` now stores just the edited key for AC rows,
leaving the rest of the group untouched, so entering several fields in sequence (A, then VA,
then pf) no longer has an earlier entry silently overwritten by the derivation that used to
fire on every blur. DC groups are unaffected (simple A↔W conversion, never reported as fighting
entry).

A new per-row **Calc** button (before Dup, shown on any AC row with an applicable group) fills
in whatever can be derived from what's present — reusing the exact same cascading fill logic as
the Edit modal's own "Calculate" button (`calcAcPowerGroup`, mirroring `calcAcGroup`) — without
ever overwriting a value already entered. The grid tab's **Save** button now also runs this
derivation across every AC row before re-baselining the Cancel snapshot, so a later Cancel
reverts to the calculated values, not the pre-save partial ones.

### 27.7 New grid: direct Net Change override entry

New-status, non-load, childless rows can now enter a Net Change override directly in the New
grid's Net Change column group — the same `netChangeOverride` field the Edit modal already
supported, just exposed for grid entry in this specific case. AC keys follow §27.6's pattern
(raw storage, Calc/Save-driven derivation); DC keys (A and W only) auto-derive as before. "+
Child" hides once an override becomes active (clearing it via the new reset button — which
resets to `null`, not a blank object, since `calcNC` treats any non-null override as active even
when every key inside it is blank — restores "+ Child"). Rows with children, or existing-status
context rows, are unaffected and keep the original read-only computed display.

---

## 28. Revision 27 Follow-Up — Calculate & Save Unification

*Last updated: 2026-07-19*

Follow-up request after Revision 27 landed: revise the AC field-derivation rules (§7.7) and,
critically, make the Edit Item dialog's **Save** button, its **Calculate** button, the **Add
Item(s)** modal's Save, and the grid's **Calc**/**Save** buttons all apply the identical rules —
previously Save (in both the Edit and Add modals) used a separate, simpler function (`autoAc()`)
that had drifted out of sync with Calculate's own cascading logic, even though §7.12 already
documented that "Calculate... applies automatically on save."

Tracing the requested table against the existing cascade found it was **already correct** for
six of the nine specified rows (all three single-field cases, and A+W / VA+W / A+VAR / VA+VAR)
— the real defect was that `autoAc()`, not the cascade, was missing an A+W case entirely (it
silently discarded A whenever W was also present). Two genuine gaps existed in the cascade
itself, both explicitly flagged in the request as "(change from current function)":
- **W+VAR** with neither A nor VA given: no path derived VA from these two at all.
- **W+pf** with neither A nor VA given: no path derived VA = W/pf.

Fixed by extending the shared `calcAcPowerGroup()` (introduced in Revision 27, §27.6) with an
explicit VA-establishment priority order — A directly; else W+VAR (Pythagorean); else W+pf
(division); else W alone (unity pf assumed) — and retiring `autoAc()` entirely in favor of this
one function, now called from all five entry points. See §7.7 for the full revised table.

Verified with 14 cases run directly against the function (all 9 specified rows, the 4 unlisted
combinations, and the fully-blank case) — every result matched hand-derived expectations exactly
— then confirmed live through each of the five real UI paths (Edit Calculate, Edit Save without
Calculate, Add Item(s) Save, grid Calc, grid Save), each producing identical, correct results for
the same inputs.

---

## 29. Revision 27 Follow-Up (Round 2) — Conversion Pair Cross-Derivation, Conv PF Fix, Capacity Warning Fix

*Last updated: 2026-07-19*

Three requests: extend the Edit Item dialog's Calculate/Save cross-derivation to conversion
(especially TRU) items' Capacity and Existing Load rows; fix a Conv. Power Factor field that
looked editable from the OUT node's dialog but silently discarded any change; and fix a warning
that failed to fire when capacity was blank rather than an explicit 0.

An initially-requested fourth item — adding editable "OUT Volts"/"OUT AC-DC" fields to the
Conversion Parameters section — was cancelled after live testing showed the OUT node's own
top-level Volts field is *already* editable when opening Edit directly on the OUT node (per
§7.2); the only gap was that this wasn't visually obvious, since the Conversion Parameters
section itself looks identical regardless of which side of the pair you opened Edit on.

**Conv. Power Factor fix**: the field lacked the `disabled` state and reset-on-view behavior
Efficiency already had when editing the OUT node — it looked editable, but `doEditSave`'s OUT
branch never read it into anything, so a change made there silently reverted on next open
without ever reaching the IN node's stored `convPf`. Now disabled identically to Efficiency; see
§7.9.

**Conversion pair row cross-derivation** (§7.7, §7.9, §7.12): traced the actual behavior first
rather than assuming — the Edit modal's Calculate button was a complete no-op for the
Conversion Parameters section's Capacity/Existing Load rows, and Save's `mkCap`/`mkLd`
processed each side fully independently, leaving a blank side blank (capacity) or defaulted to
zero (existing load) instead of deriving it. Implemented via new shared functions
(`calcConvPairRow` and its helpers `convSideRealPower`/`convSideFromRealPower`/
`convSideFillOwn`) used identically by both Calculate and Save: compute the entered side's real
power (W = V×A for DC; W = VA×convPf for AC), scale by efficiency in the appropriate direction,
then re-expand into the other side's own A/VA(W). Verified against §3.3's formulas with a TRU
(AC-in/DC-out) in both directions, then again with an Inverter (DC-in/AC-out, testing the
reversed AC/DC arrangement to confirm the logic isn't TRU-specific), and confirmed editing from
either the IN or OUT node's own dialog produces identical results. Existing Load still
zero-defaults (never `null`) when both sides are left entirely blank, unchanged from before.

**Capacity warning fix** (§11): `warnNode`'s overload check (W3) was gated behind
`if(node.capacity)`, so a node with no capacity entered at all never warned regardless of how
large the new load was — only an explicit capacity of `0` triggered it. A blank capacity is now
treated as zero for this comparison, matching the explicit-0 case. Verified 5 scenarios (blank
capacity + positive load now warns; blank capacity + zero load doesn't; explicit-0 and
real-capacity cases unchanged) with no regressions.

---

## 30. Revision 27 Follow-Up (Round 3) — Conversion Dialog Unification, Grid In-Field Prompt, Grid Scroll Fix

*Last updated: 2026-07-19*

Three requests: fully unify the conversion-pair Edit dialog regardless of which side it's
opened from (§7.2, §7.9); an in-field placeholder for the New grid's overridable Net Change
cells; and a grid scroll-position bug affecting nearly every in-row button.

**Conversion dialog unification** — see §7.2 and §7.9 for the resulting behavior. Implemented
by adding the Identity row (IN Volts/AC-DC read-only, OUT Volts editable, OUT AC/DC read-only)
to the Conversion Parameters section, hiding the dialog's ordinary top-level Volts/AC-DC row
for conversion items, making Efficiency/Conv. Power Factor always editable, and updating both
`doEditSave` and `doEditCalculate` to read IN Volts from the actual IN node (never user-edited)
and OUT Volts from the new field (rather than the old top-level field, now hidden), persisting
Efficiency/Conv. PF to the IN node's own stored fields regardless of which side's dialog was
used to save. Also fixed a related gap the change surfaced: Efficiency's range validation
(0.01–1.0) previously only ran when editing the IN node — since it's now editable from either
side, the validation now runs for both. Verified opening Edit on the IN and OUT nodes of a TRU
pair produces byte-for-byte identical field states, and confirmed persistence in every
direction (OUT Volts edited from either side; Efficiency/Conv PF edited from OUT correctly
reaching the IN node's stored fields, previously silently discarded; the validation blocking an
out-of-range Efficiency entered from OUT).

**New grid in-field prompt**: eligible Net Change cells (New status, non-load, childless, no
override yet entered — see §27.7) now show a subdued "auto" placeholder, matching the intent of
the Edit modal's "Leave blank to auto-calculate" and the Add Item(s) modal's "blank if children"
prompts. "auto-calc" was considered but doesn't fit the grid's actual cell width (~40px usable
after padding, measured directly rather than assumed).

**Grid scroll-position fix**: every grid render rebuilds its `.grid-scroll` container via
`innerHTML`, producing a brand-new element with no scroll history — confirmed directly (the
element reference changes and `scrollTop` resets to 0) as the cause of the reported
disorientation on nearly every in-row button (status toggle, up/down, Dup, Edit, Del, Calc).
The type-dropdown case read as less disruptive only by coincidence: changing it refocuses the
same field afterward (existing behavior, unrelated to scrolling), and the browser's native
focus-scrolls-into-view behavior happened to land roughly back where the user was. Fixed by
having both grid render functions capture and restore `.grid-scroll`'s scroll position by
default around the rebuild. "+ Child" is the sole exception, by design — it now explicitly
scrolls the newly-added row into view (centered) and focuses its Description field afterward,
overriding the default scroll-preservation since that's the one action that should move the
viewport. Verified scroll position holds across toggle/up/duplicate from a mid-list row, and
that "+ Child" correctly centers and focuses a new row added far down a 30-row list.

---

## 31. Revision 27 Follow-Up (Round 4) — Add Item(s) Dialog Restructuring

*Last updated: 2026-07-23*

Requested as "tonight's entertainment": reorganize the Add Item(s) dialog's "Items to Add"
table to match the Existing/Removed and New grids' own field sets, order, and calculation
behavior, rather than the dialog's own separately-evolved (and in places incomplete) column
set. See §8 for the resulting field layout and column rules.

**Volts promoted to a shared field** (§8.1, §8.4): since every row in the table shares the same
Parent, and Volts for a regular or conversion-IN node is either locked to that parent or free
only when there's no parent (§7.2), repeating it as a per-row column added nothing — one shared
read-only field (editable only for new root-level items) replaces it, positioned between Item
Type and AC/DC per the request.

**Column sets now mirror the grids exactly** (§8.3): previously the same fixed column set
showed regardless of Status, with Existing Load and the (mislabeled) "Load" net-change-override
columns always shown together — neither matches how the Existing/Removed and New grids actually
work, where a row shows one or the other, never both. Existing Load also had genuine gaps (no A
or pf field for AC), and Load-type's own value was missing its A field. All fixed by threading
`status` into `afCols()` and expanding every AC group to the grids' full A/VA/W/VAR/pf set.
Conversion items' Cap/Load fields, previously a single VA-or-W field per group, now split into
A + VA/W pairs (matching the Edit modal's conversion-pair section), reordered to group by side
first (IN Cap, IN Load, OUT Cap, OUT Load) rather than by group first — verified against a
worked TRU example matching exactly.

**Calc-on-demand extended to the Add dialog** (§8.3): the old per-row `oninput`/`blur` handlers
(auto-deriving VAR/pf on every keystroke, and conversion Cap/Load via simple efficiency
multiplication on every keystroke) are gone, replaced by the same `calcAcPowerGroup()`/
`calcConvPairRow()` functions the rest of the app already uses (§7.7, §7.9), driven by a new
per-row Calc button and an automatic pass on Save for any fields still blank. Every column group
(including Capacity, which doesn't need Calc since it has no VAR/pf) now has its own Reset
button, matching the grids' one-reset-per-group convention.

**Modal width** (§8.1): auto-computed from the current column count instead of the dialog's
normal fixed width, so a conversion item's fuller field set doesn't cramp — reverts to the
normal width when the dialog closes.

**Incidental fix caught along the way**: `doAddSave`'s conversion power-factor default
incorrectly gave Inverter the same 0.95 as TRU (`['TRU','Inverter'].includes(type)?0.95:1.0`);
§3.3 specifies Inverter should default to 1.0. Consolidated into one shared `convPfDefault()`
helper (also used by `makeNode()`) so the three call sites can't drift apart again.

Verified thoroughly given the scope: field order/set for every Type × AC/DC × Status
combination (including the exact TRU field order requested), the shared Volts field's lock
behavior with and without a parent, the Calc button's cross-derivation for both AC groups and
conversion pairs, Reset buttons, calc-on-save filling blanks left after a Calc + Reset cycle,
modal width scaling, header/row column-count parity (18=18 for the widest conversion case), and
Duplicate/Delete still working unchanged.

---

## 32. Revision 27 Follow-Up (Round 5) — Non-TRU Conversion Types Hidden from New-Item Creation

*Last updated: 2026-07-24*

Prompted by an unrelated warning-block hit while testing an Inverter in Round 4, which led to
reconsidering whether the other four conversion types (Inverter, Transformer, DC-DC Converter,
Frequency Converter) are worth actively supporting at all, given TRU is by far the most common
in practice. Decided to hide them from new-item creation rather than remove them, since an
inverter-type device (standby/emergency AC off a DC battery bus) is still a real aircraft
component that might matter for some fleets — see §3.3 for the resulting behavior.

Investigated the actual code shape before implementing: the conversion-pair machinery
(`calcConvPairRow`, the Edit modal's conversion-pair section, `doEditSave`/`doAddSave`'s
conversion branches, `convPfDefault()`) is entirely generic, driven by two small lookup tables
(`CONV_IN_ACDC`/`CONV_OUT_ACDC`) rather than per-type branches — there was never a distinct
"Inverter-specific" chunk of code to sequester. This made the right implementation obvious:
leave `NT.CONVERSION`, the lookup tables, and every calculation untouched (so any non-TRU
conversion node already present in loaded data keeps working exactly as before), and filter
only `fillTypeSelect()`'s dropdown-building via a new `SELECTABLE_CONVERSION_TYPES = ['TRU']`
list. `fillTypeSelect()` gained an optional `extraType` parameter so opening Edit on an existing
non-TRU conversion node still shows its own type as a selectable (and selected) option — only
the Add modal, and Edit's dropdown for *other* items, are filtered.

Verified: the Add modal's Conversion optgroup now shows only TRU; the Edit modal's dropdown
shows only TRU when editing a regular item; a simulated pre-existing Inverter node still shows
"Inverter" as its own selected option when Edit is opened on it directly; and that same node's
`isConv()`, `convRole`, `acDc`, `_newLoad` calculation, and the §11 capacity-warning check all
continue to work identically to before this change. Reverting (making a type selectable again)
is a one-line addition to `SELECTABLE_CONVERSION_TYPES`.

---

## 33. Revision 33 (Phase 1) — Existing Load and Child-Sum Warnings

*Last updated: 2026-07-27*

First phase of a larger request (an alternate, row-oriented Load Analysis Detail format, plus
group-scoped notes) — see §34 for Phase 2 (group-scoped notes) and §35 for Phase 3 (the Alternate
report itself). This phase adds two warnings to §11's table, referenced there as the "existing
load not entered" and "child sum
exceeds parent" rows.

The "existing load not entered" warning (2.1 in the source request) could not be implemented as
literally specified: `calcAcPowerGroup`/`autoDc`, the functions that populate `existingLoad` from
the Edit modal, deliberately collapse an all-blank entry to an explicit zero rather than leaving
it `null` — there is no stored "never entered" state to distinguish from a genuine zero. Resolved
by treating an existing-load reading of exactly zero as the blank signal, for non-load Existing
or Removed status items — the same convention already used for the blank-capacity/W3 check.
Confirmed with the user before implementing.

The child-sum warning (2.2) required `warnNode()` to gain access to the node map (it previously
only ever inspected the node passed to it), since it needs to walk immediate children via the
existing `children(id, nodes)` helper. Only one call site exists (`recalc()`), updated to pass
`state.nodes`. For an Existing-status item, sums each immediate Existing/Removed child's
contribution — `existingLoad` for non-load children, `loadValue` for Load children — and warns if
that sum exceeds the item's own `existingLoad`.

Both warnings surface through the existing generic warning plumbing (`allWarnings()`,
`renderWarnings()`, the Print Report/Word warnings list) with no changes needed there — they
were already message-list-agnostic to warning code.

Verified live: created an Existing-status Bus with no existing load entered → W4 fired; gave it
an explicit existing load → W4 cleared; added two Existing-status child breakers whose existing
loads summed to more than the bus's own existing load → W5 fired alongside the (separately
triggered, expected) W3 overload warning from the test setup's unset capacity.

---

## 34. Revision 33 (Phase 2) — Group-Scoped Notes and References

*Last updated: 2026-07-27*

Second phase of the Revision 33 request (see §33 for Phase 1, and §35 for Phase 3 — the Alternate
Load Analysis Detail report itself, which consumes this phase's group scoping for its own Notes
column).

**Data model:** `rowNotes` entries changed from bare strings to `{text, group}`; `rowRefs` entries
gained a `group` field alongside the existing `key`/`comment`. `group` is `null` (the item itself)
by default — existing saves migrate automatically (`migrateLegacy`), converting bare-string notes
to `{text, group:null}` and defaulting `group:null` on any ref missing it, satisfying the source
request's explicit backward-compatibility requirement.

**Legal groups** (`noteGroupsFor(node)`), mirroring the restrictions from the Revision 33 source
document exactly:
- Load-type items, and any Removed-status item — item-only (no group picker shown at all).
- New-status non-load items — item itself, or Capacity / New Load / Remaining.
- Existing-status non-load items — item itself, or Capacity / Existing Load / Net Change / New
  Load / Remaining.

These are the same six ids as the report column-groups (`AC_GROUPS`/`DC_GROUPS`: `cap`, `exload`,
`added`, `nc`, `newload`, `rem`) minus `added` (the Load-value group) — since Load items are
always restricted to item-only notes, there's never a case where `added` would be a legal note
group.

**Edit modal UI:** each note/reference row gained an "Applies to" `<select>` (omitted entirely
when the item has no legal groups beyond "Item"), defaulting to whatever the entry's stored
`group` is. A save-time clamp (`doEditSave`, just before `updateNode`) re-validates every note's
and reference's `group` against the *final* type/status being saved and resets any now-illegal
selection back to `null` — this covers the case where a user changes Status or Item Type in the
same edit session after the group pickers were rendered, without needing to wire a live refresh
into every Status/Type change handler (which would risk discarding in-progress, unsaved note
edits if implemented as a full re-render).

**Backward compatibility for the existing reports:** the old Load Analysis Detail report, the
Print Report, and Word export all continue to attach every note/reference to the item's own row
regardless of `group` — `annotateNode()` (both the copy local to `renderLoadAnalysisDetail` and
the shared `buildAnnotationMap()`) simply reads `.text` instead of the old bare string and ignores
`.group` entirely. Only the future Alternate report (Phase 3) will actually split notes out by
group.

Verified live: group picker renders with the correct 5 options for an Existing-status Bus, hides
entirely for a Load item and for a Removed-status item, shows the New-status subset (Capacity/New
Load/Remaining) for a New-status Bus; a note saved with `group:'nc'` persists correctly and still
surfaces under the item's own row via `buildAnnotationMap()`; a simulated legacy save (bare-string
notes, ref missing `group`) migrates correctly via `migrateLegacy()`.

## 35. Revision 33 (Phase 3) — Analysis Detail – Alternate Report

*Last updated: 2026-07-27*

Final phase of the Revision 33 request (§33 Phase 1: warnings; §34 Phase 2: group-scoped notes).
Adds a new RH sub-tab, "Analysis Detail – Alternate" (`rh-subtab-ladalt`/`ladalt-container`,
`renderLoadAnalysisDetailAlt()`), alongside the existing Load Analysis Detail tab rather than
replacing it — screen-only for now, not wired into Print Report or Word export, confirmed with
the user upfront.

**Shape:** one table per eligible parent (same eligibility as the existing report: non-Load,
not a Conversion-IN node, has children), transposing that report's column-groups into rows:
Parent Item → CAPACITY → EXISTING LOAD (existing-status parent only) → immediate children
(existing first, then an italic "Removed" divider + removed children, then a bold "Added"
divider + new children) → Net Change (existing-status parent only) → New Load → Remaining.
"Not applicable for new items" (source §1.2.1.2.3.1/.2.5.1) is implemented as: skip the Existing
Load and Net Change rows entirely when the parent's own status is `new` — a new-status parent's
Existing Load is always 0 by construction, which would make Net Change and New Load identical
and the Existing Load row a row of zeros, so skipping both is a simplification of "not
applicable" rather than a literal blank/N/A row.

**Columns:** description (no CB rating inline) → dedicated CB/fuse rating column, shown
unconditionally for Protection-type rows regardless of whether Amps is a selected value column
(§1.2.2.2.1) → a modifier column → Notes (present only when at least one node anywhere has a
note/ref) → the union of whichever unit keys (A/VA/W/VAR/pf) are active for *any* of the six
value-groups in Print/Export settings, each row populating only the columns its own group has
active (`activeKeySet(groupId, cfgSide)`) and leaving the rest blank. Verified this union matches
the source document's own worked example exactly: default AC settings produce VA/W/VAR/pf.

The modifier column carries two distinct labels, confirmed with the user: "Added" on the table
subject's own row when the subject's status is `new` (there's no banner row above the subject
itself in this transposed layout, so this is where that indicator lives instead — see below); and
"(Net Change)" on an existing-status *non-load* child row only — a Load child never gets this
label, since a Load's own net change is always 0 while existing and the value actually shown for
it is a Load value, not a net-change figure, so the label would misdescribe what's displayed.

**Child row values:** non-load children use their own Net Change (`_netChange`); Load children
use their own Load value (`loadValue`) — applied uniformly regardless of the child's own status,
per source §1.2.5.2/.2.5.3. Removed values render negative, in parens. Font size 1pt smaller than
parent/group rows (7.5pt vs 8.5pt); indented one level deeper than the CAPACITY/EXISTING LOAD
labels.

**Notes (built on §34's group scoping):** the table subject's own notes/refs are split out by
`group` across its own rows — item-level (`group:null`) on the Parent Item row, `cap`-scoped on
the CAPACITY row, and so on. A child's notes all attach to its single collapsed row regardless of
`group` — a child only ever gets one row in someone else's table (it gets its own full per-group
breakdown only in its *own* table, if it's independently eligible). Local note/reference
numbering restarts per this report, same convention as the existing Load Analysis Detail report;
the same note can be renumbered differently in two different tables if a node appears both as a
child in its parent's table and as its own table's subject — this matches the existing report's
established (not new) behavior, not a regression.

**No "Removed" indicator on a Removed-status parent's own row anywhere** (not a banner, not in
the modifier column) — matches the existing Load Analysis Detail report, which likewise never
labels a Removed subject's own row beyond its italic styling. Confirmed with the user.

**Overload warning highlighting**, added as a same-day follow-up refinement: the New Load row
gets the existing report's `rpt-over`/`rpt-warn` row tint (from the table subject's own
`_warnings`, specifically whether `W3` — new load exceeds capacity — is present) plus
`rpt-over-val` emphasis on that row's own value cells when overloaded. Confirmed with the user
this is the one row it logically belongs to in this transposed layout, since Capacity/Existing
Load/Net Change/Remaining aren't themselves what "new load exceeds capacity" is about. Not
extended to child rows (children only ever get a single collapsed row here, and this wasn't asked
for) or to any other group row.

Verified live with a seeded DC tree (Existing bus, an Existing/Removed/New child each, a
grandchild Load under both the Removed and New children; a separate New-status overloaded bus
with an existing non-load child, an existing Load child, and a new Load child pushing New Load
over capacity) and a seeded AC bus: every row's values, the CB rating column, the per-status
modifier/styling (including the Load-vs-non-load "(Net Change)" distinction and the New-status
"Added" modifier), the New Load row's overload tint and cell emphasis, per-group column activation
on both AC and DC defaults, group-scoped note placement and footnote numbering, and the
empty-state message all checked out against hand-computed expected values. Confirmed no
regression in the existing Load Analysis Detail / Load Analysis Summary / Power Distribution
Summary tabs.

## 36. Revision 36 (Phase 1) — Quick Wins

*Last updated: 2026-07-28*

First phase of an 8-item request ("Watts Up Revision 36 (+).txt"). This phase covers the five
smaller, independent items (§3-5, §7-8 of the source document); the larger notes/references
rework (§1), the "New"/"Added" → "Installed" terminology sweep (§2), and the two warning fixes
(§6) are deferred to later phases.

**+Child default item type by parent type** (source §3): new `defaultChildTypeFor(parent)` —
Total Aircraft Load/Generation/Conversion parents default to Bus, Distribution parents to Circuit
Breaker, Protection parents to Load. Wired into both `gridAddChildRow` (previously always
defaulted to Load) and the LH tree's `openAdd` (previously always defaulted to `afLastType`,
initially "Generator") — but only when `openAdd` is opening for a genuine child (a real parent
id); adding a brand-new root still uses the remembered last-used type, since no parent-type rule
applies there. Supersedes the "New child defaults to type Load" line in §23.3 for the grids' own
+Child button specifically (the Add Item(s) modal opened via the LH tree's +Child is a separate
code path, also updated here).

**Dup button focuses the new item's description** (source §4): `gridDuplicateRow` previously left
focus wherever it was after duplicating; now matches `gridAddChildRow`'s existing convention —
scrolls the new row into view and focuses+selects its description input (still defaulting to
"<original> (copy)").

**Existing/Removed grid +Child no longer zero-fills Existing Load** (source §5): `makeNode()`
seeds `existingLoad:mkPow(0,0,0,0,1)` (explicit zero, pf=1) for every hasCap node regardless of
status — shared by the Add Item(s) modal and `ensureTypeFields()`, so changing `makeNode()` itself
would have affected those too, which wasn't requested. Fixed narrowly: `gridAddChildRow` resets
`existingLoad` back to fully blank (`mkPow()`) immediately after creation, but only when the
grid's `defaultStatus` is `'existing'` (the Existing/Removed grid specifically, not the New grid).
W4 (§33, "existing load reads as zero") already treats `null` the same as an explicit `0`, so this
doesn't change when that warning fires — a truly-blank field and a zero-value field both still
warn.

**"Rating / Capacity" → "Capacity"** (source §7): reverted the `cap` group's `label` in
`AC_GROUPS`/`DC_GROUPS` (§13.2/§13.3), plus three hardcoded copies of the old text in the Print /
Export Settings dialog markup and one in the §13.4 Ampere-Rating-in-Name description. Flows
through automatically to Print Report, Word export, the original Load Analysis Detail report, and
Power Distribution Summary — confirmed via each rendering "Capacity" live. `renderLoadAnalysisDetailAlt`
already hardcodes "CAPACITY" as its own row label (never read `AC_GROUPS`'s label), so it was
already correct and untouched.

**Analysis Detail – Alternate: breadcrumb moved into the header row** (source §8): `detailBlockAlt`
already built `pathHtml` and its local `headerHtml(cols,hasAnnot,leftCellContent)` already accepted
a `leftCellContent` param — it was just being called with `''` while `pathHtml` was separately (and
incorrectly, per this clarification) prepended inline to the Parent Item row's own description
cell. Now passed into `headerHtml` instead, matching the original Load Analysis Detail report's
convention exactly.

Verified live: default child types for Root/Generator/TRU/Bus/Circuit-Breaker parents; Dup on a
childless node focuses+selects "X (copy)"; a fresh Existing/Removed +Child row shows genuinely
blank Existing Load cells (not "0.00"/pf "1.00"); "Capacity" renders correctly in Load Analysis
Detail and Power Distribution Summary headers; the Alternate report's breadcrumb now appears in
the header row instead of inline in the Parent Item row.

## 37. Revision 36 (Phase 2) — Warning Fixes

*Last updated: 2026-07-28*

Second phase of the Revision 36 request (§6 of the source document). Items 1, 2 remain deferred
(see §36 for the overall phase breakdown).

**W5 (§11, §33): AC children now compared on W and VAR, not VA.** The original implementation
summed each child's own `.va` (a vector magnitude, `sqrt(w²+var²)`) for AC nodes, and compared
that arithmetic sum against the parent's own `.va`. Since VA isn't additive the way real (W) and
reactive (VAR) power are, this comparison could miss genuine overages whenever the parent's own
existing load had a non-trivial VAR component inflating its VA figure relative to its W — a
parent at W=100/VAR=200 (VA≈223.6) would never trigger even if children summed to W=120,
because 120 < 223.6. `warnNode()`'s W5 block now sums children's W and (for AC only) VAR
separately and warns if *either* algebraic sum exceeds the parent's corresponding value — both
quantities are genuinely additive across parallel loads, unlike VA. DC is unaffected (was already
comparing `.w`).

**LAD-Alt (§35): warning highlights moved back to the items themselves.** Reverses the Revision
33 Phase 3 follow-up decision to highlight the New Load row specifically. New shared
`warnRowCls(node)` helper (`rpt-over`/`rpt-warn`, same convention as the original Load Analysis
Detail report) is now applied to the Parent Item row and to each child row, based on that node's
own `_warnings` — not to any of the six value-group rows (Capacity/Existing Load/Net
Change/New Load/Remaining), which stay unstyled regardless of warnings. The `overloaded` param
on `valueCellsForGroup` (added for the prior New-Load-row approach) was removed since nothing
calls it anymore.

Verified live: an AC parent with W=100/VAR=200 (VA≈223.6) and two existing children summing to
W=120 correctly triggers W5 (a case the old VA-based comparison would have missed); reducing
children back under both W and VAR thresholds clears the warning; pushing VAR alone over 200
(with W held under 100) triggers W5 independently of W. A W3-overloaded parent with two
also-overloaded children (no capacity entered, so blank-as-zero) showed `rpt-over` on the Parent
Item row and both child rows, with the CAPACITY/Net Change/New Load/Remaining rows unstyled.
Confirmed no regression in Load Analysis Detail, Load Analysis Summary, and Power Distribution
Summary.

## 38. Revision 36 (Phase 3) — "New"/"Added" → "Installed" Terminology

*Last updated: 2026-07-28*

Third phase of the Revision 36 request (§2 of the source document). Item 1 (the notes/
references rework) remains deferred.

**Display text only — the internal `status` value stays `'new'`.** Renaming the actual code
value would touch dozens of comparisons, saved-file compatibility, and every status-ordering
helper for no user-visible benefit; instead, a new shared `STATUS_LABEL`/`statusLabel(status)`
(`existing`→"Existing", `removed`→"Removed", `new`→"Installed") is the single source of truth for
how a status is *displayed*, and every rendering site now goes through it instead of using the
raw status string or a naive capitalize-first-letter transform.

**"New Load" is unchanged.** It's the computed value-group name (`existingLoad + netChange`,
shown regardless of an item's own status), not the item-status label — a different meaning
entirely, confirmed with the user before implementing.

**Everywhere the rename applies:**
- Status badges/dropdowns: the LH tree row badge, both Load Analysis Summary table variants
  (AC/DC), the Existing/Removed and Installed grids' status cells (`gridStatusToggleCell`/
  `gridStatusDisplayCell`, previously a naive `status[0].toUpperCase()+status.slice(1)`), the
  Edit Item modal's sibling list, and the Edit/Add modal's own Status `<select>` (option `value`
  stays `"new"`, visible text becomes "Installed"). The tree's up/down sibling-reorder button
  tooltips ("Move up within *installed* siblings") also go through `statusLabel(...).toLowerCase()`.
- The "New" grid tab is now labeled "Installed" (`#tab-new`'s button text — the internal id/CSS
  class/render-function names are unchanged).
- Report "Added" pseudo-header rows/banners → "Installed": the original Load Analysis Detail
  report, the Analysis Detail – Alternate report (both its child pseudo-header and its modifier-
  column label on a New-status parent's own row), Print Report, and Word export.
- The `added` value-group's label (`AC_GROUPS`/`DC_GROUPS`, §13.2/§13.3) → "Installed (Removed)",
  including its three hardcoded copies in the Print/Export Settings dialog markup.
- Print Report's dead, never-called `buildPrint()`/`printRows()` (the real Print Report button
  flow is `buildPrintR10()`/`buildSectionRows()` — see the Revision 20 note on this) was updated
  for text consistency too, even though it isn't reachable.

Verified live across every surface above with a seeded tree containing an Existing bus, a Removed
child, an Installed (new-status) child with its own Installed (new-status) grandchild load:
tree badge + tooltip, both Summary table variants, both grids, the Edit modal's Status dropdown
and sibling list, the original Load Analysis Detail report (group header label and pseudo-header),
the Alternate report (modifier-column label and child pseudo-header), and Print Report (group
header label and pseudo-header/bolding) all read "Installed" where "New"/"Added" used to appear.
Word export's equivalent line was confirmed by direct source inspection (the same JSZip-based
round-trip check used in earlier revisions wasn't run this time, since it needs the JSZip CDN and
this was a single, simple, directly-verified text-literal change).

## 39. Revision 36 (Phase 4) — Shared Note Bank and Reference Dedup

*Last updated: 2026-07-28*

Final phase of the Revision 36 request (§1 of the source document) — the one flagged upfront as
the largest change. Confirmed with the user before starting: the Edit modal's Notes section
becomes an in-place checklist (not a separate dialog).

**Problem:** the same note or reference cited by multiple items (or item value-groups) generated
a completely separate footnote instance every time, with no dedup anywhere — `buildAnnotationMap`
(Print/Word), the local annotator in Load Analysis Detail, and the `annotateGroup`/`annotateAll`
pair in Analysis Detail – Alternate each did a bare `++counter` per instance.

**Data model:** new `meta.rowNoteDefs` — `[{key,text}]`, a shared note-text bank structured
exactly like `meta.references` (§14.3). `rowNotes` entries change from `{text,group}` to
`{key,group}`, referencing the bank instead of storing text inline — mirroring how `rowRefs`
already references `meta.references` by key. Existing saves migrate by creating one bank entry
per existing note (no attempt to merge identical-looking text across different items — safer
default; the user can consolidate manually via the new Document tab section, §14.5).

**References (source §1.1.1):** a citation with no per-item comment now renders as a plain
`[N]` directly in the Notes column — pointing straight at the reference's own number in the
References list — and consumes no footnote number at all. A citation *with* a comment keeps
generating a footnote (`ref [N] docNo: comment`), unchanged from before. This alone doesn't fully
solve the duplication problem (per the source document's own caveat), but meaningfully reduces it
for the common case, at effectively no added complexity.

**Dedup (all three footnote builders now share one `makeAnnotator()` factory):** within a given
scope — the whole document for `buildAnnotationMap`, or each individual table for the two Load
Analysis Detail reports — the same note key, or the same reference key **and** comment together,
resolves to one footnote number and one printed line; every citing row's marker reuses that same
number. Two citations of the same reference with *different* comments still get separate numbers,
since the printed text genuinely differs. Numbering itself is unchanged from before (one counter
per report/whole-document, not reset per table) — only *reuse* of an already-assigned number for
a repeated key is new; a table's own footer list is sorted by number before rendering, since a
reused (lower) number can be encountered after a freshly-created (higher) one within that table.

**Edit Item dialog (§14.6):** the Notes section is now a checklist against `meta.rowNoteDefs`,
mirroring the References checklist exactly (check to associate, plus a group picker once
checked). Note text itself is live-editable and commits immediately (like Document-tab meta
edits), not deferred to this dialog's Save/Cancel — editing a note's text from any item that uses
it updates the shared bank everywhere. `+ Add New Note` creates a blank bank entry, auto-checks it
for the current item, and focuses its text field.

**Document tab (§14.5):** new "Row Notes" management section, structurally identical to General
Notes (ordered list, `[↑][↓][✕]`, `+ Add Row Note`) but managing the per-item note bank instead of
document-wide narrative text.

Verified live: the same note key cited by two different items in one table produces exactly one
footnote entry, with both items' markers showing the same number (confirmed in Load Analysis
Detail, Analysis Detail – Alternate, and `buildAnnotationMap` independently); a no-comment
reference citation renders as a bare `[N]` with zero footnote entries created; the same
reference+comment cited twice dedupes to one footnote, while the same reference with two
*different* comments correctly gets two; the Edit modal's checklist correctly shows existing
associations checked, toggling the checkbox shows/hides the group picker, "+ Add New Note"
creates-and-focuses a new bank entry end-to-end through the actual UI (not just direct state
manipulation), and a second item can then check that same new note and dedupe against it; the
Document tab's Row Notes section adds/edits/reorders/deletes correctly with live persistence; a
full JSON export→migrateLegacy→import round-trip preserves the new shape unchanged. Confirmed no
regression across Load Analysis Summary, Power Distribution Summary, both Load Analysis Detail
reports, both grids, and the Document tab.

## 40. Revision 36 Cleanup Round — W5 VAR Disabled, Load+Existing Inhibited, TRU VAR Sign, LAD Column Offset, "Remaining"→"Reserve"

*Last updated: 2026-07-29*

Five clean-up items reported after using the Revision 36 build.

**1. W5's VAR check disabled (§11).** See §11's table — noted there rather than repeated here.

**2. Load item-type + Existing status inhibited.** A Load can no longer be Existing status
anywhere in the app:
- Existing/Removed grid's `+Child` under a Circuit Breaker (or any parent that resolves to a
  Load default via `defaultChildTypeFor`) now defaults the new child to Removed instead of
  Existing, since Existing is no longer a legal status for a Load.
- Add Item(s) and Edit Item dialogs: selecting Load as the item type disables the "Existing"
  `<option>` in the Status dropdown; if Existing was already selected, the dropdown switches to
  Removed. This only touches the form controls — no node data changes until the dialog is saved.
  Opening Edit on a legacy item saved before this rule existed (Load + Existing) shows the
  corrected "Removed" value in the dropdown immediately, but doesn't touch the saved node data
  unless the dialog is actually saved.
- Existing/Removed grid's own inline Item Type dropdown: switching a row's type to Load forces
  its status to Removed if it was Existing. The inline status toggle button (Existing↔Removed)
  is replaced with a plain, non-interactive badge for Load rows, since Existing is never a valid
  toggle target for them.
- The Installed grid needed no changes — its editable rows are always New status already, so
  Load+Existing was never reachable there.

**3. TRU conversion-IN VAR sign fixed.** `calcNC()`'s conversion-IN branch derived `inVAR` via a
bare `Math.sqrt(Math.max(0,...))`, which is always non-negative regardless of the sign of
`inW`/`inVA` — so a negative net change flowing through a converter (something removed on the
output side) correctly produced negative A/VA/W on the input side, but VAR stayed positive. Fixed
to match `deriveAcFromWVar`'s existing convention (VA's sign follows W's sign): `inVAR`'s sign now
follows `inW`'s sign.

**4. Load Analysis Detail column offset fixed.** `detailBlock()`'s local annotation map `am` was
always a truthy object (`{}`) regardless of whether the report had any notes at all
(`hasAnyAnnot`), so `buildRptRow()` always rendered an empty Notes `<td>` on every row — while
`buildRptHeader()` correctly omitted the Notes `<th>` whenever `hasAnyAnnot` was false. Result:
every value column was shifted one column right relative to the header, whenever the report had
no notes anywhere. Fixed by passing `null` instead of `am` when `hasAnyAnnot` is false, matching
the header exactly. (The Alternate report and `buildAnnotationMap`/Print/Word were unaffected —
each already conditioned its own notes-column presence on the same flag consistently.)

**5. "Remaining" → "Reserve" (user-facing).** The `rem` group's `label` in `AC_GROUPS`/`DC_GROUPS`
(§4, §6, §13) — flows through to Load Analysis Summary, Power Distribution Summary, the original
Load Analysis Detail report, Print Report, and Word export automatically. Plus its own hardcoded
copies: the Analysis Detail – Alternate report's row label, `NOTE_GROUP_LABELS`, the dead
`buildPrint()`/`printRows()` header, and the Print/Export Settings dialog's two checkbox-row
labels. The internal `rem` group id and the `_remainingCapacity` field name are unchanged
(neither is user-visible). Historical Revision-narrative sections describing what was true at the
time keep the old "Remaining"/"Added (Removed)" wording, per this doc's established convention.

Verified live: a parent at W=100/VAR=200 with a child summing VAR past 200 (but W under 100) no
longer triggers W5; `+Child` from a Circuit Breaker in the Existing/Removed grid produces a
Load+Removed row; selecting Load in the Add modal disables/switches away from Existing, and
switching back to a non-Load type re-enables it; the grid's inline type-to-Load switch
auto-flips an Existing row to Removed and replaces its toggle button with a plain badge; opening
Edit on a simulated legacy Load+Existing node shows "Removed" in the dropdown and commits it on
Save without having touched status directly; a TRU with a removed DC load on its output produced
W=-105.3/VAR=-34.6/VA=-110.8/A=-0.96 — all consistently negative; a Load Analysis Detail table
with zero notes anywhere now has matching header/data column counts (13/13), and still matches
with one note added (14/14); "Reserve" confirmed rendering in Load Analysis Summary, Power
Distribution Summary, both Load Analysis Detail reports, and Print Report. Confirmed no
regression across every tab.

**Follow-up (same round): delete a row note from the Edit Item dialog (§14.6).** The Notes
checklist (added in §39/Revision 36 Phase 4) had no way to remove a bank entry — only the
Document tab's Row Notes section (§14.5) could. Added a ✕ button per entry, mirroring the
Document tab's own delete button, but with a sharper warning: since deleting removes the note
from the shared bank entirely (not just this item's association with it), the confirm message
counts how many *other* items (excluding the one currently open in this dialog) still reference
the note's key and names that count specifically — e.g. "This note is also used by 2 other items.
Delete it for all of them?" — versus a plain "Delete this row note?" when no other item uses it.
Deleting removes the entry from `meta.rowNoteDefs` and re-renders the checklist; any other item's
now-dangling `rowNotes` reference simply stops rendering any text/marker, same as removing a
Reference or deleting via the Document tab.

Verified live: two items both referencing the same note — deleting from one item's Edit dialog
correctly warns "used by 1 other item," declining leaves the bank entry untouched, confirming
removes it from the bank and the checklist empties to the "no notes defined yet" hint; a note
used by only the current item shows the plain warning instead.

## 41. Future Enhancements

- Three-phase AC circuit support
- Multiple flight phases / scenarios (Takeoff, Cruise, Approach and Landing, Emergency,
  generator failure, etc.)
- Load intervals (instantaneous, 5-sec, 5-min, 15-min, continuous)
- Print settings: user-defined rounding schedule
- Restrict Watts-Up-exclusive sections in the Word document so users can adjust formatting
  but cannot overwrite generated content (references list, analysis tables). Mechanism:
  `<w:lock w:val="sdtContentLocked"/>` on the relevant content controls, optionally combined
  with `<w:documentProtection>` allowing formatting-only changes in those regions.
- Incorporate the Power Distribution Summary and Load Analysis Detail reports (§20.3–20.4)
  into the Word document export.
