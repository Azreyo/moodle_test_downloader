document.addEventListener("DOMContentLoaded", () => {
  const testList = document.getElementById("test-list");
  const saveBtn = document.getElementById("save-btn");
  const previewBtn = document.getElementById("preview-btn");
  const clearBtn = document.getElementById("clear-btn");

  // Load saved tests from storage
  chrome.storage.local.get({ saved: [] }, (data) => {
    const savedTests = data.saved;
    if (savedTests.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No saved tests yet";
      li.style.fontStyle = "italic";
      testList.appendChild(li);
    } else {
      savedTests.forEach(url => {
        const li = document.createElement("li");
        li.textContent = url;
        li.addEventListener("click", () => {
          chrome.tabs.create({ url });
        });
        testList.appendChild(li);
      });
    }
  });

  browser.runtime.sendMessage({ action: "getPendingTest" }, (response) => {
    if (response.test) {
      saveBtn.disabled = false;
      saveBtn.textContent = `Save: ${response.test.name || 'Test'}`;
    } else {
      saveBtn.disabled = true;
      saveBtn.textContent = "Save (No test captured)";
    }
  });

  saveBtn.addEventListener("click", () => {
    browser.runtime.sendMessage({ action: "confirmSave" }, (response) => {
      if (response.success) {
        alert("Test saved to database!");
        saveBtn.disabled = true;
        saveBtn.textContent = "Save (No test captured)";
      } else {
        alert("Error: " + (response.error || "Could not save test"));
      }
    });
  });

  previewBtn.addEventListener("click", async () => {
    browser.runtime.sendMessage({ action: "getPendingTest" }, (response) => {

  if (response.test) {
    console.log("Received test:", response.test);
  } else {
    console.log("No test available");
  }

});

  })

  // Clear history
  clearBtn.addEventListener("click", () => {
    chrome.storage.local.set({ saved: [] }, () => {
      testList.innerHTML = "";
      const li = document.createElement("li");
      li.textContent = "No saved tests yet";
      li.style.fontStyle = "italic";
      testList.appendChild(li);
    });
  });
});

