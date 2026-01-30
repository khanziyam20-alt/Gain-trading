import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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

/* 🔥 FIREBASE CONFIG (तुम्हारा) */
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

/* ✅ GOOGLE LOGIN — WINDOW PE EXPOSE */
window.googleLogin = async () => {
  try {
    const res = await signInWithPopup(auth, provider);
    const u = res.user;

    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        name: u.displayName,
        email: u.email,
        balance: 0,
        role: "user",
        createdAt: Date.now()
      });
    }

    location.href = "user.html";
  } catch (e) {
    alert(e.message);
  }
};

/* 👤 USER PAGE DATA */
onAuthStateChanged(auth, async (u) => {
  if (!u) return;

  const snap = await getDoc(doc(db, "users", u.uid));
  if (!snap.exists()) return;

  const d = snap.data();
  if (document.getElementById("uname")) {
    uname.innerText = d.name;
    uemail.innerText = d.email;
    balance.innerText = d.balance;
  }
});

/* 🔐 ADMIN GUARD */
window.guardAdmin = () => {
  onAuthStateChanged(auth, async (u) => {
    if (!u) return location.href = "index.html";
    const s = await getDoc(doc(db, "users", u.uid));
    if (s.data().role !== "admin") {
      alert("Admin only");
      location.href = "user.html";
    }
  });
};

/* 👥 LOAD USERS */
window.loadUsers = async () => {
  const q = await getDocs(collection(db, "users"));
  const box = document.getElementById("users");
  box.innerHTML = "";
  q.forEach(d => {
    const u = d.data();
    box.innerHTML += `<div>${u.name} | ${u.email} | ₹${u.balance}</div>`;
  });
};

window.logout = async () => {
  await signOut(auth);
  location.href = "index.html";
};
