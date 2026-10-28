import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOFL6dKvw_RfyKMe3QQgvE4lt7Gtc4yaM",
  authDomain: "bangla-ff-admin.firebaseapp.com",
  databaseURL: "https://bangla-ff-admin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bangla-ff-admin",
  storageBucket: "bangla-ff-admin.firebasestorage.app",
  messagingSenderId: "295013484465",
  appId: "1:295013484465:web:b6bc2a949e239095761f90"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== 1. GLOBAL DISCORD LINK =====
onValue(ref(db, 'global_settings/discord_link'), (snap) => {
  if (snap.exists()) {
    const link = snap.val();
    localStorage.setItem('kgff_discord_link', link);
    document.querySelectorAll('.dynamic-discord, [data-global-link="discord"]').forEach(el => {
      el.href = link;
    });
  }
});

// ===== 2. GLOBAL TOPUP LINK =====
onValue(ref(db, 'global_settings/topup_link'), (snap) => {
  if (snap.exists()) {
    const link = snap.val();
    localStorage.setItem('kgff_topup_link', link);
    document.querySelectorAll('.dynamic-topup, [data-global-link="topup"]').forEach(el => {
      el.href = link;
    });
  }
});

// ===== 3. VIDEOS =====
onValue(ref(db, 'global_settings/videos'), (snap) => {
  if (snap.exists()) {
    const v = snap.val();
    if (v.free_panel) localStorage.setItem('kgff_free_panel_video', v.free_panel);
    if (v.free_bypass) localStorage.setItem('kgff_free_bypass_video', v.free_bypass);
    if (v.emulator) localStorage.setItem('kgff_emulator_video', v.emulator);
  }
});

// ===== 4. RAR PASSWORD =====
onValue(ref(db, 'global_settings/rar_password'), (snap) => {
  if (snap.exists()) {
    localStorage.setItem('kgff_rar_password', snap.val());
    const el = document.getElementById('rar-pwd') || document.getElementById('rar-password-display');
    if (el) el.innerText = snap.val();
  }
});

// ===== 5. HOW TO SKIP =====
onValue(ref(db, 'global_settings/how_to_skip'), (snap) => {
  if (snap.exists()) {
    localStorage.setItem('kgff_how_to_skip', snap.val());
    const el = document.getElementById('skip-link') || document.getElementById('how-to-skip-btn');
    if (el) el.href = snap.val();
  }
});

// ===== 6. CATEGORY VISIBILITY =====
const keys = ['free_panel', 'free_bypass', 'emulator', 'apk', 'pc_panel', 'mobile_panel'];

keys.forEach(key => {
  onValue(ref(db, `site_visibility/${key}`), (snap) => {
    const isVisible = !snap.exists() || snap.val() === true;
    const card = document.getElementById(`card_${key}`);
    if (card) {
      if (isVisible) card.classList.add('visible');
      else card.classList.remove('visible');
    }
  });

  // Title + Icon from admin
  onValue(ref(db, `site_settings/categories/${key}`), (snap) => {
    if (snap.exists()) {
      const data = snap.val();
      if (data.title) {
        const titleEl = document.getElementById(`title_${key}`);
        if (titleEl) titleEl.innerText = data.title;
      }
      const iconDiv = document.getElementById(`icon_${key}`);
      if (iconDiv && data.iconValue) renderIcon(iconDiv, data);
    }
  });
});

function renderIcon(iconDiv, data) {
  const val = (data.iconValue || '').trim();
  if (!val) return;
  if (data.iconType === 'image' || val.startsWith('http')) {
    iconDiv.innerHTML = `<img src="${val}" alt="icon">`;
  } else if (data.iconType === 'emoji' || (!val.includes('fa-') && !val.startsWith('http'))) {
    iconDiv.innerHTML = `<span>${val}</span>`;
  } else {
    iconDiv.innerHTML = `<i class="${val}"></i>`;
  }
}
