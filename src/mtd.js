async function preloadHTML() {
    const cssUrl = browser.runtime.getURL("/styles/stylizer.css");
    const response = await fetch(cssUrl);
    const cssText = await response.text();
    const testForm = document.querySelector('.questionflagsaveform');
    const preload = `
  <!DOCTYPE html>
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
  </html>
  `;
  return preload;
}

function isMoodle() {
  const cssLink = document.querySelector('link[rel="stylesheet"]');
  if (cssLink) {
    const href = cssLink.getAttribute('href');
    if (href.includes('yui-moodlesimple-min.css')) {
      return true;
    } else {
      return false;
    }
  }
}

(async () => {
  console.log("Extension active")
  if (isMoodle()) {
    console.log("Moodle detected");
    let testIsDone = document.querySelector('.quizreviewsummary');
    let testForm = document.querySelector('.questionflagsaveform');

    if (testForm && testIsDone){
            let testName = document.querySelector('.breadcrumb-item span').textContent;
            let testSubjectName = document.querySelector('.breadcrumb-item a').title;
            preload = await preloadHTML();
            if (preload) {
            console.log("Test found sending to background");
            browser.runtime.sendMessage({
                action: "captureTest",
                data: {
                    name: testName?.trim(),
                    subject: testSubjectName?.trim(),
                    html: preload
                }});
            } else {
                console.error("MTD: Failed to build HTML content");
            }
    }  else { 
        console.log("Test form not found or is not done!");
    }
  } else {
    console.log("Not a Moodle site")
  }
}) ();