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
    statusElement.textContent = "Test captured: " + message.data.name;
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Test";
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
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Test";
    } else {
      statusElement.textContent = "No test captured";
      saveBtn.disabled = true;
      saveBtn.textContent = "Save (No test)";
    }
  })
  .catch(err => {
    console.log("No pending test:", err);
    statusElement.textContent = "No test captured";
    saveBtn.disabled = true;
    saveBtn.textContent = "Save (No test)";
  });

function loadTests() {
  browser.runtime.sendMessage({ action: "getAllTests" })
    .then(response => {
      if (response.success && response.tests) {
        displayTests(response.tests);
      }
    })
    .catch(err => console.error("Failed to load tests:", err));
}

function displayTests(tests) {
  testList.innerHTML = "";
  if (tests.length === 0) {
    testList.innerHTML = '<li style="font-style: italic; cursor: default;">No saved tests yet</li>';
    return;
  }
  
  tests.forEach(test => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1;">
          <strong>${test.name}</strong><br>
          <small style="color: #718096;">${test.subject} • ${new Date(test.createdAt).toLocaleDateString()}</small>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="view-btn" data-id="${test.id}" style="padding: 4px 12px; font-size: 12px; background: #4299e1; color: white;">View</button>
          <button class="delete-btn" data-id="${test.id}" style="padding: 4px 12px; font-size: 12px; background: #e53e3e; color: white;">Delete</button>
        </div>
      </div>
    `;
    testList.appendChild(li);
  });
  
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      viewTest(id);
    });
  });
  
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      deleteTest(id);
    });
  });
}

function viewTest(id) {
  browser.runtime.sendMessage({ action: "getTestById", id: id })
    .then(response => {
      if (response.success && response.test) {
        const win = window.open('', '_blank');
        win.document.write(response.test.html);
      }
    })
    .catch(err => console.error("Failed to view test:", err));
}

function deleteTest(id) {
  if (confirm("Are you sure you want to delete this test?")) {
    browser.runtime.sendMessage({ action: "deleteTest", id: id })
      .then(response => {
        if (response.success) {
          loadTests();
        }
      })
      .catch(err => console.error("Failed to delete test:", err));
  }
}

loadTests();

previewBtn.addEventListener("click", async () => {
  if (pendingTestData) {
    const win = window.open('', '_blank');
    win.document.write(pendingTestData.html);
  } else {
    alert("No test captured yet");
  }
});



saveBtn.addEventListener("click", async () => {
  if (!pendingTestData) {
    alert("No test to save");
    return;
  }
  
  try {
    const response = await browser.runtime.sendMessage({ action: "confirmSave" });
    if (response.success) {
      alert("Test saved to database!");
      pendingTestData = null;
      statusElement.textContent = "No test captured";
      saveBtn.disabled = true;
      saveBtn.textContent = "Save (No test)";
      loadTests();
    } else {
      alert("Error: " + (response.error || "Could not save test"));
    }
  } catch (err) {
    console.error("Save failed:", err);
    alert("Save failed: " + err.message);
  }
});

clearBtn.addEventListener("click", async () => {
  if (confirm("Are you sure you want to clear all saved tests?")) {
    try {
      const response = await browser.runtime.sendMessage({ action: "clearAllTests" });
      if (response.success) {
        loadTests();
        alert("All tests cleared");
      }
    } catch (err) {
      console.error("Failed to clear tests:", err);
    }
  }
});
});
