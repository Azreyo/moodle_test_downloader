// Cross-browser compatibility — Chrome uses chrome.*, Firefox uses browser.*
if (typeof browser === 'undefined') { globalThis.browser = chrome; }

async function preloadHTML() {
  const cssUrl = browser.runtime.getURL("/styles/stylizer.css");
  const response = await fetch(cssUrl);
  const cssText = await response.text();
  const testForm = document.querySelector('.questionflagsaveform');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>test</title>
  <style>
    ${cssText}
  </style>
</head>
<body>
  ${testForm.outerHTML}
</body>
</html>`;
}

function isMoodle() {
  const cssLink = document.querySelector('link[rel="stylesheet"]');
  if (cssLink) {
    const href = cssLink.getAttribute('href');
    return href && href.includes('yui-moodlesimple-min.css');
  }
  return false;
}

(async () => {
  console.log("MTD: Extension active");
  if (isMoodle()) {
    console.log("MTD: Moodle detected");
    const testIsDone = document.querySelector('.quizreviewsummary');
    const testForm = document.querySelector('.questionflagsaveform');

    if (testForm && testIsDone) {
      const testName = document.querySelector('.breadcrumb-item span')?.textContent;
      const testSubjectName = document.querySelector('.breadcrumb-item a')?.title;
      const preload = await preloadHTML();
      if (preload) {
        console.log("MTD: Test found, sending to background");
        browser.runtime.sendMessage({
          action: "captureTest",
          data: {
            name: testName?.trim() || "Unknown Test",
            subject: testSubjectName?.trim() || "Unknown Subject",
            html: preload
          }
        });
      } else {
        console.error("MTD: Failed to build HTML content");
      }
    } else {
      console.log("MTD: Test form not found or test is not done");
    }
  } else {
    console.log("MTD: Not a Moodle site");
  }
})();