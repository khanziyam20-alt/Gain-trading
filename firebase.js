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

/* 🔥 Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyBMicn5UaGmlpyjqyvHndQAqpBTIl5KKTs",
  authDomain: "gain-trading.firebaseapp.com",
  projectId: "gain-trading",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* ✅ GOOGLE LOGIN */
async function googleLogin(){
  try{
    const res = await signInWithPopup(auth, provider);
    const u = res.user;

    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);

    if(!snap.exists()){
      await setDoc(ref,{
        name: u.displayName,
        email: u.email,
        role: "user",
        balance: 0,
        createdAt: Date.now()
      });
    }

    window.location.href = "user.html";
  }catch(err){
    alert(err.message);
  }
}

/* 🔥 BUTTON FIX (THIS WAS MISSING) */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("googleBtn");
  if(btn){
    btn.addEventListener("click", googleLogin);
  }
});

/* 👤 USER PAGE DATA */
onAuthStateChanged(auth, async (user)=>{
  if(!user) return;

  const snap = await getDoc(doc(db,"users",user.uid));
  if(!snap.exists()) return;

  const d = snap.data();
  if(document.getElementById("uname")){
    uname.innerText = d.name;
    uemail.innerText = d.email;
    balance.innerText = d.balance;
  }
});

/* 🔐 ADMIN GUARD */
window.guardAdmin = ()=>{
  onAuthStateChanged(auth, async (u)=>{
    if(!u) return location.href="index.html";
    const s = await getDoc(doc(db,"users",u.uid));
    if(s.data().role!=="admin"){
      alert("Admin only");
      location.href="user.html";
    }
  });
};

/* 👥 ADMIN LOAD USERS */
window.loadUsers = async ()=>{
  const q = await getDocs(collection(db,"users"));
  const list = document.getElementById("users");
  list.innerHTML="";
  q.forEach(d=>{
    const u=d.data();
    list.innerHTML+=`
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>₹${u.balance}</td>
        <td>${u.role}</td>
      </tr>`;
  });
};

/* 🚪 LOGOUT */
window.logout = async ()=>{
  await signOut(auth);
  location.href="index.html";
};const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ===============================
// 🔐 GOOGLE LOGIN
// ===============================
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
        role: "user",     // बाद में admin बनाना हो तो Firebase से बदलना
        balance: 0,
        createdAt: Date.now()
      });
    }

    window.location.href = "user.html";
  } catch (e) {
    alert("Login failed");
    console.error(e);
  }
};

// ===============================
// 👤 USER DASHBOARD DATA
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const d = snap.data();

  if (document.getElementById("uname")) {
    document.getElementById("uname").innerText = d.name;
    document.getElementById("uemail").innerText = d.email;
    document.getElementById("balance").innerText = d.balance;
  }
});

// ===============================
// 🔐 ADMIN GUARD (admin.html में call करना)
// ===============================
window.guardAdmin = () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists() || snap.data().role !== "admin") {
      alert("Admin only access");
      location.href = "user.html";
    }
  });
};

// ===============================
// 👥 ADMIN: LOAD ALL USERS
// ===============================
window.loadUsers = async () => {
  const list = document.getElementById("users");
  list.innerHTML = "";

  const q = await getDocs(collection(db, "users"));
  q.forEach(docu => {
    const u = docu.data();
    list.innerHTML += `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>₹${u.balance}</td>
        <td>${u.role}</td>
      </tr>
    `;
  });
};

// ===============================
// ➕ ADMIN: UPDATE USER BALANCE
// ===============================
window.updateBalance = async (uid, amount) => {
  await updateDoc(doc(db, "users", uid), {
    balance: Number(amount)
  });
  alert("Balance updated");
  loadUsers();
};

// ===============================
// 🚪 LOGOUT
// ===============================
window.logout = async () => {
  await signOut(auth);
  location.href = "index.html";
};
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
