# Releasing Watts Up

How a new version goes out. Day-to-day work happens on `master` with the version number left alone;
a release is the moment you decide "this build is what everyone should use."

## Choosing the number

| Change since the last release | Bump | Example |
|---|---|---|
| Saved files or calculated results change in a way an older copy cannot follow | MAJOR | 1.4.2 → 2.0.0 |
| New features; older files still open | MINOR | 1.4.2 → 1.5.0 |
| Fixes only | PATCH | 1.4.2 → 1.4.3 |

Before `1.0.0` the program is in testing: use `0.9.x` (PATCH for each testing build). When testing is finished,
the release is `1.0.0`.

## Checklist

1. **Test** the build (the usual live checks; load a sample project and a Word report).
2. **Bump** `APP_VERSION` and `APP_RELEASE_DATE` (near `const LS=` in `watts-up.html`) — the only place the
   version is stored.
3. **CHANGELOG.md** — add a section for the new version: what changed for users, and which internal
   Revision numbers it contains.
4. **Requirements document** (`watts-up-unified-requirements.md`) — make sure the new revisions are recorded.
5. **User guide** — update `Watts Up - User Guide.md` for anything users will notice, then rebuild the copy built into the
   program: `py -3 tools/build-guide.py` (needs `pip install markdown`). The version and date on the guide fill in by
   themselves. Regenerate the Word copy too if you keep one (`Watts Up - User Guide.docx`).
6. **IT summary** (do this last, after every change to `watts-up.html`, including the guide rebuild) (`Watts Up - IT Summary and Security Assessment.md` and `.docx`) — recompute the SHA-256 and byte
   size of `watts-up.html` (`Get-FileHash watts-up.html -Algorithm SHA256`) and update §9. Update any statement
   about network access, pop-ups or storage if the release changed them.
7. **Commit** (message like `Release 1.0.0`), then **tag**: `git tag -a v1.0.0 -m "Watts Up 1.0.0"`.
8. **Push** commits and tag (`git push origin master --tags`) when you are ready.
9. **Publish the copy for users**
   - Keep an archive copy: `releases\watts-up-1.0.0.html` (never change or delete archived versions).
   - Replace the read-only shared copy `watts-up.html` with the same file.
   - Post a short release note: version, date, what changed (from the changelog) and the SHA-256.
10. Tell users to compare the version number in the program header with the release note; if it is older, close
    the tab and open the shared copy again.

## Notes

- Files saved by the program carry the version that made them. A copy that opens a file from a newer version
  warns first, so people on an old copy are alerted when they receive a newer file.
- There is deliberately no automatic update check: the program makes no network requests of its own, which the
  IT summary relies on. Adding one would need the IT summary updated first.
- Distribute only `watts-up.html` (see the deployment checklist in the IT summary), not the development folder.
