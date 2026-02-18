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

let pendingTest = null;

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveTest") {
    pendingTest = {
      name: request.name,
      subject: request.subject,
      html: request.html
    };
    console.log("Test data captured, waiting for user to save...");
    sendResponse({ success: true, pending: true });
    return true;
  }
  
  if (request.action === "confirmSave") {
    if (!pendingTest) {
      sendResponse({ success: false, error: "No test data to save" });
      return true;
    }
    
    saveToDatabase(pendingTest).then(() => {
      console.log("Test saved successfully to IndexedDB!");
      pendingTest = null;
      sendResponse({ success: true });
    }).catch((error) => {
      console.error("Error saving test:", error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true;
  }
  
  if (request.action === "getPendingTest") {
    sendResponse({ test: pendingTest });
    return true;
  }
});

openDatabase();