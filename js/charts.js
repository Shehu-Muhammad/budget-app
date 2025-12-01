// js/charts.js
import { auth, db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

async function drawCategoryChart() {
  const canvas = document.getElementById("categoryChart");
  if (!canvas) return;

  const user = auth.currentUser;
  if (!user) return;

  const snapshot = await getDocs(collection(db, "users", user.uid, "transactions"));
  const totals = {};
  snapshot.forEach(s => {
    const d = s.data();
    if (!d) return;
    if (d.type !== "expense") return;
    const cat = d.category || "Other";
    totals[cat] = (totals[cat] || 0) + (Number(d.amount) || 0);
  });

  const labels = Object.keys(totals);
  const data = Object.values(totals);
  // simple color generator
  const colors = labels.map((_, i) => `hsl(${(i*47)%360} 65% 55%)`);

  // destroy previous chart if exists
  if (window._categoryChart) {
    window._categoryChart.destroy();
  }

  window._categoryChart = new Chart(canvas, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: colors }] },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
}

onAuthStateChanged(auth, user => {
  if (user && location.pathname.split('/').pop() === 'dashboard.html') {
    drawCategoryChart();
    // redraw when data changes would be ideal (onSnapshot), but getDocs is simple for MVP
  }
});
