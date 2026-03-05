// Cross-browser compatibility — Chrome uses chrome.*, Firefox uses browser.*
if (typeof browser === 'undefined') { globalThis.browser = chrome; }

async function updateBadge() {
  try {
    const tests = await getAllTests();
    const count = tests.length;
    if (count > 0) {
      await browser.action.setBadgeText({ text: count.toString() });
      await browser.action.setBadgeBackgroundColor({ color: "#cc0000" });
    } else {
      await browser.action.setBadgeText({ text: "" });
    }
  } catch (err) {
    console.error("MTD: Failed to update badge:", err);
  }
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
      if (!db.objectStoreNames.contains("test")) {
        console.log("MTD: Creating object store 'test'");
        db.createObjectStore("test", {
          keyPath: "id",
          autoIncrement: true
        });
      }
    };

    request.onsuccess = function (event) {
      dbInstance = event.target.result;
      dbInstance.onclose = () => { dbInstance = null; };
      console.log("MTD: Database opened successfully");
      resolve(dbInstance);
    };

    request.onerror = function (event) {
      console.error("MTD: Database error:", event.target.error);
      reject(event.target.error);
    };
  });
}

async function saveToDatabase(data) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("test", "readwrite");
    const store = transaction.objectStore("test");

    store.add({
      name: data.name,
      subject: data.subject,
      html: data.html,
      createdAt: new Date().toISOString()
    });

    transaction.oncomplete = () => {
      console.log("MTD: Test saved successfully");
      resolve();
    };

    transaction.onerror = (event) => {
      console.error("MTD: Transaction failed:", event.target.error);
      reject(event.target.error);
    };

    transaction.onabort = (event) => {
      console.error("MTD: Transaction aborted:", event.target.error);
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

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function getTestById(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("test", "readonly");
    const store = transaction.objectStore("test");
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function deleteTest(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("test", "readwrite");
    const store = transaction.objectStore("test");
    store.delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject(event.target.error);
  });
}

async function clearAllTests() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("test", "readwrite");
    const store = transaction.objectStore("test");
    store.clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject(event.target.error);
  });
}

async function setPendingTest(data) {
  await browser.storage.local.set({ pendingTest: data });
}

async function getPendingTest() {
  const result = await browser.storage.local.get('pendingTest');
  return result.pendingTest || null;
}

async function clearPendingTest() {
  await browser.storage.local.remove('pendingTest');
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureTest") {
    console.log("MTD: Background received capture request");
    setPendingTest(message.data).then(() => {
      sendResponse({ success: true });
      browser.runtime.sendMessage({
        action: "sendPendingTest",
        data: message.data
      }).catch(() => { });
    });
    return true;

  } else if (message.action === "getPendingTest") {
    getPendingTest().then(data => {
      sendResponse({ success: true, data: data });
    });
    return true;

  } else if (message.action === "confirmSave") {
    getPendingTest().then(async (data) => {
      if (data) {
        try {
          await saveToDatabase(data);
          await clearPendingTest();
          await updateBadge();
          sendResponse({ success: true });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      } else {
        sendResponse({ success: false, error: "No test to save" });
      }
    });
    return true;

  } else if (message.action === "getAllTests") {
    getAllTests().then(tests => {
      sendResponse({ success: true, tests: tests });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;

  } else if (message.action === "getTestById") {
    getTestById(message.id).then(test => {
      sendResponse({ success: true, test: test });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;

  } else if (message.action === "deleteTest") {
    deleteTest(message.id).then(async () => {
      await updateBadge();
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;

  } else if (message.action === "clearAllTests") {
    clearAllTests().then(async () => {
      await updateBadge();
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});