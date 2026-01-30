import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔐 CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBMicn5UaGmlpyjqyvHndQAqpBTIl5KKTs",
  authDomain: "gain-trading.firebaseapp.com",
  projectId: "gain-trading",
  storageBucket: "gain-trading.appspot.com",
  messagingSenderId: "158325829948",
  appId: "1:158325829948:web:004921f55b11297c596e39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* 🔐 LOGIN */
window.googleLogin = () => {
  signInWithRedirect(auth, provider);
};

/* 🔒 SINGLE AUTH DECISION (NO LOOP) */
onAuthStateChanged(auth, async (user) => {
  const path = location.pathname;

  // USER NOT LOGGED IN
  if (!user) {
    if (!path.endsWith("index.html") && path !== "/") {
      location.href = "index.html";
    }
    return;
  }

  // USER LOGGED IN → ensure DB
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName,
      email: user.email,
      role: "user",
      balance: 1000,
      createdAt: Date.now()
    });
  }

  // REDIRECT LOGIC (ONLY ONCE)
  if (path.endsWith("index.html") || path === "/") {
    location.href = "user.html";
  }

  // USER PAGE DATA
  if (path.endsWith("user.html")) {
    document.getElementById("uname").innerText = snap.data().name;
    document.getElementById("uemail").innerText = snap.data().email;
    document.getElementById("balance").innerText = "₹" + snap.data().balance;
  }
});

/* 🚪 LOGOUT */
window.logout = async () => {
  await signOut(auth);
  location.href = "index.html";
};
