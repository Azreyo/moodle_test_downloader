document.addEventListener("DOMContentLoaded", () => {
const testList = document.getElementById("test-list");
const saveBtn = document.getElementById("save-btn");
const previewBtn = document.getElementById("preview-btn");
const clearBtn = document.getElementById("clear-btn");
let statusElement = document.getElementById("status");


response = async () => { await browser.runtime.sendMessage({action: "captureTest"});
  if (response.success) {
    alert(response.data.html);
    statusElement.textContent = "Test Content Received";
    
  } else {
    statusElement.textContent = "No test found";
  }
}
previewBtn.addEventListener("click", async () => {
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
