// Maintenance Toggles
const freePanelMaintenance = false;
const freeBypassMaintenance = false;
const pcPaidMaintenance = false;
const mobilePaidMaintenance = false;

// Cloud REST DB Settings for 2-Repo Sync
const FIREBASE_REST_URL = localStorage.getItem('kgff_firebase_url') || "";

document.addEventListener('DOMContentLoaded', () => {
  initCloudSync();
  applyGlobalLinks();
  applyCategoryVisibility();
  initVideoOverlays();
  initCopyButtons();
  initMaintenanceMode();
  
  if (document.getElementById('pc-panel-grid')) renderDynamicPanels('pc');
  if (document.getElementById('mobile-panel-grid')) renderDynamicPanels('mobile');
});

// Sync data between 2 repos
function initCloudSync() {
  if (FIREBASE_REST_URL) {
    fetch(`${FIREBASE_REST_URL.replace(/\/$/, '')}/settings.json`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.discord) localStorage.setItem('kgff_discord_link', data.discord);
          if (data.topup) localStorage.setItem('kgff_topup_link', data.topup);
          if (data.categories) localStorage.setItem('kgff_category_meta', JSON.stringify(data.categories));
          if (data.pcPanels) localStorage.setItem('kgff_pc_panels', JSON.stringify(data.pcPanels));
          if (data.mobilePanels) localStorage.setItem('kgff_mobile_panels', JSON.stringify(data.mobilePanels));
          applyGlobalLinks();
          applyCategoryVisibility();
        }
      })
      .catch(err => console.log("Local Storage Mode (No Cloud DB Connected)"));
  }
}

function applyGlobalLinks() {
  const discordLink = localStorage.getItem('kgff_discord_link') || "https://discord.gg/NZsbZq4C7";
  const topupLink = localStorage.getItem('kgff_topup_link') || "https://codashop.com/";

  document.querySelectorAll('[data-global-link="discord"]').forEach(el => el.href = discordLink);
  document.querySelectorAll('[data-global-link="topup"]').forEach(el => el.href = topupLink);
}

function applyCategoryVisibility() {
  const meta = JSON.parse(localStorage.getItem('kgff_category_meta') || '[]');
  meta.forEach(cat => {
    const card = document.querySelector(`[data-cat-id="${cat.id}"]`);
    if (card) {
      card.style.display = cat.visible ? 'flex' : 'none';
    }
  });
}

function initVideoOverlays() {
  document.querySelectorAll('.video-play-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.style.display = 'none', 300);
      const iframe = overlay.previousElementSibling;
      if (iframe && iframe.src) {
        iframe.src += "&autoplay=1";
      }
    });
  });
}

function initCopyButtons() {
  const copyBtn = document.getElementById('btn-copy-pwd');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText("1");
      showToast("Password '1' copied to clipboard!");
    });
  }
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 3000);
}

function initMaintenanceMode() {
  if (freePanelMaintenance) disableSection('freePanel');
  if (freeBypassMaintenance) disableSection('freeBypass');
}

function disableSection(type) {
  document.querySelectorAll(`[data-panel-type="${type}"]`).forEach(btn => {
    btn.innerText = "Out of Stock";
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.5";
  });
}

// Render dynamic PC/Mobile store items & modal checkout
function renderDynamicPanels(type) {
  const isPC = type === 'pc';
  const grid = document.getElementById(isPC ? 'pc-panel-grid' : 'mobile-panel-grid');
  const defaultItems = isPC ? getDefaultPCItems() : getDefaultMobileItems();
  const storageKey = isPC ? 'kgff_pc_panels' : 'kgff_mobile_panels';
  const items = JSON.parse(localStorage.getItem(storageKey)) || defaultItems;

  grid.innerHTML = '';

  items.forEach((item, index) => {
    const modalId = `modal-${type}-${index}`;
    const cardHtml = `
      <div class="store-card">
        <img src="${item.icon}" alt="${item.title}" class="store-card-icon" onerror="this.src='https://via.placeholder.com/45/FF3366/FFFFFF?text=VIP';">
        <h3 class="store-card-title">${item.title}</h3>
        <p class="store-card-desc">${item.desc}</p>
        <button class="btn-action btn-buy" onclick="openOrderModal('${modalId}')">BUY NOW</button>
      </div>

      <div class="modal" id="${modalId}">
        <div class="modal-content">
          <div id="${modalId}-step1">
            <h2 class="modal-header">${item.title}</h2>
            <div class="radio-options">
              ${item.tiers.map((t, ti) => `
                <label class="radio-label">
                  <div>
                    <input type="radio" name="pack-${modalId}" value="${t.duration} - ${t.price}" ${ti === 0 ? 'checked' : ''}>
                    <span style="margin-left:8px;">${t.duration}</span>
                  </div>
                  <div>
                    ${t.oldPrice ? `<span class="price-crossed">${t.oldPrice}</span>` : ''}
                    <span class="price-current">${t.price}</span>
                  </div>
                </label>
              `).join('')}
            </div>
            <div class="modal-actions">
              <button class="btn-action btn-download" onclick="closeOrderModal('${modalId}')">CANCEL</button>
              <button class="btn-action btn-buy" onclick="goToStep2('${modalId}')">CONTINUE</button>
            </div>
          </div>

          <div id="${modalId}-step2" style="display:none;">
            <h2 class="modal-header">ENTER DISCORD INFO</h2>
            <p style="color:#9a9ab0; font-size:0.85rem; margin-bottom:15px; text-align:center;">
              Provide your Discord Username or ID to create your instant ticket.
            </p>
            <input type="text" id="${modalId}-user" class="modal-input" placeholder="যেমন: your_username অথবা Discord ID">
            <div class="modal-selected-package" id="${modalId}-summary" style="text-align:center; color:#FF3366; font-weight:700; margin-bottom:15px;"></div>
            <div class="modal-actions">
              <button class="btn-action btn-download" onclick="goToStep1('${modalId}')">&larr; BACK</button>
              <button class="btn-action btn-buy" onclick="submitOrder('${modalId}', '${item.title}')">CREATE TICKET</button>
            </div>
          </div>
        </div>
      </div>
    `;
    grid.innerHTML += cardHtml;
  });
}

function openOrderModal(id) { document.getElementById(id).classList.add('active'); }
function closeOrderModal(id) { document.getElementById(id).classList.remove('active'); }

function goToStep2(id) {
  const selected = document.querySelector(`input[name="pack-${id}"]:checked`);
  if (!selected) return showToast("Please select a package duration");
  document.getElementById(`${id}-summary`).innerText = `Selected: ${selected.value}`;
  document.getElementById(`${id}-step1`).style.display = 'none';
  document.getElementById(`${id}-step2`).style.display = 'block';
}

function goToStep1(id) {
  document.getElementById(`${id}-step2`).style.display = 'none';
  document.getElementById(`${id}-step1`).style.display = 'block';
}

function submitOrder(id, title) {
  const user = document.getElementById(`${id}-user`).value.trim();
  if (!user) return showToast("Please enter your Discord Username/ID");
  const discordLink = localStorage.getItem('kgff_discord_link') || "https://discord.gg/NZsbZq4C7";
  window.open(discordLink, '_blank');
  closeOrderModal(id);
}

function getDefaultPCItems() {
  return [
    { title: "BR MODS [ PARSONAL ]", desc: "Private VIP internal PC mod", icon: "images/br-mods.png", tiers: [{duration: "1 Months", price: "৳1100"}, {duration: "7 Days", price: "৳400"}, {duration: "1 Days", price: "৳150"}] },
    { title: "BR MODS [ GLOBAL ]", desc: "Global tournament safe panel", icon: "images/br-mods.png", tiers: [{duration: "1 Months", price: "৳1100"}, {duration: "7 Days", price: "৳400"}, {duration: "1 Days", price: "৳150"}] },
    { title: "BASIC PANEL", desc: "Essential aim tracking features", icon: "images/basic-panel.png", tiers: [{duration: "1 Months", price: "৳1100"}, {duration: "7 Days", price: "৳400"}, {duration: "1 Days", price: "৳150"}] },
    { title: "PREMIUM PANEL", desc: "Full feature bypass & auto-headshot", icon: "images/premium-panel.png", tiers: [{duration: "Lifetime", price: "৳2000"}, {duration: "1 Months", price: "৳450"}, {duration: "7 Days", price: "৳150"}, {duration: "1 Days", price: "৳100"}] }
  ];
}

function getDefaultMobileItems() {
  return [
    { title: "BALA MODS - NON ROOT", desc: "Android safe non-root menu", icon: "images/bala-mods.png", tiers: [{duration: "1 Months", price: "৳1100", oldPrice: "৳1500"}, {duration: "7 Days", price: "৳400", oldPrice: "৳600"}, {duration: "1 Days", price: "৳150", oldPrice: "৳250"}] },
    { title: "DRIP WIRE ANDROID EXTERNAL", desc: "Overlay non-inject internal", icon: "images/drip-wire.png", tiers: [{duration: "1 Months", price: "৳1100", oldPrice: "৳1500"}, {duration: "7 Days", price: "৳400", oldPrice: "৳600"}, {duration: "1 Days", price: "৳150", oldPrice: "৳250"}] },
    { title: "PHANTOM-AIMHACK", desc: "Smooth drag headshot for mobile", icon: "images/phantom.png", tiers: [{duration: "1 Months", price: "৳1100", oldPrice: "৳1500"}, {duration: "7 Days", price: "৳400", oldPrice: "৳600"}, {duration: "1 Days", price: "৳150", oldPrice: "৳250"}] }
  ];
}
