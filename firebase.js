<script type="module">
/* ===========================
   🔥 FIREBASE IMPORTS
=========================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
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

/* ===========================
   🔐 FIREBASE CONFIG
=========================== */
const firebaseConfig = {
  apiKey: "AIzaSyBMcir5UaGmJpyjwyHNdQAqPBTI15KKT",
  authDomain: "gain-trading.firebaseapp.com",
  projectId: "gain-trading",
  storageBucket: "gain-trading.appspot.com",
  messagingSenderId: "158325829948",
  appId: "1:158325829948:web:004921f55b11297c596e39"
};

/* ===========================
   🔥 INIT
=========================== */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* ===========================
   ✅ GOOGLE LOGIN (SAFE)
=========================== */
window.googleLogin = async () => {
  await signInWithRedirect(auth, provider);
};

/* ===========================
   🔁 HANDLE REDIRECT
=========================== */
getRedirectResult(auth).then(async (res) => {
  if (!res) return;

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
}).catch(console.error);

/* ===========================
   👤 USER DASHBOARD
=========================== */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  if (!location.pathname.includes("user.html")) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const d = snap.data();
  uname.innerText = d.name;
  uemail.innerText = d.email;
  balance.innerText = "₹" + d.balance;
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

    const s = await getDoc(doc(db, "users", u.uid));
    if (!s.exists() || s.data().role !== "admin") {
      alert("Admin only access");
      location.href = "user.html";
    }
  });
};

/* ===========================
   👥 LOAD USERS (ADMIN)
=========================== */
window.loadUsers = async () => {
  const box = document.getElementById("users");
  if (!box) return;

  box.innerHTML = "";
  const q = await getDocs(collection(db, "users"));

  q.forEach(d => {
    const u = d.data();
    box.innerHTML += `
      <div class="user-card">
        <b>${u.name}</b><br>
        ${u.email}<br>
        Role: ${u.role}<br>
        Balance:
        <input id="bal_${d.id}" type="number" value="${u.balance}">
        <button onclick="updateBalance('${d.id}')">Save</button>
      </div>
    `;
  });
};

/* ===========================
   💰 UPDATE BALANCE
=========================== */
window.updateBalance = async (uid) => {
  const val = document.getElementById("bal_" + uid).value;
  if (val === "") return alert("Enter balance");

  await setDoc(doc(db, "users", uid), {
    balance: Number(val)
  }, { merge: true });

  alert("Balance Updated");
};

/* ===========================
   🚪 LOGOUT
=========================== */
window.logout = async () => {
  await signOut(auth);
  location.href = "index.html";
};
</script>
