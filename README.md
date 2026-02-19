# Moodle Test Downloader (MTD)
The project is still in early development. Some features may not work properly, or they may not make total sense.
A browser extension that captures and saves Moodle test content before it becomes unavailable. The extension stores test data locally using IndexedDB, allowing students to review test questions and answers even after teachers restrict access.

## Project Status

This project is currently under active development. Some features may be incomplete or subject to change.

## Features

- Automatic detection of Moodle test pages
- One-click test capture functionality
- Local storage using IndexedDB
- Test preview before saving
- Persistent test archive

## Browser Support

| Browser | Support Status | Manifest Version |
|---------|----------------|------------------|
| Firefox | Supported | Manifest V2 |
| Chrome | Planned | Not yet implemented |
| Edge | Planned | Not yet implemented |
| Opera | Planned | Not yet implemented |

## Installation

### Firefox

#### From Firefox Add-ons (recommended) *(awaiting review)*
1. Visit the [Moodle Test Downloader](https://addons.mozilla.org/firefox/addon/moodle-test-downloader/) page on Firefox Add-ons
2. Click "Add to Firefox"
3. Accept the permissions prompt

#### Manual Installation
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` or `mtd-1.0.js` file from the downloaded repository

### Chrome/Chromium (Not yet supported)

Support for Chromium-based browsers is planned for future.

## Usage

1. Navigate to a Moodle test page that displays results
2. Click the MTD extension icon in your browser toolbar
3. The extension will automatically detect and capture the test content
4. Click "Preview" to view the captured test data
5. Click "Save Test" to store the test in your local database
6. Use "Clear" to remove saved tests from storage

## Technical Details

### Storage

Tests are stored locally in the browser using IndexedDB. The database schema includes:
- Test name
- Subject
- HTML content
- Creation timestamp

### Permissions

The extension requires the following permissions:
- `storage` - For local test data storage
- `tabs` - For accessing active tab information
- `notifications` - For user notifications
- `downloads` - For potential future export functionality

## Limitations

- Only works on tests that are publicly visible
- Cannot access or download hidden tests
- Requires the test to be displayed at least once while the extension is active


### Contributing

This project is in early development. Contributions, bug reports, and feature requests are welcome.


## Disclaimer

This tool is intended for legitimate educational review purposes only. Users are responsible for complying with their institution's academic integrity policies and terms of service.
