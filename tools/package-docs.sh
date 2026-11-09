#!/bin/bash
# Rebuilds everything derived from watts-up.html and the Markdown documents, for the current release:
#   1. the user guide embedded in watts-up.html   (tools/build-guide.py, needs: pip install markdown)
#   2. "Watts Up - User Guide.docx"               (tools/md2docx.py, needs: pip install python-docx)
#   3. the SHA-256 and size in section 9 of "Watts Up - IT Summary and Security Assessment.md" and its .docx
# Run it LAST, after every change to watts-up.html (the hash is of the finished file). Close the two .docx files in Word first.
# Usage:  bash tools/package-docs.sh            (version and date are read from watts-up.html)
#         bash tools/package-docs.sh 0.9.21 2026-11-12
cd "$(dirname "$0")/.." || exit 1
V=${1:-$(grep -o "APP_VERSION='[0-9.]*'" watts-up.html | head -1 | grep -o "[0-9.]*")}
D=${2:-$(grep -o "APP_RELEASE_DATE='[0-9-]*'" watts-up.html | head -1 | grep -o "[0-9-]*")}
[ -n "$V" ] && [ -n "$D" ] || { echo "could not read the version and date"; exit 1; }
TMP=$(mktemp -d)
GUIDE="Watts Up - User Guide.md"
IT="Watts Up - IT Summary and Security Assessment.md"

py -3 tools/build-guide.py || exit 1
sed -e "s/{{VERSION}}/$V/" -e "s/{{DATE}}/$D/" "$GUIDE" > "$TMP/guide_filled.md"
PYTHONIOENCODING=utf-8 py -3 tools/md2docx.py "$TMP/guide_filled.md" "Watts Up - User Guide.docx" "Watts Up — User Guide (v$V)" \
  || { echo "The guide .docx could not be written - is it open in Word?"; exit 1; }

SZ=$(stat -c %s watts-up.html)
H=$(sha256sum watts-up.html | cut -d' ' -f1)
LINE=$(grep -n "SHA-256 of the reviewed file" "$IT" | head -1 | cut -d: -f1)
OLDH=$(sed -n "$((LINE+1))p" "$IT" | tr -d ' `')
sed -i -E "${LINE}s/version [0-9.]+, [0-9,]+ bytes/version $V, $SZ bytes/" "$IT"
sed -i "s/$OLDH/$H/" "$IT"
PYTHONIOENCODING=utf-8 py -3 tools/md2docx.py "$IT" "Watts Up - IT Summary and Security Assessment.docx" \
  || { echo "The IT summary .docx could not be written - is it open in Word?"; exit 1; }
rm -rf "$TMP"
echo "version $V ($D), $SZ bytes, SHA-256 $H"
