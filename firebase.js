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

/* 🔥 REAL Firebase Config */
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

/* ✅ GOOGLE LOGIN */
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
        role: "user",
        balance: 0,
        createdAt: Date.now()
      });
    }
    location.href = "user.html";
  } catch (err) {
    alert(err.message);
  }
};

/* 👤 USER DASHBOARD */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const d = snap.data();
  if (document.getElementById("uname")) {
    document.getElementById("uname").innerText = d.name;
    document.getElementById("uemail").innerText = d.email;
    document.getElementById("balance").innerText = "₹" + d.balance;
  }
});

/* 🚪 LOGOUT */
window.logout = async () => {
  await signOut(auth);
  location.href = "index.html";
};

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

/* 👥 ADMIN LOAD USERS */
window.loadUsers = async () => {
  const q = await getDocs(collection(db, "users"));
  const list = document.getElementById("users");
  list.innerHTML = "";
  q.forEach(d => {
    const u = d.data();
    list.innerHTML += `<li>${u.name} | ${u.email} | ₹${u.balance}</li>`;
  });
};
