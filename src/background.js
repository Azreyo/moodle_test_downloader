let pendingTestData = null;

function updateBadge() {
  browser.storage.local.get({ saved: [] }).then((data) => {
    const count = data.saved.length;
    if (count > 0) {
      browser.browserAction.setBadgeText({ text: count.toString() });
      browser.browserAction.setBadgeBackgroundColor({ color: "#cc0000"});
    } else {
      browser.browserAction.setBadgeText({ text: ""});
    }
  });
}

let dbInstance = null;
function openDatabase() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MoodleTest', 1);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;

      if(!db.objectStoreNames.contains("test")) {
        console.log("Creating object store 'test'");
        db.createObjectStore("test", {
          keyPath: "id",
          autoIncrement: true
        });
      }
    };

    request.onsuccess = function (event) {
      dbInstance = event.target.result;
      console.log("Database opened successfully");
      resolve(dbInstance);
    }

    request.onerror = function (event) {
      console.error("Database error:", event.target.error);
      reject(event.target.error);
    }
  });
}

async function saveToDatabase(data) {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("test", "readwrite");
    const store = transaction.objectStore("test");

    const request = store.add({
      name: data.name,
      subject: data.subject,
      html: data.html,
      createdAt: new Date()
    });

    request.onerror = (event) => {
      console.error("Request error:", event.target.error);
      reject(event.target.error);
    };

    transaction.oncomplete = () => {
      console.log("Transaction completed successfully");
      resolve();
    };
    
    transaction.onerror = (event) => {
      console.error("Transaction failed:", event.target.error);
      reject(event.target.error);
    };
    
    transaction.onabort = (event) => {
      console.error("Transaction aborted:", event.target.error);
      reject(new Error("Transaction aborted"));
    };
  });
}

async function getAllTests() {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("test", "readonly");
    const store = transaction.objectStore("test");
    const request = store.getAll();

    request.onsuccess = () => {
      console.log("Retrieved all tests:", request.result);
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Error retrieving tests:", event.target.error);
      reject(event.target.error);
    };
  });
}

async function getTestById(id) {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("test", "readonly");
    const store = transaction.objectStore("test");
    const request = store.get(id);

    request.onsuccess = () => {
      console.log("Retrieved test:", request.result);
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Error retrieving test:", event.target.error);
      reject(event.target.error);
    };
  });
}

async function deleteTest(id) {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("test", "readwrite");
    const store = transaction.objectStore("test");
    const request = store.delete(id);

    request.onerror = (event) => {
      console.error("Error deleting test:", event.target.error);
      reject(event.target.error);
    };

    transaction.oncomplete = () => {
      console.log("Test deleted successfully");
      resolve();
    };
    
    transaction.onerror = (event) => {
      console.error("Transaction failed:", event.target.error);
      reject(event.target.error);
    };
  });
}

async function clearAllTests() {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("test", "readwrite");
    const store = transaction.objectStore("test");
    const request = store.clear();

    request.onerror = (event) => {
      console.error("Error clearing tests:", event.target.error);
      reject(event.target.error);
    };

    transaction.oncomplete = () => {
      console.log("All tests cleared successfully");
      resolve();
    };
    
    transaction.onerror = (event) => {
      console.error("Transaction failed:", event.target.error);
      reject(event.target.error);
    };
  });
}
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureTest") {
    console.log("Background recieved:",message);
    pendingTestData = message.data;
    sendResponse({ success: true });
    browser.runtime.sendMessage({
      action: "sendPendingTest",
      data: {
        name: message.data.name,
        subject: message.data.subject,
        html: message.data.html
      }
    }).catch(err => {
      console.log("Could not send to popup (popup may be closed):", err.message);
    });
  } else if (message.action === "getPendingTest") { 
    console.log("Sending pending test to popup:", pendingTestData);
    sendResponse({ success: true, data: pendingTestData});
  } else if (message.action === "confirmSave") {
    if (pendingTestData) {
      saveToDatabase(pendingTestData)
        .then(() => {
          console.log("Test saved successfully");
          pendingTestData = null;
          updateBadge();
          sendResponse({ success: true });
        })
        .catch(err => {
          console.error("Save failed:", err);
          sendResponse({ success: false, error: err.message });
        });
      return true;
    } else {
      sendResponse({ success: false, error: "No test to save" });
    }
  } else if (message.action === "getAllTests") {
    getAllTests()
      .then(tests => {
        sendResponse({ success: true, tests: tests });
      })
      .catch(err => {
        console.error("Failed to get tests:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  } else if (message.action === "getTestById") {
    getTestById(message.id)
      .then(test => {
        sendResponse({ success: true, test: test });
      })
      .catch(err => {
        console.error("Failed to get test:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  } else if (message.action === "deleteTest") {
    deleteTest(message.id)
      .then(() => {
        updateBadge();
        sendResponse({ success: true });
      })
      .catch(err => {
        console.error("Failed to delete test:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  } else if (message.action === "clearAllTests") {
    clearAllTests()
      .then(() => {
        updateBadge();
        sendResponse({ success: true });
      })
      .catch(err => {
        console.error("Failed to clear tests:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }
});