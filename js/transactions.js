// js/transactions.js
import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/* Save a transaction (used on add-transaction.html) */
const saveBtn = document.getElementById("saveTxBtn");
if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const type = document.getElementById("type").value;
    const amountRaw = document.getElementById("amount").value;
    const amount = Number(amountRaw);
    const category = document.getElementById("category").value.trim() || "Other";
    const note = document.getElementById("note").value || "";

    if (!amount || isNaN(amount)) return alert("Enter a valid amount");

    const user = auth.currentUser;
    if (!user) return alert("Not authenticated");

    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        type,
        amount,
        category,
        note,
        createdAt: serverTimestamp()
      });
      // quick feedback
      alert("Transaction saved");
      window.location = "dashboard.html";
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  });
}

/* Load transactions for dashboard */
export async function loadTransactionsAndTotals() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const listEl = document.getElementById("transactionList");
  if (!listEl) return;

  listEl.innerHTML = "";
  let income = 0;
  let expense = 0;

  snapshot.forEach(docSnap => {
    const t = docSnap.data();
    // show reasonable defaults if timestamp missing (serverTimestamp might be null briefly)
    const amount = Number(t.amount) || 0;
    const type = t.type || "expense";
    const category = t.category || "Other";
    const note = t.note || "";
    const id = docSnap.id;

    const li = document.createElement("li");
    li.className = "tx-row";
    li.innerHTML = `
      <div>
        <div class="tx-cat">${category}</div>
        <div class="tx-note">${note}</div>
      </div>
      <div style="text-align:right">
        <div class="tx-amt ${type === 'income' ? 'income' : 'expense'}">${type === 'income' ? '+' : '-'}$${amount.toFixed(2)}</div>
        <button class="link-btn" data-id="${id}">Delete</button>
      </div>
    `;

    listEl.appendChild(li);

    if (type === "income") income += amount;
    else expense += amount;
  });

  const incEl = document.getElementById("incomeTotal");
  const expEl = document.getElementById("expenseTotal");
  const balEl = document.getElementById("balanceTotal");
  if (incEl) incEl.innerText = "$" + income.toFixed(2);
  if (expEl) expEl.innerText = "$" + expense.toFixed(2);
  if (balEl) balEl.innerText = "$" + (income - expense).toFixed(2);

  // attach delete handlers
  document.querySelectorAll('.link-btn').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const id = e.target.dataset.id;
      if (!confirm('Delete this transaction?')) return;
      try {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "transactions", id));
        // refresh
        loadTransactionsAndTotals();
      } catch(err){
        alert("Delete error: "+err.message);
      }
    })
  });
}

/* Hook to auth state so dashboard loads once user is ready */
onAuthStateChanged(auth, user => {
  // automatically load when authenticated and on dashboard
  if (user && location.pathname.split('/').pop() === 'dashboard.html') {
    loadTransactionsAndTotals();
  }
});
