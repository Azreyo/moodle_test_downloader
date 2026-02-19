document.addEventListener("DOMContentLoaded", () => {
const testList = document.getElementById("test-list");
const saveBtn = document.getElementById("save-btn");
const previewBtn = document.getElementById("preview-btn");
const clearBtn = document.getElementById("clear-btn");
let statusElement = document.getElementById("status");
let pendingTestData = null;

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Popup received message:", message);
  if (message.action === "sendPendingTest") {
    pendingTestData = message.data;
    sendResponse({ success: true });
  }
  return true;
});

browser.runtime.sendMessage({ action: "getPendingTest" })
  .then(response => {
    console.log("Got pending test response:", response);
    if (response && response.data) {
      pendingTestData = response.data;
      statusElement.textContent = "Test captured: " + response.data.name;
    }
  })
  .catch(err => console.log("No pending test:", err));

previewBtn.addEventListener("click", async () => {
  if (pendingTestData) {
    const win = window.open('', '_blank');
    win.document.write(pendingTestData.html);
  } else {
    alert("No test captured yet");
  }
});



saveBtn.addEventListener("click", async () => {
  try {
    const response = await browser.runtime.sendMessage({ action: "confirmSave" });
    if (response.success) {
      alert("Test saved to database!");
      saveBtn.disabled = true;
      saveBtn.textContent = "Save (No test captured)";
    } else {
      alert("Error: " + (response.error || "Could not save test"));
    }
  } catch (err) {
    console.error("Save failed:", err);
  }
});

clearBtn.addEventListener("click", async () => {
    await browser.storage.local.set({ saved: [] });
    testList.innerHTML = '<li style="font-style: italic;">No saved tests yet</li>';
  });
});
