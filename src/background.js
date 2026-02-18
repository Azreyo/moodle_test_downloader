function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TestDB', 1);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;

      if(!db.objectStorageNames.contains("test")) {
        console.log("Database doesn't contain anything!")
        db.createObjectStore("test", {
          keyPath: "id",
          autoIncrement: true
        });
      }
    };

    request.onsuccess = function (event) {
      resolve(event.target.result);
    }

    request.onerror = function (event) {
      console.log("Error")
      resolve(event.target.result);
    }
  });
}

async function saveToDatabase(data) {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("test", "readWrite");
    const store = db.objectStore("test");

    const reqeust = store.add({
      name: data.name,
      subject: data.subject,
      html: data.html,
      createdAt: new Date()
    })
  })
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveTest") {
    saveToDatabase({
      name: request.name,
      subject: request.subject,
      html: request.html
    }).then(() => {
      console.log("Test saved successfully!");
      sendResponse({ success: true });
    }).catch((error) => {
      console.error("Error saving test:", error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true;
  }
});

openDatabase();