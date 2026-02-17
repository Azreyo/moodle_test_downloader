// Update badge with the number of saved tests
function updateBadge() {
  browser.storage.local.get({ saved: [] }).then((data) => {
    const count = data.saved.length;
    if (count > 0) {
      browser.browserAction.setBadgeText({ text: count.toString() });
      browser.browserAction.setBadgeBackgroundColor({ color: "#cc0000" });
    } else {
      browser.browserAction.setBadgeText({ text: "" });
    }
  });
}

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "testPageDetected") {
    const pageUrl = message.url;

    browser.storage.local.get({ saved: [] }).then((data) => {
      const saved = data.saved;

      if (!saved.includes(pageUrl)) {
        saved.push(pageUrl);
        browser.storage.local.set({ saved }).then(() => {
          console.log("Saved new test URL:", pageUrl);

          // Update badge
          updateBadge();

          // download the HTML of the page
          if (sender.tab && sender.tab.id) {
            browser.tabs.executeScript(sender.tab.id, {
              code: "document.documentElement.outerHTML;"
            }).then((results) => {
              if (results && results[0]) {
                const htmlContent = results[0];
                const blob = new Blob([htmlContent], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                browser.downloads.download({
                  url,
                  filename: `MTD-${Date.now()}.html`,
                  saveAs: false
                });
              }
            });
          }
        });
      } else {
        updateBadge();
      }
    });
  }
});

updateBadge();
