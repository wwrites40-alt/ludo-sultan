/* LUDO SULTAN Firebase Authentication (email/password). */
(function () {
  let mode = "login";
  let authListenerStarted = false;

  function message(text, isError = false) {
    const el = document.getElementById("authMessage");
    if (!el) return;
    el.hidden = false;
    el.textContent = text;
    el.style.background = isError ? "#4b1717" : "#183c27";
  }
  function clearMessage() { const el = document.getElementById("authMessage"); if (el) { el.hidden = true; el.textContent = ""; } }
  function friendlyError(error) {
    const code = error && error.code;
    const messages = {
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/user-not-found": "No account found for this email. Create an account first.",
      "auth/wrong-password": "Incorrect email or password.",
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/email-already-in-use": "This email already has an account. Please log in.",
      "auth/weak-password": "Choose a stronger password with at least 6 characters.",
      "auth/too-many-requests": "Too many attempts. Wait a while and try again.",
      "auth/network-request-failed": "Network error. Check your internet connection.",
      "auth/operation-not-allowed": "Enable Email/Password sign-in in Firebase Console.",
      "auth/unauthorized-domain": "Add this website domain to Firebase Authentication authorized domains."
    };
    return messages[code] || (error && error.message) || "Something went wrong. Please try again.";
  }
  function setMode(next) {
    mode = next; clearMessage();
    document.getElementById("authTitle").textContent = next === "signup" ? "👑 CREATE LUDO SULTAN ACCOUNT" : "👑 LUDO SULTAN LOGIN";
    document.getElementById("authSubmit").textContent = next === "signup" ? "CREATE ACCOUNT" : "LOGIN";
    document.getElementById("authModeButton").textContent = next === "signup" ? "I ALREADY HAVE AN ACCOUNT" : "CREATE NEW ACCOUNT";
    document.getElementById("authConfirmWrap").hidden = next !== "signup";
    document.getElementById("authPassword").autocomplete = next === "signup" ? "new-password" : "current-password";
  }
  window.toggleAuthMode = function () { setMode(mode === "login" ? "signup" : "login"); };
  window.submitAuth = async function () {
    clearMessage();
    if (!window.ludoFirebaseReady || !window.ludoAuth) {
      message("Firebase setup is not complete. Add your Web App config to firebase.js and enable Email/Password sign-in in Firebase Console.", true); return;
    }
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const confirm = document.getElementById("authConfirm").value;
    if (!email || !password) { message("Enter your email and password.", true); return; }
    if (password.length < 6) { message("Password must be at least 6 characters.", true); return; }
    if (mode === "signup" && password !== confirm) { message("Passwords do not match.", true); return; }
    const button = document.getElementById("authSubmit");
    button.disabled = true; button.textContent = "PLEASE WAIT…";
    try {
      if (mode === "signup") {
        const result = await window.ludoAuth.createUserWithEmailAndPassword(email, password);
        try { await result.user.sendEmailVerification(); message("Account created. A verification email was sent if supported. Check your inbox."); } catch (_) {}
      } else {
        await window.ludoAuth.signInWithEmailAndPassword(email, password);
      }
    } catch (error) { message(friendlyError(error), true); }
    finally { button.disabled = false; button.textContent = mode === "signup" ? "CREATE ACCOUNT" : "LOGIN"; }
  };
  window.resetPassword = async function () {
    clearMessage();
    if (!window.ludoFirebaseReady || !window.ludoAuth) { message("Finish Firebase setup first.", true); return; }
    const email = document.getElementById("authEmail").value.trim();
    if (!email) { message("Enter your email address first, then tap Forgot Password.", true); return; }
    try { await window.ludoAuth.sendPasswordResetEmail(email); message("If an account exists for this email, a password-reset email has been sent."); }
    catch (error) { message(friendlyError(error), true); }
  };
  window.logoutUser = async function () {
    if (window.ludoAuth) { try { await window.ludoAuth.signOut(); } catch (error) { alert(friendlyError(error)); } }
  };
  function showAuthScreen() {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById("authScreen").classList.add("active");
    document.getElementById("accountBar").hidden = true;
    document.getElementById("coins").parentElement.style.display = "none";
  }
  function showApp(user) {
    document.getElementById("authScreen").classList.remove("active");
    document.getElementById("accountBar").hidden = false;
    document.getElementById("accountEmail").textContent = user.email || "Signed in";
    document.getElementById("coins").parentElement.style.display = "block";
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById("home").classList.add("active");
    if (typeof window.showCoins === "function") window.showCoins();
  }
  function startListener() {
    if (authListenerStarted) return; authListenerStarted = true;
    if (!window.ludoFirebaseReady || !window.ludoAuth) { showAuthScreen(); message("Firebase is not configured yet. Complete the setup steps before signup/login can work.", true); return; }
    window.ludoAuth.onAuthStateChanged(user => user ? showApp(user) : showAuthScreen());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startListener); else startListener();
})();
