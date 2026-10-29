
/* LUDO SULTAN Firebase setup */
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyDMpLS2JMvvV1l2nTJYtge9RQZ9I29uwsQ",
    authDomain: "ludo-sultan-67d64.firebaseapp.com",
    projectId: "ludo-sultan-67d64",
    storageBucket: "ludo-sultan-67d64.firebasestorage.app",
    messagingSenderId: "618498678525",
    appId: "1:618498678525:web:d5c1814f322f0ae5a9e894",
    measurementId: "G-6GL04LDSKP"
  };

  if (!window.firebase) {
    console.error("Firebase SDK did not load.");
    window.ludoFirebaseReady = false;
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    window.ludoAuth = firebase.auth();
    window.ludoFirebaseReady = true;
    console.log("LUDO SULTAN Firebase ready");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    window.ludoFirebaseReady = false;
  }
})();
