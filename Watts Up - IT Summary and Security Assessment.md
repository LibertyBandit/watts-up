# Watts Up — IT Summary and Security Assessment

*Prepared 2026-10-17 for IT review. Describes `watts-up.html` as of the release whose SHA-256 is given in §9;
recompute the hash for any later copy before relying on this document. Current program version: 0.9.14 (testing build).*

## 1. Summary for IT

Watts Up is an aircraft electrical load-analysis tool. It is **one self-contained HTML file** (about 650 KB) that
runs entirely inside a web browser tab.

- **No executable, installer, service, driver, macro or add-in.** Nothing is installed; nothing is registered
  with the operating system; no file associations; no listening ports; no background processes.
- **No server component, database, accounts or login.** Nothing is sent anywhere: the program makes **no
  network requests of its own** and has no telemetry, analytics, cookies or update check.
- **One external dependency**: the open-source library JSZip 3.10.1, loaded from `cdn.jsdelivr.net` when the page
  opens (needed only to create and read Word files). It is pinned with a Subresource Integrity hash, so the
  browser refuses to run it if the CDN ever serves different content.
- **It can only touch files the user explicitly picks** (a project `.json` file or a Word `.docx` file) through
  the browser's own file dialogs. It cannot browse folders, read other files, run programs or reach other
  applications.
- **Putting copies on a network does not, by itself, give the program any access to other programs or files.**
  The realistic risks are about *who can change the copy on the share*, *where project data is stored*, and
  *what origin the page is served from* — see §5.

Overall assessment: **low risk** for the network and other programs, provided the deployed copy is
write-protected (§6). Two weaknesses found during this review were fixed (§7).

## 2. What the program is

| Item | Detail |
|---|---|
| Deliverable | `watts-up.html` — HTML, CSS and JavaScript in one file; no build step, no other files needed |
| Runs in | A current desktop browser. Chrome or Edge give the full feature set (direct open/save dialogs); Firefox and Safari work but save by downloading files |
| Embedded content | A Word report template, stored inside the file as Base64. Reviewed: 31 parts, **no macros, no embedded or ActiveX objects, no external links**. The user guide is also stored inside the file, as inert text (see §3.4) |
| Installation | None. Copy the file; open it in a browser |
| Updates | Manual: replace the file. There is no self-update mechanism and no update check. The program carries a version number (`MAJOR.MINOR.PATCH`, shown in its header); each release is archived and published with a release note giving the version and SHA-256 (see `RELEASING.md`) |
| Authentication / roles | None. Whoever can open the file can use all of it |
| Source | A plain-text HTML file; everything the program does can be read in the file itself |

## 3. Interfaces and data flows

### 3.1 Inputs
- **Keyboard entry** into the on-screen forms and grids (item names, ratings, loads, notes, references…).
- **Arithmetic in number fields** (for example `=12*3.5`). Evaluated by a restricted check that allows only
  digits, spaces and `+ - * / . ( )` before evaluating; anything else is ignored.
- **Project files (`.json`)** chosen by the user. Checked on load (structure, types, identifiers, allowed
  values) before use.
- **Word files (`.docx`)** chosen by the user. The program reads the document text of its own content
  controls and a project snapshot embedded in the file. Checked the same way as project files.

### 3.2 Outputs
- **Project file (`.json`)** saved by the user (save dialog, or an ordinary download).
- **Word report (`.docx`)**, created from the embedded template, either downloaded or written into a Word
  file the user chose and granted write permission to ("connected" file).
- **Print / PDF**, through the browser's normal print dialog.

### 3.3 Browser features it uses
| Feature | Used for | Limits |
|---|---|---|
| `localStorage` (key `wattsup_v1`) | Automatic save of the current project so it survives a page reload | Per browser profile and per web origin; not encrypted |
| `IndexedDB` (database `wattsup_files`) | Remembers the last file the user opened or saved so the next file dialog opens in that folder | Holds only a handle reference to that one file (no contents; it grants no access by itself); per browser profile and web origin; cleared with site data |
| File System Access API (`showOpenFilePicker`, `showSaveFilePicker`, handle permission) | Open/save project and Word files | Only the files the user picks; a write permission prompt is shown; no folder access; no access outside the pick |
| Blob downloads, `blob:` page for the user guide, `window.print` | Fallback downloads, the Help guide tab (built from text inside the file; no script in it), printing | In-memory addresses only; standard browser behaviour |
| JSZip (from the CDN) | Read/write the zip container inside `.docx` | See §5.2 |

### 3.4 What it does **not** do
No `fetch`/XHR/WebSocket calls, no cookies, no `postMessage`, no web workers or service workers, no geolocation/camera/microphone/clipboard
access, no IndexedDB use beyond the one stored file reference (§3.3), no `eval`, no remote code loading other than JSZip, no execution of anything found in a project or Word
file, no access to the network file system other than through a file the user chooses.

**One new window, only when the user asks for it.** The **Help** button opens the user guide in a new browser tab. The guide
is text stored inside `watts-up.html` (an inert `<script type="text/html">` block that the browser never runs). On a click, the
program fills in its version and date and opens the page from a `blob:` address created in the browser's memory — nothing is
downloaded or fetched, the page contains **no script**, and it is opened with `noopener` so it has no link back to the program's
window. No other window, pop-up or redirect is ever opened.

**Version stamping.** Project files and Word reports record the version of the program that made them (`appVersion` in the
project data; a `WattsUpVersion` Word document property). This is a local text value; it is not sent anywhere. When a file
made by a *newer* version is opened, the program shows a confirmation prompt.

## 4. Data handled

The data is engineering information about an aircraft electrical system: item names, ratings, load values,
notes, references, document numbers, and report text. Depending on the customer and program it may be
**proprietary or export-controlled**; classify and store it according to your normal policy.

Where copies of the data can end up:
- **Browser storage** (`localStorage`, and an IndexedDB reference to the last picked file — no contents) on each user's machine — unencrypted, kept until cleared.
- **Project `.json` files** — plain text, wherever the user saves them.
- **Word reports** — also carry a full copy of the project as hidden data inside the file (so the report can be
  loaded back into the program). Anyone who receives the Word file can extract that data, even if the visible
  report shows only part of it.

## 5. Risk assessment for a networked deployment

### 5.1 Effect on other programs and files on the network
**None by design.** There is no installer, no service, no shared library or registry change, no listening
port, no inter-process communication, and no ability to run or modify other software. The browser sandbox
keeps it away from other files; it can only read/write what a user picks in a file dialog, and then only
with that user's own permissions.

### 5.2 Risks and mitigations

| # | Risk | Likelihood / impact | Status and recommended control |
|---|---|---|---|
| 1 | **Tampering with the shared copy.** If users can write to the folder holding `watts-up.html`, someone could alter the file to read project data or misreport results. This is the main risk of a network copy. | Low likelihood if permissions are right; high impact | Publish the file **read-only** to users (write access only for the owner/IT). Keep a checksum (§9) and re-verify periodically. Prefer a signed or version-controlled distribution. |
| 2 | **Library supply chain (JSZip from a CDN).** | Low | **Mitigated:** the script tag carries a Subresource Integrity hash, so altered content is refused. On networks without Internet access, the Word features will not work unless JSZip is hosted locally (copy `jszip.min.js` 3.10.1 beside the file and change the one `<script src>` line; update the hash if the build differs). |
| 3 | **Malicious or tampered project/Word file** (for example a crafted `.json` or `.docx` sent by email). | Low–medium | **Reviewed and hardened (§7).** Files are checked on load; text is escaped when drawn; a file with unexpected data types or markup in identifier/number/enum fields is refused. Users should still treat project files from unknown sources like any document. |
| 4 | **Shared web origin.** If the file is hosted on an intranet web server alongside other pages, all pages on the **same origin** share the same `localStorage`, so another page's script could read the saved project, and Watts Up could read theirs. Opened from `file://`, behaviour differs by browser (some treat all local files as one origin). | Low–medium; depends on hosting | Host it on its **own host name or port**, or open it from a local copy. Do not host it with other applications that handle sensitive scripts. Do not add third-party scripts to the page. |
| 5 | **Data at rest on users' machines.** Auto-saved project data stays in the browser profile; saved files stay wherever the user puts them. | Medium for sensitive programs | Use managed/encrypted drives and profile policies; use browser "clear data on exit" or private windows on shared machines; store project and Word files on access-controlled shares. |
| 6 | **Hidden project data inside Word reports.** | Medium (confidentiality) | Warn users: a distributed `.docx` contains the whole project. Share PDFs or remove the embedded data when sending outside the project team. |
| 7 | **Write access to a chosen Word file** (File System Access API). | Low | User must pick the file and approve a write-permission prompt each session; no other file or folder is reachable. |
| 8 | **Formula entry** uses a restricted arithmetic evaluator. | Low | Only digits and the operators `+ - * / . ( )` are allowed through before evaluation. |
| 9 | **Denial of service from a very large or corrupt `.docx`/`.json`.** | Low | Affects only the user's own browser tab (it may slow or hang). No effect on the network. |
| 10 | **No authentication, audit trail or locking.** Several people saving to the same file on a share overwrite each other (last save wins). | Operational, not a security flaw | Use document-management or version control for project files; keep one owner per project file. |
| 11 | **No Content-Security-Policy.** | Low | Optional hardening (§8). The program needs inline scripts and styles, so a CSP can only restrict *where else* it may connect or load from. |

## 6. Deployment checklist

1. Publish **only** `watts-up.html` (and, if wanted, the requirements/help documents). Do **not** copy the rest of
   the development folder: it contains spreadsheets, test project files with real customer data and a workbook
   whose file name contains a password.
2. Place it on a **read-only** location for users; restrict write access to the owner/IT.
3. Record its SHA-256 (§9) and check it after any file-share maintenance.
4. Serve it from its own host name or port if it is on a web server, or have users open a local copy.
5. Allow outbound HTTPS to `cdn.jsdelivr.net` (for JSZip) — or host `jszip.min.js` internally as described in §5.2.
6. Use current, patched Chrome or Edge.
7. Tell users: project and Word files contain the full project; store and share them accordingly.
8. Keep a copy of every released version (`releases\watts-up-X.Y.Z.html`) so a change can be rolled back, and publish a release note with each version's SHA-256. Users can see which version they are running in the program header.

## 7. Security review performed on 2026-10-17 — findings and fixes

The program's code was reviewed for network access, script execution, storage and file handling, and tested
by loading deliberately booby-trapped project files (script/markup placed in every text field, then in number,
status, AC/DC, identifier, note-group and phase fields) and exercising every screen, the print report and the Word
builders to see whether anything would execute.

| Finding | Severity | Fix |
|---|---|---|
| **Stored script injection in the Print Report's References list.** The "organization" and "document number" of a reference were written into the page without escaping, so a crafted project file could run script when the Print Report was built. | Medium (needs a malicious file the user opens) | Both fields are now escaped, like every other text field. Re-test: no injected content executes. |
| **Imported files were not type-checked.** A hand-edited file that put text where a number, identifier or fixed-choice field belongs (for example `status`, `acDc`, a voltage, an item id) could carry markup into screens that draw those fields without escaping. | Medium (same precondition) | Every load path (JSON file, Word file, saved browser data) now validates item fields: identifiers must be plain, numbers must be numbers, choices must be from the allowed list, notes/phase fields must be well-formed. A bad file is refused with a message. The sample project file in the folder still loads. |
| **JSZip loaded from the CDN without an integrity hash.** | Low | Subresource Integrity (SHA-384) and `crossorigin` added to the script tag. |

After the fixes, none of the test files executed any injected code, and normal project files load and report as before.
This was a code review and functional test, not a formal penetration test; IT may wish to run its own scan.

**Addendum, 2026-10-18 (version 0.9.0 onward — versioning and the Help guide; 0.9.1 to 0.9.14 changed only report layout and formatting, change-tracking marks (a second copy of the project's items stored in the project file), the Word Report dialog, one grid focus handler, shared-TRU editing, a load-time data repair and a generated row note, with no new network, storage or window behavior).** Reviewed the two additions. (1) The version a file
claims is used only after it matches a strict `number.number.number` pattern, and is shown in a plain-text confirmation, never
inserted into a page. (2) The Help page is built only from text constants inside the program (no project data, nothing from a
file), contains no script, and is opened with `noopener`. Tested: a project file with a malformed or markup-bearing version
is treated as unstamped; the guide page contains no script element and no unreplaced placeholders.

## 8. Optional further hardening

- **Host JSZip internally** and remove the CDN dependency (air-gapped or high-assurance networks).
- **Add a Content-Security-Policy** in the web server headers (or a `<meta>` tag) that blocks network connections
  and other loads the program never needs, for example:
  `default-src 'none'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'`
  (adjust `script-src` if JSZip is hosted internally; test the Word features after enabling it).
- **Serve over HTTPS** with `X-Content-Type-Options: nosniff` and `frame-ancestors 'none'` if hosted on a web server.
- **Endpoint policy:** restrict who may use the File System Access API if your browser policy needs it.

## 9. How IT can verify the copy

- **SHA-256 of the reviewed file (`watts-up.html`, version 0.9.16, 765590 bytes):**
  `8cb482369a4158f6912f544a8553fe5d4126a79f2de00f72830ab4884b868d56`
  (PowerShell: `Get-FileHash watts-up.html -Algorithm SHA256`). A different value means the file has changed since
  this assessment — a newer release, a modified copy, or a copy whose line endings were converted (for example by
  a source-control checkout on Windows). Ask the owner for the hash of the exact release being deployed.
- **Network behaviour:** open the browser's developer tools (Network tab) and use the program: the only request is the
  one for `jszip.min.js` from `cdn.jsdelivr.net`. Nothing is sent when loading, editing, saving or reporting.
- **Storage:** Application → Local Storage shows the single key `wattsup_v1`.
- **Source review:** open the HTML file in any text editor; search for `fetch`, `XMLHttpRequest`, `eval`,
  `WebSocket` to confirm they do not appear (the only `Function(` call is the restricted arithmetic evaluator).

## 10. Contacts and ownership

Owner and maintainer: the Watts Up project owner. Report any suspected problem with a project or Word file
before opening it further; do not open files from unknown sources in the program.
