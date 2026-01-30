// 🔥 Firebase Imports
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
  updateDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔐 Firebase Config */
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
window.googleLogin = () => signInWithRedirect(auth, provider);

/* 🔁 REDIRECT RESULT */
getRedirectResult(auth).then(async (res)=>{
  if(!res) return;
  const u = res.user;
  const ref = doc(db,"users",u.uid);
  const snap = await getDoc(ref);

  if(!snap.exists()){
    await setDoc(ref,{
      name:u.displayName,
      email:u.email,
      role:"user",
      balance:1000,       // 🔥 starting demo balance
      profit:0,
      createdAt:Date.now()
    });
  }
  location.href="user.html";
});

/* 👤 USER PAGE */
onAuthStateChanged(auth, async (u)=>{
  if(!u) return;
  if(!location.pathname.includes("user.html")) return;

  const snap = await getDoc(doc(db,"users",u.uid));
  if(!snap.exists()) return;

  const d=snap.data();
  uname.innerText=d.name;
  uemail.innerText=d.email;
  balance.innerText="₹"+d.balance;
  profit.innerText="₹"+d.profit;
});

/* 📈 TRADING LOGIC (FAKE DEMO) */
window.startTrading = async ()=>{
  onAuthStateChanged(auth, async (u)=>{
    if(!u) return;

    const ref=doc(db,"users",u.uid);
    const snap=await getDoc(ref);
    if(!snap.exists()) return;

    let bal=snap.data().balance;
    let p=Math.floor(bal*0.01); // 1% profit
    let newBal=bal+p;

    await updateDoc(ref,{
      balance:newBal,
      profit:(snap.data().profit||0)+p
    });

    await addDoc(collection(db,"transactions"),{
      uid:u.uid,
      amount:p,
      type:"profit",
      time:serverTimestamp()
    });

    alert("Trading profit added");
    location.reload();
  });
};

/* 🔐 ADMIN GUARD */
window.guardAdmin=()=>{
  onAuthStateChanged(auth, async(u)=>{
    if(!u) return location.href="index.html";
    const s=await getDoc(doc(db,"users",u.uid));
    if(s.data().role!=="admin"){
      alert("Admin only");
      location.href="user.html";
    }
  });
};

/* 👥 ADMIN USERS */
window.loadUsers=async()=>{
  const box=document.getElementById("users");
  box.innerHTML="";
  const q=await getDocs(collection(db,"users"));
  q.forEach(d=>{
    const u=d.data();
    box.innerHTML+=`
      <div style="background:#0f172a;padding:12px;margin:10px;border-radius:10px">
        <b>${u.name}</b><br>
        ${u.email}<br>
        Balance: ₹${u.balance}<br>
        Profit: ₹${u.profit||0}
      </div>`;
  });
};

/* 🚪 LOGOUT */
window.logout=async()=>{
  await signOut(auth);
  location.href="index.html";
};
