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
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureTest") {
    console.log("Background recieved:",message);
    pendingTest = message.data;
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
    console.log("Sending pending test to popup:", pendingTest); // Debug
    sendResponse({ success: true, data: pendingTest });
  }
});