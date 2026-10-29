/* LUDO SULTAN Firebase setup. Replace every placeholder with your Firebase Web App config. */
(function () {
  const firebaseConfig = {
    apiKey: "PASTE_API_KEY_HERE",
    authDomain: "PASTE_PROJECT_ID_HERE.firebaseapp.com",
    projectId: "PASTE_PROJECT_ID_HERE",
    storageBucket: "PASTE_PROJECT_ID_HERE.firebasestorage.app",
    messagingSenderId: "PASTE_MESSAGING_SENDER_ID_HERE",
    appId: "PASTE_APP_ID_HERE"
  };

  if (!window.firebase) {
    console.error("Firebase SDK did not load. Check internet access.");
    window.ludoFirebaseReady = false;
    return;
  }
  if (firebaseConfig.apiKey === "PASTE_API_KEY_HERE" || firebaseConfig.projectId === "PASTE_PROJECT_ID_HERE") {
    console.warn("Firebase config is not set yet. Add your Firebase Web App config in firebase.js.");
    window.ludoFirebaseReady = false;
    return;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window.ludoAuth = firebase.auth();
    window.ludoFirebaseReady = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    window.ludoFirebaseReady = false;
  }
})();
