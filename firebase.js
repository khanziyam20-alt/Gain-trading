// 🔥 Firebase imports
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
  setDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔐 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBMicn5UaGmlpyjqyvHndQAqpBTIl5KKTs",
  authDomain: "gain-trading.firebaseapp.com",
  projectId: "gain-trading",
  storageBucket: "gain-trading.appspot.com",
  messagingSenderId: "158325829948",
  appId: "1:158325829948:web:004921f55b11297c596e39"
};

// 🔥 Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* =========================
   LOGIN (REDIRECT)
========================= */
window.googleLogin = () => {
  signInWithRedirect(auth, provider);
};

/* =========================
   AUTH STATE (SINGLE SOURCE)
========================= */
onAuthStateChanged(auth, async (user) => {
  // 🔹 LOGIN PAGE
  if (location.pathname.includes("index.html") || location.pathname === "/") {
    if (user) {
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

      location.href = "user.html";
    }
  }

  // 🔹 USER PAGE
  if (location.pathname.includes("user.html")) {
    if (!user) return location.href = "index.html";

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;

    uname.innerText = snap.data().name;
    uemail.innerText = snap.data().email;
    balance.innerText = "₹" + snap.data().balance;
  }
});

/* =========================
   ADMIN GUARD
========================= */
window.guardAdmin = () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return location.href = "index.html";

    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.data().role !== "admin") {
      alert("Admin only");
      location.href = "user.html";
    }
  });
};

/* =========================
   ADMIN LOAD USERS
========================= */
window.loadUsers = async () => {
  const box = document.getElementById("users");
  if (!box) return;

  box.innerHTML = "";
  const q = await getDocs(collection(db, "users"));

  q.forEach(d => {
    const u = d.data();
    box.innerHTML += `
      <div style="background:#0f172a;padding:12px;margin:8px;border-radius:10px">
        <b>${u.name}</b><br>
        ${u.email}<br>
        Balance: ₹${u.balance}
      </div>
    `;
  });
};

/* =========================
   LOGOUT
========================= */
window.logout = async () => {
  await signOut(auth);
  location.href = "index.html";
};
