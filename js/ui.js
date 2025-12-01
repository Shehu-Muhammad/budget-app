// js/ui.js
// small UI utilities for toasts / simple interactions
export function toast(msg, timeout = 2000) {
  const div = document.createElement('div');
  div.className = 'toast';
  div.innerText = msg;
  Object.assign(div.style, {
    position:'fixed',right:'16px',bottom:'16px',background:'#111',color:'#fff',padding:'8px 12px',borderRadius:'8px',zIndex:9999
  });
  document.body.appendChild(div);
  setTimeout(()=>div.remove(), timeout);
}

/* Add a small helper to persist settings (very tiny) */
export async function saveSettings(uid, settings, db) {
  // naive: put settings at users/{uid}/meta doc (not implemented yet in js)
  try {
    await db.collection('users').doc(uid).set({ settings }, { merge: true });
    toast('Saved');
  } catch (err) {
    toast('Save failed');
  }
}
