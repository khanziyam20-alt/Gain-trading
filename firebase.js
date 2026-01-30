// 🔥 Firebase SDKs
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

/* 🔐 FIREBASE CONFIG (tumhara real wala) */
const firebaseConfig = {
  apiKey: "AIzaSyBMcir5UaGmJpyjwyHNdQAqPBTI15KKT",
  authDomain: "gain-trading.firebaseapp.com",
  projectId: "gain-trading",
  storageBucket: "gain-trading.appspot.com",
  messagingSenderId: "158325829948",
  appId: "1:158325829948:web:004921f55b11297c596e39"
};

/* 🔥 INIT */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* ===========================
   ✅ GOOGLE LOGIN
=========================== */
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
  } catch (e) {
    alert(e.message);
  }
};

/* ===========================
   👤 USER DASHBOARD
=========================== */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const d = snap.data();

  if (document.getElementById("uname")) {
    uname.innerText = d.name;
    uemail.innerText = d.email;
    balance.innerText = "₹" + d.balance;
  }
});

/* ===========================
   🔐 ADMIN GUARD
=========================== */
window.guardAdmin = () => {
  onAuthStateChanged(auth, async (u) => {
    if (!u) {
      location.href = "index.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", u.uid));
    if (!snap.exists() || snap.data().role !== "admin") {
      alert("Admin only access");
      location.href = "user.html";
    }
  });
};

/* ===========================
   👥 ADMIN LOAD USERS
=========================== */
window.loadUsers = async () => {
  const box = document.getElementById("users");
  if (!box) return;

  box.innerHTML = "";

  const q = await getDocs(collection(db, "users"));
  q.forEach(d => {
    const u = d.data();

    box.innerHTML += `
      <div class="card">
        <b>${u.name}</b><br>
        ${u.email}<br>
        Role: ${u.role}<br>
        Balance:
        <input id="bal_${d.id}" type="number" value="${u.balance}">
        <button class="save" onclick="updateBalance('${d.id}')">Save</button>
      </div>
    `;
  });
};

/* ===========================
   💰 UPDATE BALANCE (ADMIN)
=========================== */
window.updateBalance = async (uid) => {
  const input = document.getElementById("bal_" + uid);
  if (!input) return;

  const val = input.value;
  if (val === "") {
    alert("Enter balance");
    return;
  }

  await setDoc(
    doc(db, "users", uid),
    { balance: Number(val) },
    { merge: true }
  );

  alert("Balance Updated");
};

/* ===========================
   🚪 LOGOUT
=========================== */
window.logout = async () => {
  await signOut(auth);
  location.href = "index.html";
};
