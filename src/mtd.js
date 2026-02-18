testName = document.querySelector('.breadcrumb-item span').textContent;
testSubjectName = document.querySelector('.breadcrumb-item a').title;
testIsDone = document.querySelector('.quizreviewsummary');
testForm = document.querySelector('.questionflagsaveform');

if (testForm && testIsDone){
    preload = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>test</title><link rel="stylesheet" href="/styles/stylizer.css"></head><body>' + testForm.outerHTML +'</body></html>'
    console.log("Form found!")
    browser.runtime.sendMessage({
        action: "saveTest",
        name: testName?.trim(),
        subject: testSubjectName?.trim(),
        html: preload,
    });
}  else {
    console.log("Test form not found or is not done!");
}
