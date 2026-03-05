# Moodle Test Downloader (MTD)

A cross-browser extension that captures and saves Moodle test content before it becomes unavailable. The extension stores test data locally using IndexedDB, allowing students to review test questions and answers even after teachers restrict access.

**This extension does not collect any data.**

> **Note:** This project is under active development. Some features may be incomplete or subject to change.

## Features

- Automatic detection of Moodle test pages
- One-click test capture and save
- Local storage using IndexedDB
- Test preview before saving
- Persistent test archive with badge counter
- Cross-browser support (Chrome & Firefox)

## Browser Support

| Browser | Support Status | Manifest Version |
|---------|----------------|------------------|
| Firefox | Supported | Manifest V3 |
| Chrome | Supported | Manifest V3 |
| Edge | Not tested | Manifest V3 |
| Opera | Planned | Not yet implemented |

## Installation

### Build from source

```bash
git clone https://github.com/user/moodle_test_downloader.git
cd moodle_test_downloader
./build.sh
```

This creates two directories:
- `dist/chrome/` — ready-to-load Chrome extension
- `dist/firefox/` — ready-to-load Firefox extension

### Chrome / Edge

1. Run `./build.sh` Or Download it from `Release`
2. Open `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/chrome/` folder

### Firefox
#### From Firefox Add-ons (recommended)
1. Visit the [Moodle Test Downloader](https://addons.mozilla.org/firefox/addon/moodle-test-downloader/) page on Firefox Add-ons
2. Click "Add to Firefox"
3. Accept the permissions prompt

#### Firefox debugging
1. Run `./build.sh`
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select `manifest.json` inside the `dist/firefox/` folder

## Usage

1. Navigate to a Moodle test page that displays results
2. The extension automatically detects and captures the test content
3. Click the MTD icon in the toolbar to open the popup
4. Click **Preview** to view the captured test
5. Click **Save Test** to store it locally in IndexedDB
6. Use **Clear History** to remove all saved tests

## Technical Details

### Cross-browser Compatibility

A one-line polyfill at the top of each JS file normalises the API namespace:

```js
if (typeof browser === 'undefined') { globalThis.browser = chrome; }
```

- **Chrome** — uses `chrome.*` APIs (Promises in MV3) via the polyfill
- **Firefox** — uses native `browser.*` APIs (Promises)

### Storage

- **Pending captures** are persisted in `browser.storage.local` so they survive Chrome's service-worker restarts.
- **Saved tests** are stored in IndexedDB (`MoodleTest` database, `test` object store) with: name, subject, HTML content, and creation timestamp.

### Permissions

| Permission | Reason |
|------------|--------|
| `storage`  | Persist pending test data across service-worker restarts |

## Limitations

- Only works on tests whose results are currently visible
- Cannot access or download hidden / locked tests
- The test page must be displayed at least once while the extension is active

## Contributing

Contributions, bug reports, and feature requests are welcome.

## Disclaimer

This tool is intended for legitimate educational review purposes only. Users are responsible for complying with their institution's academic integrity policies and terms of service.
