// js/auth.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/* ----- Sign up ----- */
const signupBtn = document.getElementById("signup-btn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    if (!email || !password) return alert("Enter email + password");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will redirect
    } catch (err) {
      alert(err.message);
    }
  });
}

/* ----- Login ----- */
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    if (!email || !password) return alert("Enter email + password");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // redirect to dashboard
      window.location = "dashboard.html";
    } catch (err) {
      alert(err.message);
    }
  });
}

/* ----- Logout ----- */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location = "login.html";
  });
}

/* ----- Auth state handling & page guards ----- */
onAuthStateChanged(auth, user => {
  const publicPages = ["index.html", "login.html", "signup.html", ""];
  const path = location.pathname.split("/").pop();

  // If user is logged in and on public page, send to dashboard
  if (user && publicPages.includes(path)) {
    if (path !== "dashboard.html") window.location = "dashboard.html";
  }

  // If user is NOT logged in and on protected page, send to login
  const protectedPages = ["dashboard.html", "add-transaction.html", "settings.html"];
  if (!user && protectedPages.includes(path)) {
    window.location = "login.html";
  }
});
