#!/bin/bash
# Build script for MTD — creates Chrome and Firefox distributions
set -e

DIST_DIR="dist"
CHROME_DIR="$DIST_DIR/chrome"
FIREFOX_DIR="$DIST_DIR/firefox"

rm -rf "$DIST_DIR"

SHARED_FILES=(
  "src/background.js"
  "src/mtd.js"
  "popup/menu.html"
  "popup/menu.js"
  "popup/css/menu.css"
  "styles/stylizer.css"
  "LICENSE"
)

CHROME_ICONS=(
  "icons/logo-16.png"
  "icons/logo-32.png"
  "icons/logo-48.png"
  "icons/logo-128.png"
)

FIREFOX_ICONS=(
  "icons/logo.svg"
)

echo "Building Chrome extension..."
mkdir -p "$CHROME_DIR"
for file in "${SHARED_FILES[@]}" "${CHROME_ICONS[@]}"; do
  mkdir -p "$CHROME_DIR/$(dirname "$file")"
  cp "$file" "$CHROME_DIR/$file"
done
cp manifest.json "$CHROME_DIR/manifest.json"

echo "Building Firefox extension..."
mkdir -p "$FIREFOX_DIR"
for file in "${SHARED_FILES[@]}" "${FIREFOX_ICONS[@]}"; do
  mkdir -p "$FIREFOX_DIR/$(dirname "$file")"
  cp "$file" "$FIREFOX_DIR/$file"
done
cp manifest.firefox.json "$FIREFOX_DIR/manifest.json"

echo "Packaging ZIPs..."
(cd "$CHROME_DIR" && zip -r -q "../mtd-chrome.zip" .)
(cd "$FIREFOX_DIR" && zip -r -q "../mtd-firefox.zip" .)

echo ""
echo "Build complete!"
echo "  Chrome  → $CHROME_DIR/"
echo "  Firefox → $FIREFOX_DIR/"
echo ""
echo "  Chrome  ZIP → $DIST_DIR/mtd-chrome.zip"
echo "  Firefox ZIP → $DIST_DIR/mtd-firefox.zip"
echo ""
echo "To load unpacked in Chrome:"
echo "  1. Go to chrome://extensions"
echo "  2. Enable Developer mode"
echo "  3. Click 'Load unpacked' and select $CHROME_DIR/"
echo ""
echo "To load in Firefox:"
echo "  1. Go to about:debugging#/runtime/this-firefox"
echo "  2. Click 'Load Temporary Add-on'"
echo "  3. Select manifest.json in $FIREFOX_DIR/"
echo ""
echo "To submit to stores, upload the corresponding .zip file."
