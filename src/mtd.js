testName = document.querySelector('.breadcrumb-item span').textContent;
testSubjectName = document.querySelector('.breadcrumb-item a').title;
testIsDone = document.querySelector('.quizreviewsummary');
testForm = document.querySelector('.questionflagsaveform');

async function preloadHTML() {
    const cssUrl = browser.runtime.getURL("/styles/stylizer.css");
    const response = await fetch(cssUrl);
    const cssText = await response.text();
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

async function openWithInlineCSS() {
    const preload = await preloadHTML();
    const blob = new Blob([preload], {type: "text/html"});
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return preload;
}

if (testForm && testIsDone){
    preload = preloadHTML();

    browser.runtime.sendMessage({
        action: "CaptureTest",
        data: {
            name: testName,
            subject: testSubjectName,
            html: preload // TODO: i am stupid and cannot figure out the f error
        }
    })
}  else { 
    console.log("Test form not found or is not done!");
}
