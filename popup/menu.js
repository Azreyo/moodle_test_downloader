document.addEventListener("DOMContentLoaded", () => {
  const testList = document.getElementById("test-list");
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
