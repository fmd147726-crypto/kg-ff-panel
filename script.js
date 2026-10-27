/* ═══════════════════════════════════════
   KGFF PANEL — MAIN SCRIPT
   ═══════════════════════════════════════ */

// ──────── MAINTENANCE SWITCHES ────────
const freePanelMaintenance = false;
const freeBypassMaintenance = false;
const pcPaidMaintenance = false;
const mobilePaidMaintenance = false;

// ──────── ADMIN LOCALSTORAGE KEYS ────────
const ADMIN_KEYS = {
  discord: 'kgff_discord_link',
  topup: 'kgff_topup_link',
  catMeta: 'kgff_category_meta',
  pcPanels: 'kgff_pc_panels',
  mobilePanels: 'kgff_mobile_panels',
};

// ──────── READ ADMIN SETTINGS ────────
function loadAdminData(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

// ──────── APPLY GLOBAL LINKS (DISCORD & TOP-UP) ────────
function applyGlobalLinks() {
  const discord = loadAdminData(ADMIN_KEYS.discord, null);
  const topup = loadAdminData(ADMIN_KEYS.topup, null);

  if (discord) {
    document.querySelectorAll('[data-global-link="discord"]').forEach(el => {
      el.href = discord;
    });
    // Also replace any raw discord.gg links not tagged
    document.querySelectorAll('a[href*="discord.gg"]:not([data-global-link])').forEach(a => {
      a.href = discord;
    });
    // Replace onclick inline discord links
    document.querySelectorAll('[onclick*="discord.gg"]').forEach(el => {
      el.setAttribute('onclick', `window.open('${discord}','_blank')`);
    });
  }

  if (topup) {
    document.querySelectorAll('[data-global-link="topup"]').forEach(el => {
      el.href = topup;
    });
  }
}

// ──────── APPLY CATEGORY VISIBILITY (HOMEPAGE) ────────
function applyCategoryVisibility() {
  const cats = loadAdminData(ADMIN_KEYS.catMeta, null);
  if (!cats) return;
  cats.forEach(cat => {
    const targets = document.querySelectorAll(`[data-cat-link="${cat.link}"]`);
    targets.forEach(card => {
      if (!cat.visible) {
        card.style.display = 'none';
      } else {
        card.style.display = '';
        const titleEl = card.querySelector('.card-title');
        const iconEl = card.querySelector('.card-icon-circle');
        if (titleEl && cat.title) titleEl.textContent = cat.title;
        if (iconEl && cat.icon) {
          const isUrl = cat.icon.startsWith('http') || cat.icon.startsWith('images/');
          iconEl.innerHTML = isUrl ? `<img src="${cat.icon}" alt="${cat.title}" />` : cat.icon;
        }
      }
    });
  });
}

// ──────── APPLY DYNAMIC PANEL PRICING ────────
function applyDynamicPanels(type) {
  const key = type === 'pc' ? ADMIN_KEYS.pcPanels : ADMIN_KEYS.mobilePanels;
  const panels = loadAdminData(key, null);
  if (!panels) return;

  panels.forEach(panel => {
    const cards = document.querySelectorAll(`[data-panel-name="${panel.name}"]`);
    cards.forEach(card => {
      const nameEl = card.querySelector('.product-name');
      if (nameEl) nameEl.textContent = panel.name;

      const modalId = card.dataset.modalId;
      if (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
          const radioContainer = modal.querySelector('.modal-step[data-step="1"] .radio-options');
          if (radioContainer) {
            radioContainer.innerHTML = '';
            panel.tiers.forEach((tier, i) => {
              const label = document.createElement('label');
              label.className = 'radio-label';
              const priceHtml = tier.original
                ? `<span class="radio-price"><del>৳${tier.original}</del>৳${tier.price}</span>`
                : `<span class="radio-price">৳${tier.price}</span>`;
              label.innerHTML = `
                <input type="radio" name="dur-${modalId}" value="${tier.duration} - ৳${tier.price}" ${i === 0 ? 'checked' : ''}>
                <span class="radio-text">${tier.duration}</span>
                ${priceHtml}
              `;
              radioContainer.appendChild(label);
            });
          }
        }
      }
    });
  });
}

// ──────── ANIMATIONS ────────
function initAnimations() {
  const cards = document.querySelectorAll('.card, .product-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s, transform 0.5s';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 60);
  });
}

// ──────── CARD GLOW ON HOVER ────────
function initCardGlow() {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,51,102,0.08), #141419 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '#141419';
    });
  });
}

// ──────── VIDEO PLAY OVERLAYS ────────
function initVideoOverlays() {
  document.querySelectorAll('.video-play-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
      overlay.classList.add('hidden');
      const iframe = overlay.parentElement.querySelector('iframe');
      if (iframe) {
        const src = iframe.dataset.src || iframe.src;
        const separator = src.includes('?') ? '&' : '?';
        iframe.src = src + separator + 'autoplay=1';
      }
    });
  });
}

// ──────── COPY BUTTONS ────────
function initCopyButtons() {
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.copy || btn.previousElementSibling?.textContent?.trim() || '1';
      navigator.clipboard.writeText(target).then(() => {
        const original = btn.textContent;
        btn.textContent = '✓ COPIED';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
}

// ──────── IMAGE FALLBACKS ────────
function initImageFallbacks() {
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('onerror')) {
      img.onerror = function() {
        this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><rect fill="%23FF3366" width="45" height="45" rx="8"/><text x="22" y="30" text-anchor="middle" fill="%23fff" font-size="22" font-family="Arial">🎮</text></svg>';
      };
    }
  });
}

// ──────── TOAST ────────
function showToast(msg, type = '') {
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ──────── MAINTENANCE MODE ────────
function initMaintenanceMode() {
  const path = location.pathname.toLowerCase();

  let active = false;
  let msg = '';

  if (path.includes('free-panel') && freePanelMaintenance) {
    active = true;
    msg = '⚠️ Free Panel section is currently under maintenance.';
  } else if (path.includes('free-bypass') && freeBypassMaintenance) {
    active = true;
    msg = '⚠️ Free Bypass section is currently under maintenance.';
  } else if (path.includes('pc-paid-panel') && pcPaidMaintenance) {
    active = true;
    msg = '⚠️ PC Paid Panel section is currently under maintenance.';
  } else if (path.includes('paid-mobile-panel') && mobilePaidMaintenance) {
    active = true;
    msg = '⚠️ Mobile Paid Panel section is currently under maintenance.';
  }

  if (active) {
    setTimeout(() => showToast(msg), 500);

    document.querySelectorAll('.btn-download').forEach(btn => {
      btn.textContent = 'Out of Stock';
      btn.disabled = true;
      btn.style.background = '#333';
      btn.style.cursor = 'not-allowed';
    });

    document.querySelectorAll('.btn-buy').forEach(btn => {
      btn.removeAttribute('data-modal-target');
      btn.title = 'Under Maintenance';
      btn.style.pointerEvents = 'none';
      btn.style.background = '#333';
      btn.textContent = 'Under Maintenance';
    });
  }
}

// ──────── TWO-STEP ORDER MODALS ────────
function initOrderModals() {
  document.querySelectorAll('.btn-buy[data-modal-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.modalTarget;
      const modal = document.getElementById(id);
      if (modal) {
        modal.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
        const step1 = modal.querySelector('.modal-step[data-step="1"]');
        if (step1) step1.classList.add('active');
        modal.classList.add('active');
      }
    });
  });

  document.querySelectorAll('[data-modal-continue]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      const selected = modal.querySelector('input[type="radio"]:checked');
      if (!selected) {
        showToast('Please select a duration first.');
        return;
      }
      const selectedName = modal.querySelector('.modal-selected-package');
      if (selectedName) {
        const titleEl = modal.querySelector('.modal-title');
        const panelName = titleEl ? titleEl.textContent.replace('ORDER - ', '').trim() : '';
        selectedName.textContent = `${panelName} — ${selected.value}`;
      }
      modal.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
      modal.querySelector('.modal-step[data-step="2"]').classList.add('active');
    });
  });

  document.querySelectorAll('[data-modal-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      modal.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
      modal.querySelector('.modal-step[data-step="1"]').classList.add('active');
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
}

// ──────── HOW TO SKIP BUTTON ────────
function initHowToSkip() {
  document.querySelectorAll('.btn-how-to-skip').forEach(btn => {
    btn.addEventListener('click', () => {
      const discord = loadAdminData(ADMIN_KEYS.discord, 'https://discord.gg/NZsbZq4C7');
      window.open(discord, '_blank');
    });
  });
}

// ──────── BOOT ────────
document.addEventListener('DOMContentLoaded', () => {
  applyGlobalLinks();
  applyCategoryVisibility();

  const path = location.pathname.toLowerCase();
  if (path.includes('pc-paid-panel')) applyDynamicPanels('pc');
  if (path.includes('paid-mobile-panel')) applyDynamicPanels('mobile');

  initAnimations();
  initCardGlow();
  initVideoOverlays();
  initCopyButtons();
  initImageFallbacks();
  initHowToSkip();
  initOrderModals();
  initMaintenanceMode();
});
