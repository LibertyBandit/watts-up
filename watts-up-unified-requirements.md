# Watts Up — Unified Requirements
Supersedes: watts-up-requirements.txt, watts-up-revision-1- through revision-9-requirements.txt
Last updated: 2026-06-15 (through Revision 11)

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
**Capacity and Remaining Capacity:** Amps (A), Volt-Amps (VA)
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
**All columns (Capacity, Existing Load, Load, Net Change, New Load, Remaining):** Amps (A), Watts (W)

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
| Capacity | Existing Load | Load | Net Change | New Load | Remaining |
|---|---|---|---|---|---|
| A, W | A, W | A, W | A, W | A, W | A, W |

### 6.2 AC Summary columns
| Capacity | Existing Load | Load | Net Change | New Load | Remaining |
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
Used by the Calculate button (§7.12). Applies to all AC field groups (Existing Load, Load).
Requires VA to be set for W/VAR/pf derivations; requires V > 0 for A/VA derivations.
No-op if prerequisite values are missing.

| Field entered | Fields derived | Formulas |
|---|---|---|
| **A** | VA, W, VAR | VA = V×A; W = VA×pf; VAR = √(VA²−W²) |
| **VA** | A, W, VAR | A = VA/V; W = VA×pf; VAR = √(VA²−W²) |
| **W** | VAR, pf | VAR = √(VA²−W²); pf = W/VA |
| **VAR** | W, pf | W = √(VA²−VAR²); pf = W/VA |
| **pf** | W, VAR | W = VA×pf; VAR = √(VA²−W²) |

### 7.8 Auto-clear on first entry (Revision 9)
When the user types into any field in a section (Capacity, Existing Load, Load, Net Change Override)
for the first time after opening the dialog, all other fields in that section are automatically
cleared. This fires once per section per dialog open session, enabling a clean Calculate workflow
without requiring a manual Reset first.

### 7.9 Conversion parameters section (conversion items only)
- **Efficiency** input (default 0.85)
- **convPf** input — visible for TRU, Inverter, and Frequency Converter
  (default: TRU = 0.95, Inverter = 1.0, FC = 1.0)
- Three-row layout with Reset button per row:

| Row | DC-side fields | AC-side fields |
|---|---|---|
| Row 1 — Capacity | Input Cap (A), Input Cap (W) | Input Cap (A), Input Cap (VA) |
| Row 2 — Existing Load | Input Exist. Load (A), Input Exist. Load (W) | Input Exist. Load (A), Input Exist. Load (VA) |
| Row 3 — Efficiency/PF | Efficiency, Conv. Power Factor (Reset) | — |

Each row's Reset button clears all fields in that row.
Input/output capacity and existing load auto-derive via efficiency and convPf; see §7.12.

### 7.10 Duplicate button
- Copies the current node; appends "(copy)" to the description
- For Conv IN nodes: also copies the paired OUT child node (child of the copy)

### 7.11 Formula entry
All numeric fields accept Excel-style expressions starting with `=` (e.g., `=28*2` → `56`).

### 7.12 Calculate button
Fills blank fields from entered values using power formulas. Applies on button press; also applies
automatically on save for any remaining blank fields.
- **AC sections**: derives per the field table in §7.7
- **DC sections**: derives missing A or W using A = W/V or W = V×A
- **Conversion items**: derives input/output capacity and existing load via efficiency and convPf

---

## 8. Add Item(s) Dialog

### 8.1 Field layout
1. **Parent Item** dropdown (top)
   - Excludes children/descendants of any selected item
   - Includes "No Parent (New Root)" option
2. **Item Type** dropdown — "Aircraft Total" only when Parent = "No Parent"
3. **Status**: Existing / New / Removed
4. **AC / DC** selector — locked to parent's AC/DC when parent is selected
5. Master-detail table (§8.3)
6. **Duplicate row button** per row — copies the row and appends "(copy)" to the description

### 8.2 State memory
- On open: fully reset the table (clear DOM and row data) and display one blank row
- Remember last-used Item Type and Status; restore on next open

### 8.3 Table columns (context-sensitive)
All row types include: Description, RefDes (optional)

| Item / Status | Additional columns |
|---|---|
| DC, any | Capacity (A or W), Existing Load (A, W), Load (A, W) |
| AC, any | Capacity (A, VA), Existing Load (A, VA, W, VAR, pf), Load (A, VA, W, VAR, pf) |
| Conv item | IN Volts column + OUT Volts column |
| Non-load, New | Load field replaces Existing Load; leave blank if item will have children |

Formula entry applies to all numeric columns.

### 8.4 Volts and AC/DC locking
Same rules as Edit Item §7.2; applied per row based on selected parent and item type.

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
- **Remaining Capacity** = capacity − newLoad

---

## 11. Warnings

| Condition | Warning |
|---|---|
| Negative load value entered | Warn on entry |
| New load is negative after net changes applied | Warn |
| New load exceeds item capacity | Warn |
| User adds children to a Load or Removed item | Warn |
| User adds children after manually entering a net change override | Warn |
| Non-load Removed item | Existing load entered as negative net change |

---

## 12. Data Persistence

- **Export JSON**: metadata + full node tree → file named `WattsUp_{make}_{model}_{serial}_{date}.json`
- **Import JSON**: restores a previously exported analysis
- **Auto-save to localStorage**: state persisted across page refreshes

---

## 13. Print / Export Report (Revision 10)

### 13.1 Print Settings Dialog
Clicking "Print Report" opens a settings dialog before printing. The dialog contains:
- **AC Summary — Columns to Include**: checkboxes for each sub-unit under each group (§13.2)
- **DC Summary — Columns to Include**: checkboxes for each sub-unit under each group (§13.3)
- **Options**: Conv IN NC-only toggle; Show bar charts toggle
- Buttons: Reset to Defaults | Cancel | Print

### 13.2 AC Report Column Groups and Defaults
All AC groups offer A, VA, W, VAR, pf for selection.

| Group | Default units selected |
|---|---|
| Rating / Capacity | A, VA |
| Existing Load | VA, W, VAR, pf |
| Added (Removed) | W, VAR |
| Net Change | W, VAR |
| New Load | VA, W, VAR, pf |
| Remaining | VA |

### 13.3 DC Report Column Groups and Defaults
A and W selected by default for all groups: Rating/Capacity, Existing Load, Added (Removed),
Net Change, New Load, Remaining.

### 13.4 Ampere Rating in Name (Protection Devices)
If the user deselects "A" from Rating/Capacity, Circuit Breakers and Fuses still show their
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

### 13.10 Tree Grouping Within Sections
Within each parent's children, items are ordered: existing first, then a "Removed" label row
followed by removed items, then an "Added" label row followed by new items. Label rows span
the full table width at the same indentation as the items they introduce.

### 13.11 Status Formatting
- Removed items: description in italic, subdued color
- New items: description in bold
- No strikethrough

---

## 14. Future Enhancements (Deferred)

- Three-phase AC circuit support
- Multiple flight phases / scenarios (Takeoff, Cruise, Approach and Landing, Emergency,
  generator failure, etc.)
- Load intervals (instantaneous, 5-sec, 5-min, 15-min, continuous)
