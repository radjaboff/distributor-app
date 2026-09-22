const API_BASE = '/api';

const contentEl = document.getElementById('content');
const titleEl = document.getElementById('pageTitle');
const backBtn = document.getElementById('backBtn');
const fabBtn = document.getElementById('fabBtn');
const pwaInstallBtn = document.getElementById('pwaInstallBtn');
const networkStatusEl = document.getElementById('networkStatus');

let currentShopId = null;
let currentGroupId = null;
let currentGroupName = null;
let saleItems = [];
let allShopsInGroup = [];
let allProductsList = [];
let shopSortMode = 'none'; // 'none' | 'debtDesc' | 'nameAsc'

// ==========================================
// 1. PROFESSIONAL VEKTOR ICONKALAR (SVG)
// ==========================================
const Icons = {
    market: `<svg class="svg-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    box: `<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    oil: `<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
    chart: `<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    phoneAction: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    tgAction: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    edit: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    chevronRight: `<svg class="chevron-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    check: `<svg class="svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-1px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    checkCircle: `<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    alert: `<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    alertTriangle: `<svg class="svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info: `<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    download: `<svg class="svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    user: `<svg class="svg-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-1px; margin-right:2px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    money: `<svg class="svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>`,
    cart: `<svg class="svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
    sortDebt: `<svg class="svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    sortAlpha: `<svg class="svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6v12m0 0l-3-3m3 3l3-3M4 17V7l5 10V7"/></svg>`,
    badgeDebt: `<svg class="svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    wallet: `<svg class="svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>`,
    plus: `<svg class="svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    phoneApp: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line><path d="M12 7v6m-3-3l3 3 3-3"/></svg>`
};

// ==========================================
// 2. MOBIL YORDAMCHILAR VA XAVFSIZLIK
// ==========================================

function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/'/g, "\\'");
}

function formatMoney(amount) {
    const val = (amount === null || amount === undefined) ? 0 : Number(amount);
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
}

function parseMoney(val) {
    if (val === null || val === undefined) return 0;
    const clean = String(val).replace(/\s+/g, '').replace(/,/g, '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
}

function formatNumberWithSpaces(val) {
    if (val === null || val === undefined || val === '') return '';
    const clean = String(val).replace(/[^\d.]/g, '');
    if (!clean) return '';
    const parts = clean.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
}

function formatMoneyWords(amount) {
    const num = parseMoney(amount);
    if (!num || num <= 0) return '';
    if (num >= 1e9) {
        const mlrd = (num / 1e9);
        const f = Number.isInteger(mlrd) ? mlrd : mlrd.toFixed(2).replace(/\.?0+$/, '');
        return `${f} milliard so'm`;
    }
    if (num >= 1e6) {
        const mln = (num / 1e6);
        const f = Number.isInteger(mln) ? mln : mln.toFixed(2).replace(/\.?0+$/, '');
        return `${f} million so'm`;
    }
    if (num >= 1e3) {
        const ming = (num / 1e3);
        const f = Number.isInteger(ming) ? ming : ming.toFixed(2).replace(/\.?0+$/, '');
        return `${f} ming so'm`;
    }
    return `${num} so'm`;
}

// Mahalliy vaqt mintaqasi (UTC+5 O'zbekiston) bo'yicha to'g'ri sana olish (toISOString UTC muammosini oldini oladi)
function getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getLocalMonthString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

function updateMoneyLivePreview(previewId, amount) {
    const el = document.getElementById(previewId);
    if (!el) return;
    const num = parseMoney(amount);
    if (!num || num <= 0) {
        el.innerHTML = '';
        el.style.display = 'none';
        return;
    }
    const words = formatMoneyWords(num);
    el.style.display = 'inline-flex';
    el.innerHTML = `
        <span class="live-preview-pill">
            <span class="live-preview-val">${formatMoney(num)}</span>
            <span class="live-preview-words">(${words})</span>
        </span>
    `;
}

function onMoneyInputChange(input, previewId = null) {
    if (!input) return;
    const rawVal = input.value;
    const cursorPos = input.selectionStart !== null ? input.selectionStart : rawVal.length;
    
    const digitsBeforeCursor = rawVal.slice(0, cursorPos).replace(/\D/g, '').length;
    const digits = rawVal.replace(/\D/g, '');
    
    if (!digits) {
        input.value = '';
        if (previewId) updateMoneyLivePreview(previewId, 0);
        return;
    }
    
    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    input.value = formatted;
    
    let newCursorPos = 0;
    let countedDigits = 0;
    for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) countedDigits++;
        if (countedDigits === digitsBeforeCursor) {
            newCursorPos = i + 1;
            break;
        }
    }
    if (countedDigits < digitsBeforeCursor) {
        newCursorPos = formatted.length;
    }
    if (input.setSelectionRange) {
        input.setSelectionRange(newCursorPos, newCursorPos);
    }
    
    if (previewId) {
        updateMoneyLivePreview(previewId, parseMoney(formatted));
    }
}

function setMoneyInputValue(inputOrId, amount, previewId = null) {
    const input = typeof inputOrId === 'string' ? document.getElementById(inputOrId) : inputOrId;
    if (!input) return;
    const num = parseMoney(amount);
    input.value = num > 0 ? formatNumberWithSpaces(num) : (amount === 0 || amount === '0' ? '0' : '');
    if (previewId) {
        updateMoneyLivePreview(previewId, num);
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function addMoneyToInput(inputId, addAmount, previewId = null) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const current = parseMoney(input.value);
    const newTotal = current + addAmount;
    setMoneyInputValue(input, newTotal, previewId);
}

function clearMoneyInput(inputOrId, previewId = null) {
    const input = typeof inputOrId === 'string' ? document.getElementById(inputOrId) : inputOrId;
    if (!input) return;
    input.value = '';
    if (previewId) {
        updateMoneyLivePreview(previewId, 0);
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function addQtyToInput(inputId, amount) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const current = parseInt(input.value) || 0;
    input.value = Math.max(1, current + amount);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}


// Toast bildirishnomalar (oddiy browser alert o'rniga zamonaviy mobil bildirishnoma)
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    let icon = Icons.info;
    if (type === 'success') icon = Icons.checkCircle;
    if (type === 'error') icon = Icons.alert;
    toast.innerHTML = `<span style="display:flex; align-items:center;">${icon}</span><span>${escHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px) scale(0.95)';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

// Bottom Sheet (Pastdan chiquvchi mobil oyna)
function showBottomSheet(contentHtml) {
    let bs = document.getElementById('globalBottomSheet');
    if (!bs) {
        bs = document.createElement('div');
        bs.id = 'globalBottomSheet';
        bs.className = 'bottom-sheet';
        bs.innerHTML = `
            <div class="bottom-sheet__backdrop" onclick="closeBottomSheet()"></div>
            <div class="bottom-sheet__panel">
                <div class="bottom-sheet__drag-bar"></div>
                <div id="bottomSheetContent"></div>
            </div>
        `;
        document.body.appendChild(bs);
    }
    document.getElementById('bottomSheetContent').innerHTML = contentHtml;
    bs.classList.add('show');
}

function closeBottomSheet() {
    const bs = document.getElementById('globalBottomSheet');
    if (bs) bs.classList.remove('show');
}

// ==========================================
// 3. TARMOQ VA PWA O'RNATISH (MOBILE)
// ==========================================

window.addEventListener('online', () => {
    if (networkStatusEl) networkStatusEl.style.display = 'none';
    showToast('Internet aloqasi tiklandi', 'success');
});

window.addEventListener('offline', () => {
    if (networkStatusEl) networkStatusEl.style.display = 'flex';
    showToast('Internet aloqasi uzildi (Oflayn)', 'error');
});

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaInstallBtn) {
        pwaInstallBtn.style.display = 'flex';
        pwaInstallBtn.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const choice = await deferredPrompt.userChoice;
                if (choice.outcome === 'accepted') {
                    showToast('Ilova ekranga o\'rnatildi', 'success');
                    pwaInstallBtn.style.display = 'none';
                }
                deferredPrompt = null;
            }
        };
    }
});

// iOS Safari tekshiruvi (Add to Home Screen)
const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
if (isIos && !isStandalone && pwaInstallBtn) {
    pwaInstallBtn.style.display = 'flex';
    pwaInstallBtn.onclick = () => showIosInstallGuide();
}

function showIosInstallGuide() {
    showBottomSheet(`
        <div style="text-align:center;">
            <div class="sheet-icon-badge">${Icons.phoneApp}</div>
            <div style="font-size:18px; font-weight:700; color:#FFF; margin-bottom:6px;">Ilovani ekranga chiqarish</div>
            <div style="font-size:13px; color:var(--color-ink-dim); margin-bottom:18px;">
                Ilovadan alohida dastur kabi foydalanish uchun uni bosh ekranga qo'shing:
            </div>
            <div style="background:var(--color-paper-dim); border:1px solid var(--color-line); border-radius:var(--radius-sm); padding:14px; text-align:left; font-size:13.5px; line-height:1.6; margin-bottom:18px;">
                <div style="margin-bottom:8px;">1. Safari brauzeri pastidagi <strong>Ulashish (Share ⎋)</strong> belgisini bosing.</div>
                <div>2. Chiqqan ro'yxatdan <strong>"Bosh ekranga qo'shish (Add to Home Screen ⊞)"</strong> ni tanlang.</div>
            </div>
            <button class="btn btn--primary btn--full" onclick="closeBottomSheet()">Tushunarli</button>
        </div>
    `);
}

// Backend'ga so'rov yuborish yordamchilari
async function apiGet(path) {
    const response = await fetch(`${API_BASE}${path}`);
    if (response.status === 401) {
        window.location.href = '/login.html';
        return;
    }
    if (!response.ok) {
        throw new Error('Server xatosi: ' + response.status);
    }
    return response.json();
}

async function apiPost(path, body) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (response.status === 401) {
        window.location.href = '/login.html';
        return;
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server xatosi');
    }
    return response.json();
}

async function apiPut(path, body) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (response.status === 401) {
        window.location.href = '/login.html';
        return;
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server xatosi');
    }
    return response.json();
}

async function apiDelete(path) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: 'DELETE'
    });
    if (response.status === 401) {
        window.location.href = '/login.html';
        return;
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server xatosi');
    }
    return response.ok;
}

// Toifalar (Bozorlar) ro'yxatini ko'rsatish
async function showMarketGroups() {
    titleEl.textContent = 'Bozorlar & Toifalar';
    backBtn.style.visibility = 'hidden';
    fabBtn.style.display = 'flex';
    fabBtn.onclick = showAddMarketGroupForm;

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const groups = await apiGet('/market-groups');

        if (groups.length === 0) {
            contentEl.innerHTML = '<div class="empty-state">Hali toifa qo\'shilmagan.<br>Pastdagi + tugmasi orqali yangi bozor qo\'shing.</div>';
            return;
        }

        contentEl.innerHTML = groups.map(group => `
    <div class="ledger-row" onclick="showShops(${group.id}, '${escAttr(group.name)}')">
        <div class="ledger-row__main" style="display:flex; flex-direction:row; align-items:center; gap:12px;">
            <div class="ledger-avatar ledger-avatar--market">
                ${Icons.market}
            </div>
            <div>
                <div class="ledger-row__title">${group.name}</div>
                <div class="ledger-row__subtitle">Do'konlarni ko'rish</div>
            </div>
        </div>
        <div class="ledger-row__right">
            <button class="icon-btn" onclick="event.stopPropagation(); showEditMarketGroupForm(${group.id}, '${escAttr(group.name)}')" title="Tahrirlash">${Icons.edit}</button>
            <button class="icon-btn icon-btn--danger" onclick="event.stopPropagation(); deleteMarketGroup(${group.id})" title="O'chirish">${Icons.trash}</button>
            <span class="chevron">${Icons.chevronRight}</span>
        </div>
    </div>
`).join('');

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${err.message}</div>`;
    }
}

// Boshlang'ich sahifa
showMarketGroups();

// Yangi toifa qo'shish formasi
function showAddMarketGroupForm() {
    titleEl.textContent = 'Yangi toifa';
    backBtn.style.visibility = 'visible';
    backBtn.onclick = showMarketGroups;
    fabBtn.style.display = 'none';

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(59, 130, 246, 0.15); color: #38BDF8;">
                    ${Icons.market}
                </div>
                <div>
                    <div class="form-card__title">Yangi toifa (bozor)</div>
                    <div class="form-card__desc">Do'konlarni guruhlash uchun hudud yoki bozor nomi</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="groupNameInput">
                    <span class="label-icon">${Icons.market}</span>
                    <span>Toifa yoki bozor nomi</span>
                </label>
                <input type="text" class="form-input" id="groupNameInput" placeholder="Masalan: Orzu Bozor" autofocus>
            </div>
            <div class="form-group" style="margin-top: 24px;">
                <button class="btn btn--primary btn--full" onclick="submitMarketGroup()">
                    ${Icons.check} Toifani saqlash
                </button>
            </div>
        </div>
    `;
}

async function submitMarketGroup() {
    const name = document.getElementById('groupNameInput').value.trim();
    if (!name) {
        showToast('Nomini kiriting', 'error');
        return;
    }
    try {
        await apiPost('/market-groups', { name });
        showToast('Yangi toifa yaratildi', 'success');
        showMarketGroups();
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
    }
}

// Do'konlar ro'yxatini ko'rsatish
async function showShops(groupId, groupName) {
    titleEl.textContent = groupName;
    currentGroupId = groupId;
    currentGroupName = groupName;
    backBtn.style.visibility = 'visible';
    backBtn.onclick = showMarketGroups;
    fabBtn.style.display = 'flex';
    fabBtn.onclick = () => showAddShopForm(groupId);

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        allShopsInGroup = await apiGet(`/shops?groupId=${groupId}`);

        contentEl.innerHTML = `
            <div class="form-group" style="padding-bottom:6px;">
                <input type="text" class="form-input" id="shopSearchInput" placeholder="Do'kon yoki egasini qidirish..." oninput="filterShops()">
            </div>
            
            <div class="sort-bar">
                <button class="sort-btn ${shopSortMode === 'none' ? 'active' : ''}" id="sortNone" onclick="setShopSort('none')">Hammasi</button>
                <button class="sort-btn ${shopSortMode === 'debtDesc' ? 'active' : ''}" id="sortDebt" onclick="setShopSort('debtDesc')">${Icons.sortDebt} Qarz bo'yicha</button>
                <button class="sort-btn ${shopSortMode === 'nameAsc' ? 'active' : ''}" id="sortName" onclick="setShopSort('nameAsc')">${Icons.sortAlpha} Nomi (A-Z)</button>
            </div>

            <div id="shopsListContainer"></div>
        `;
        filterShops();

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function setShopSort(mode) {
    shopSortMode = mode;
    document.getElementById('sortNone')?.classList.toggle('active', mode === 'none');
    document.getElementById('sortDebt')?.classList.toggle('active', mode === 'debtDesc');
    document.getElementById('sortName')?.classList.toggle('active', mode === 'nameAsc');
    filterShops();
}

function filterShops() {
    const input = document.getElementById('shopSearchInput');
    const query = input ? input.value.trim().toLowerCase() : '';
    let list = [...allShopsInGroup];

    if (query) {
        list = list.filter(shop =>
            (shop.name && shop.name.toLowerCase().includes(query)) ||
            (shop.ownerName && shop.ownerName.toLowerCase().includes(query)) ||
            (shop.phone && shop.phone.includes(query))
        );
    }

    if (shopSortMode === 'debtDesc') {
        list.sort((a, b) => (Number(b.currentDebt) || 0) - (Number(a.currentDebt) || 0));
    } else if (shopSortMode === 'nameAsc') {
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    renderShopRows(list);
}

function renderShopRows(shops) {
    const container = document.getElementById('shopsListContainer');
    if (!container) return;

    if (shops.length === 0) {
        container.innerHTML = '<div class="empty-state">Do\'kon topilmadi.</div>';
        return;
    }

    container.innerHTML = shops.map(shop => {
        const debt = Number(shop.currentDebt) || 0;
        const hasDebt = debt > 0;

        let subtitleParts = [];
        if (shop.ownerName && shop.ownerName !== shop.name) {
            subtitleParts.push(`<span class="shop-card__meta">${Icons.user} ${escHtml(shop.ownerName)}</span>`);
        }
        if (shop.phone) {
            subtitleParts.push(`<span class="shop-card__meta">${escHtml(shop.phone)}</span>`);
        }

        return `
            <div class="shop-card" onclick="showShopDetail(${shop.id})">
                <div class="shop-card__top">
                    <div class="shop-card__main">
                        <div class="shop-card__title">${escHtml(shop.name)}</div>
                        ${subtitleParts.length > 0 ? `<div class="shop-card__subtitle">${subtitleParts.join('<span style="opacity:0.4;">·</span>')}</div>` : ''}
                    </div>
                    <div class="shop-card__badge-wrap">
                        <div class="ledger-row__amount ${hasDebt ? 'amount--debt' : 'amount--paid'}">
                            ${hasDebt ? formatMoney(debt) : 'Toza ' + Icons.check}
                        </div>
                        <span class="chevron">${Icons.chevronRight}</span>
                    </div>
                </div>
                <div class="shop-card__actions" onclick="event.stopPropagation()">
                    <div class="shop-card__action-group">
                        ${shop.phone ? `
                            <a href="tel:${escAttr(shop.phone)}" class="action-chip action-chip--call" title="Qo'ng'iroq qilish">
                                ${Icons.phoneAction}
                                <span>Qo'ng'iroq</span>
                            </a>
                        ` : ''}
                        <button class="action-chip action-chip--telegram" onclick="shareShopDebt('${escAttr(shop.name)}', ${debt}, '${escAttr(shop.phone || '')}')" title="Telegramga hisob yuborish">
                            ${Icons.tgAction}
                            <span>Telegram</span>
                        </button>
                    </div>
                    <div class="shop-card__action-group">
                        <button class="icon-btn" onclick="showEditShopForm(${shop.id}, '${escAttr(shop.name)}', '${escAttr(shop.ownerName || '')}', '${escAttr(shop.phone || '')}')" title="Tahrirlash">${Icons.edit}</button>
                        <button class="icon-btn icon-btn--danger" onclick="deleteShop(${shop.id})" title="O'chirish">${Icons.trash}</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Telegram yoki mobil ulashish orqali qarz ma'lumotini yuborish
function shareShopDebt(shopName, debt, phone) {
    const debtStr = formatMoney(debt);
    const text = `Assalomu alaykum, ${shopName}!\nSizning joriy qarz balansingiz: ${debtStr}.\nHisob-kitob bo'yicha savollar bo'lsa bog'lanishingiz mumkin.`;

    if (navigator.share) {
        navigator.share({
            title: `${shopName} — Qarz balansi`,
            text: text
        }).catch(() => {});
    } else {
        const url = `https://t.me/share/url?url=${encodeURIComponent('')}&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }
}

function showAddShopForm(groupId) {
    titleEl.textContent = 'Yangi do\'kon';
    backBtn.style.visibility = 'visible';
    backBtn.onclick = () => showShops(groupId, currentGroupName);
    fabBtn.style.display = 'none';

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(59, 130, 246, 0.15); color: #38BDF8;">
                    ${Icons.market}
                </div>
                <div>
                    <div class="form-card__title">Yangi do'kon qo'shish</div>
                    <div class="form-card__desc">${escHtml(currentGroupName || 'Bozor')} toifasiga yangi do'kon kiritish</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="shopNameInput">
                    <span class="label-icon">${Icons.market}</span>
                    <span>Do'kon nomi</span>
                </label>
                <input type="text" class="form-input" id="shopNameInput" placeholder="Masalan: Aziz do'koni" autofocus>
            </div>
            <div class="form-group">
                <label class="form-label" for="ownerNameInput">
                    <span class="label-icon">${Icons.user}</span>
                    <span>Egasining ismi (ixtiyoriy)</span>
                </label>
                <input type="text" class="form-input" id="ownerNameInput" placeholder="Masalan: Aziz aka">
            </div>
            <div class="form-group">
                <label class="form-label" for="phoneInput">
                    <span class="label-icon">${Icons.phoneAction}</span>
                    <span>Telefon raqami (ixtiyoriy)</span>
                </label>
                <input type="tel" inputmode="tel" class="form-input" id="phoneInput" placeholder="+998 90 123 45 67">
            </div>
            <div class="form-group" style="margin-top: 24px;">
                <button class="btn btn--primary btn--full" id="submitShopBtn" onclick="submitShop(${groupId})">
                    ${Icons.check} Do'konni saqlash
                </button>
            </div>
        </div>
    `;
}

async function submitShop(groupId) {
    const name = document.getElementById('shopNameInput').value.trim();
    const ownerName = document.getElementById('ownerNameInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();

    if (!name) {
        showToast('Do\'kon nomini kiriting', 'error');
        return;
    }

    const btn = document.getElementById('submitShopBtn');
    btn.disabled = true;

    try {
        await apiPost('/shops', { name, ownerName, phone, marketGroupId: groupId });
        showToast('Do\'kon muvaffaqiyatli qo\'shildi', 'success');
        showShops(groupId, currentGroupName);
    } catch (err) {
        btn.disabled = false;
        showToast('Xatolik: ' + err.message, 'error');
    }
}

// Do'kon ichki kabineti (Tarix va operatsiyalar)
async function showShopDetail(shopId) {
    currentShopId = shopId;
    titleEl.textContent = 'Yuklanmoqda...';
    backBtn.style.visibility = 'visible';
    backBtn.onclick = () => showShops(currentGroupId, currentGroupName);
    fabBtn.style.display = 'none';

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const ledger = await apiGet(`/shops/${shopId}/ledger`);
        titleEl.textContent = ledger.shopName;

        const debt = Number(ledger.currentDebt) || 0;
        const isDebt = debt > 0;
        const debtStyleColor = isDebt ? 'var(--color-debt)' : 'var(--color-paid)';

        let entriesHtml = '';
        if (!ledger.entries || ledger.entries.length === 0) {
            entriesHtml = '<div class="empty-state">Hali harakatlar tarixi yo\'q.</div>';
        } else {
            entriesHtml = ledger.entries.slice().reverse().map(entry => `
                <div class="ledger-row" style="cursor:default; margin-bottom:8px;">
                    <div class="ledger-row__main">
                        <div class="ledger-row__title" style="font-size:14.5px; display:flex; align-items:center; gap:6px;">
                            ${entry.type === 'SOTUV' ? Icons.box : Icons.money}
                            <span>${escHtml(entry.description)}</span>
                        </div>
                        <div class="ledger-row__subtitle" style="font-size:12px;">${new Date(entry.date).toLocaleDateString('uz-UZ')} · Qoldiq: ${formatMoney(entry.balanceAfter)}</div>
                    </div>
                    <div class="ledger-row__amount ${entry.type === 'SOTUV' ? 'amount--debt' : 'amount--paid'}">
                        ${entry.type === 'SOTUV' ? '+' : '−'}${formatMoney(entry.amount)}
                    </div>
                </div>
            `).join('');
        }

        contentEl.innerHTML = `
            <div class="stat-card" style="margin-bottom:16px; text-align:center; padding: 22px 18px; background: linear-gradient(135deg, #131B2E 0%, #0F172A 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: ${isDebt ? 'linear-gradient(90deg, #F43F5E, #FB7185)' : 'linear-gradient(90deg, #10B981, #34D399)'};"></div>
                <div class="stat-card__label" style="text-transform:uppercase; letter-spacing:0.8px; font-size:11.5px; font-weight:700; color:var(--color-ink-dim);">Joriy qarz balansi</div>
                <div class="stat-card__value" style="color: ${debtStyleColor}; font-size: 28px; font-weight:800; margin-top:6px; font-variant-numeric: tabular-nums;">
                    ${formatMoney(debt)}
                </div>
                <div style="margin-top:14px;">
                    <button class="action-chip action-chip--telegram" onclick="shareShopDebt('${escAttr(ledger.shopName)}', ${debt})" style="display:inline-flex; align-items:center; gap:8px; padding: 9px 16px; width:auto; border-radius: 12px; font-size: 13px; font-weight: 600;">
                        ${Icons.tgAction} Telegramga qarz hisobini yuborish
                    </button>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom: 20px;">
                <button class="btn btn--primary" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius: 14px; padding: 14px;" onclick="showAddSaleForm(${shopId})">
                    ${Icons.plus} Yangi sotuv
                </button>
                <button class="btn" style="background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16,185,129,0.35); display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius: 14px; padding: 14px; font-weight: 700;" onclick="showAddPaymentForm(${shopId}, ${debt})">
                    ${Icons.wallet} To'lov olish
                </button>
            </div>

            <div class="section-title">
                Operatsiyalar tarixi
            </div>
            ${entriesHtml}
        `;

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

// Yangi sotuv formasi
async function showAddSaleForm(shopId) {
    titleEl.textContent = 'Yangi sotuv';
    backBtn.style.visibility = 'visible';
    backBtn.onclick = () => showShopDetail(shopId);
    fabBtn.style.display = 'none';
    saleItems = [];

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const products = await apiGet('/products');
        window.allProducts = products;

        contentEl.innerHTML = `
            <div class="form-card">
                <div class="form-card__header">
                    <div class="form-card__icon" style="background: rgba(59, 130, 246, 0.15); color: #38BDF8;">
                        ${Icons.cart}
                    </div>
                    <div>
                        <div class="form-card__title">Sotuvga mahsulot qo'shish</div>
                        <div class="form-card__desc">Mahsulot va miqdorini belgilang</div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="productSelect">
                        <span class="label-icon">${Icons.box}</span>
                        <span>Mahsulotni tanlang</span>
                    </label>
                    <select class="form-select" id="productSelect" onchange="onProductSelectChanged()">
                        <option value="">— Mahsulot tanlang —</option>
                        ${products.map(p => `
                            <option value="${p.id}" data-price="${p.sellPrice}" data-stock="${p.stockQuantity}">
                                ${escHtml(p.name)} (${escHtml(p.packageName)}, omborda: ${p.stockQuantity} ta)
                            </option>
                        `).join('')}
                    </select>
                    <div id="productPriceHint" style="display:none; margin-top: 8px; padding: 8px 12px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 10px; font-size: 13px; color: #93C5FD;"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="packageCountInput">
                        <span class="label-icon">${Icons.box}</span>
                        <span>Miqdori (paket)</span>
                    </label>
                    <div class="quantity-input-box">
                        <input type="number" inputmode="numeric" class="form-input" id="packageCountInput" placeholder="Masalan: 5" min="1">
                    </div>
                    <div class="quick-chips-row">
                        <button type="button" class="preset-chip" onclick="addQtyToInput('packageCountInput', 1)">+1</button>
                        <button type="button" class="preset-chip" onclick="addQtyToInput('packageCountInput', 2)">+2</button>
                        <button type="button" class="preset-chip" onclick="addQtyToInput('packageCountInput', 5)">+5</button>
                        <button type="button" class="preset-chip" onclick="addQtyToInput('packageCountInput', 10)">+10</button>
                        <button type="button" class="preset-chip" onclick="addQtyToInput('packageCountInput', 20)">+20</button>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                    <button class="btn btn--full" style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.35); color: #60A5FA; display:inline-flex; align-items:center; justify-content:center; gap:8px; font-weight:700;" onclick="addSaleItem()">
                        ${Icons.plus} Mahsulotni ro'yxatga qo'shish
                    </button>
                </div>
            </div>

            <div id="saleItemsList" style="margin-bottom: 16px;"></div>

            <div id="paymentSection" style="display:none;" class="form-card">
                <div class="form-card__header">
                    <div class="form-card__icon" style="background: rgba(16, 185, 129, 0.15); color: #34D399;">
                        ${Icons.wallet}
                    </div>
                    <div>
                        <div class="form-card__title">Hisob-kitob va To'lov</div>
                        <div class="form-card__desc">Boshlang'ich to'lov va to'lov usulini tanlang</div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="initialPaidInput">
                        <span class="label-icon">${Icons.money}</span>
                        <span>Boshlang'ich to'lov (ixtiyoriy)</span>
                    </label>
                    <div class="money-field-wrap">
                        <div class="money-input-box">
                            <input type="text" 
                                   inputmode="numeric" 
                                   class="form-input money-input" 
                                   id="initialPaidInput" 
                                   placeholder="0" 
                                   oninput="onMoneyInputChange(this, 'initialPaidLive'); onInitialPaidInputChanged()">
                            <span class="money-suffix">so'm</span>
                        </div>
                        <div class="money-live-container" id="initialPaidLive" style="display:none;"></div>
                    </div>
                    
                    <div class="quick-chips-row">
                        <button type="button" class="preset-chip active" id="chipPaid0" onclick="setInitialPaidPreset(0)">0 (Nasiya)</button>
                        <button type="button" class="preset-chip" id="chipPaidHalf" onclick="setInitialPaidPreset(0.5)">50% to'lov</button>
                        <button type="button" class="preset-chip" id="chipPaidFull" onclick="setInitialPaidPreset(1)">100% to'lov</button>
                    </div>
                </div>

                <div class="form-group" id="paymentMethodGroup" style="display:none;">
                    <label class="form-label" for="paymentMethodSelect">
                        <span class="label-icon">${Icons.wallet}</span>
                        <span>To'lov usuli</span>
                    </label>
                    <select class="form-select" id="paymentMethodSelect">
                        <option value="NAQD">NAQD (qo'lma-qo'l)</option>
                        <option value="KARTA">KARTA (Click / O'tkazma)</option>
                    </select>
                </div>
            </div>

            <div class="form-group" style="margin-top: 18px;">
                <button class="btn btn--primary btn--full" id="submitSaleBtn" onclick="submitSale(${shopId})">
                    ${Icons.check} Sotuvni rasmiylashtirish
                </button>
            </div>
        `;
    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function onProductSelectChanged() {
    const select = document.getElementById('productSelect');
    const selectedOption = select?.options[select.selectedIndex];
    const hintEl = document.getElementById('productPriceHint');
    if (selectedOption && selectedOption.dataset.price && hintEl) {
        hintEl.style.display = 'block';
        hintEl.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px;">${Icons.money} Belgilangan sotish narxi: <b style="color:#FFF; font-variant-numeric:tabular-nums;">${formatMoney(selectedOption.dataset.price)}</b> / paket</span>`;
    } else if (hintEl) {
        hintEl.style.display = 'none';
        hintEl.innerHTML = '';
    }
}

function addSaleItem() {
    const select = document.getElementById('productSelect');
    const productId = select?.value;
    const countInput = document.getElementById('packageCountInput');

    const packageCount = parseInt(countInput?.value);

    if (!productId || isNaN(packageCount) || packageCount < 1) {
        showToast('Mahsulot va miqdorni to\'g\'ri kiriting', 'error');
        return;
    }

    const product = window.allProducts.find(p => p.id == productId);
    if (!product) return;

    if (product.stockQuantity < packageCount) {
        showToast(`Omborda faqat ${product.stockQuantity} ta mavjud!`, 'error');
    }

    saleItems.push({
        productId: parseInt(productId),
        packageCount,
        productName: product.name,
        sellPrice: product.sellPrice
    });

    if (countInput) countInput.value = '';
    if (select) select.value = '';
    onProductSelectChanged();

    renderSaleItemsList();
}

function getSaleTotal() {
    return saleItems.reduce((sum, item) => sum + (item.packageCount * item.sellPrice), 0);
}

function renderSaleItemsList() {
    const listEl = document.getElementById('saleItemsList');
    const paymentSection = document.getElementById('paymentSection');

    if (saleItems.length === 0) {
        listEl.innerHTML = '';
        if (paymentSection) paymentSection.style.display = 'none';
        return;
    }

    const total = getSaleTotal();
    if (paymentSection) paymentSection.style.display = 'block';

    listEl.innerHTML = `
        <div style="background:var(--color-paper); border:1px solid var(--color-line); border-radius:var(--radius); padding:14px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:12px; color:var(--color-ink-dim); font-weight:600; text-transform:uppercase;">Tanlangan mahsulotlar:</span>
                <span style="font-size:14px; font-weight:700; color:var(--color-accent); font-variant-numeric:tabular-nums;">${formatMoney(total)}</span>
            </div>
            ${saleItems.map((item, index) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--color-line);">
                    <div>
                        <div style="font-weight:600; color:#FFF; font-size:14.5px;">${escHtml(item.productName)}</div>
                        <div style="font-size:12.5px; color:var(--color-ink-dim);">${item.packageCount} paket × ${formatMoney(item.sellPrice)}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-variant-numeric: tabular-nums; font-weight:700; color:var(--color-ink); font-size:14px;">${formatMoney(item.packageCount * item.sellPrice)}</span>
                        <button onclick="removeSaleItem(${index})" style="background:rgba(244,63,94,0.15); border:none; color:var(--color-debt); width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer;">×</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    onInitialPaidInputChanged();
}

function removeSaleItem(index) {
    saleItems.splice(index, 1);
    renderSaleItemsList();
}

function setInitialPaidPreset(ratio) {
    const total = getSaleTotal();
    const paidInput = document.getElementById('initialPaidInput');
    const chip0 = document.getElementById('chipPaid0');
    const chipHalf = document.getElementById('chipPaidHalf');
    const chipFull = document.getElementById('chipPaidFull');

    chip0?.classList.toggle('active', ratio === 0);
    chipHalf?.classList.toggle('active', ratio === 0.5);
    chipFull?.classList.toggle('active', ratio === 1);

    if (ratio === 0) {
        clearMoneyInput('initialPaidInput', 'initialPaidLive');
    } else {
        setMoneyInputValue('initialPaidInput', Math.round(total * ratio), 'initialPaidLive');
    }
    onInitialPaidInputChanged();
}

function onInitialPaidInputChanged() {
    const paidInput = document.getElementById('initialPaidInput');
    const methodGroup = document.getElementById('paymentMethodGroup');
    const val = parseMoney(paidInput?.value);

    if (val > 0) {
        if (methodGroup) methodGroup.style.display = 'block';
    } else {
        if (methodGroup) methodGroup.style.display = 'none';
    }
}

async function submitSale(shopId) {
    if (saleItems.length === 0) {
        showToast('Kamida bitta mahsulot qo\'shing', 'error');
        return;
    }

    const initialPaidAmount = parseMoney(document.getElementById('initialPaidInput').value);
    const methodSelect = document.getElementById('paymentMethodSelect');
    const initialPaymentMethod = (initialPaidAmount > 0) ? (methodSelect.value || 'NAQD') : null;

    const payload = {
        shopId: shopId,
        items: saleItems.map(item => ({ productId: item.productId, packageCount: item.packageCount })),
        initialPaidAmount: initialPaidAmount,
        initialPaymentMethod: initialPaymentMethod
    };

    const btn = document.getElementById('submitSaleBtn');
    btn.disabled = true;
    btn.innerHTML = 'Rasmiylashtirilmoqda...';

    try {
        await apiPost('/sales', payload);
        showToast('Sotuv muvaffaqiyatli saqlandi!', 'success');
        showShopDetail(shopId);
    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = 'Sotuvni rasmiylashtirish';
        showToast('Xatolik: ' + err.message, 'error');
    }
}

// Yangi to'lov formasi
function showAddPaymentForm(shopId, currentDebt = 0) {
    titleEl.textContent = 'To\'lov qabul qilish';
    backBtn.style.visibility = 'visible';
    backBtn.onclick = () => showShopDetail(shopId);
    fabBtn.style.display = 'none';

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(16, 185, 129, 0.15); color: #34D399;">
                    ${Icons.wallet}
                </div>
                <div>
                    <div class="form-card__title">To'lov qabul qilish</div>
                    <div class="form-card__desc">${currentDebt > 0 ? `Joriy qarz: <strong style="color:var(--color-debt); font-variant-numeric:tabular-nums;">${formatMoney(currentDebt)}</strong>` : 'Qarzdorlik yo\'q'}</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="paymentAmountInput">
                    <span class="label-icon">${Icons.money}</span>
                    <span>To'lov summasi</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="text" 
                               inputmode="numeric" 
                               class="form-input money-input" 
                               id="paymentAmountInput" 
                               placeholder="0" 
                               autofocus
                               oninput="onMoneyInputChange(this, 'paymentAmountLive')">
                        <span class="money-suffix">so'm</span>
                    </div>
                    <div class="money-live-container" id="paymentAmountLive" style="display:none;"></div>
                </div>
                
                <div class="quick-chips-row">
                    ${currentDebt > 0 ? `
                        <button type="button" class="preset-chip preset-chip--accent" onclick="setMoneyInputValue('paymentAmountInput', ${currentDebt}, 'paymentAmountLive')">To'liq qarz (${formatMoney(currentDebt)})</button>
                    ` : ''}
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('paymentAmountInput', 100000, 'paymentAmountLive')">+100 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('paymentAmountInput', 200000, 'paymentAmountLive')">+200 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('paymentAmountInput', 500000, 'paymentAmountLive')">+500 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('paymentAmountInput', 1000000, 'paymentAmountLive')">+1 mln</button>
                    <button type="button" class="preset-chip preset-chip--clear" onclick="clearMoneyInput('paymentAmountInput', 'paymentAmountLive')">Tozalash</button>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="paymentMethodInput">
                    <span class="label-icon">${Icons.wallet}</span>
                    <span>To'lov usuli</span>
                </label>
                <select class="form-select" id="paymentMethodInput">
                    <option value="NAQD">NAQD (qo'lma-qo'l)</option>
                    <option value="KARTA">KARTA (Click / O'tkazma)</option>
                </select>
            </div>

            <div class="form-group" style="margin-top: 22px;">
                <button class="btn btn--primary btn--full" id="submitPaymentBtn" onclick="submitPayment(${shopId})">
                    ${Icons.check} To'lovni saqlash
                </button>
            </div>
        </div>
    `;
}

function setPaymentPreset(amount) {
    setMoneyInputValue('paymentAmountInput', amount, 'paymentAmountLive');
}

async function submitPayment(shopId) {
    const amount = parseMoney(document.getElementById('paymentAmountInput').value);
    const method = document.getElementById('paymentMethodInput').value;

    if (!amount || amount <= 0) {
        showToast('To\'g\'ri summa kiriting', 'error');
        return;
    }

    const btn = document.getElementById('submitPaymentBtn');
    btn.disabled = true;
    btn.innerHTML = 'Saqlanmoqda...';

    try {
        await apiPost('/payments', { shopId, amount, method });
        showToast('To\'lov qabul qilindi', 'success');
        showShopDetail(shopId);
    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = 'To\'lovni saqlash';
        showToast('Xatolik: ' + err.message, 'error');
    }
}

// Pastki navigatsiya holatini o'zgartirish
function setActiveNav(tab) {
    document.getElementById('navBozorlar').classList.toggle('active', tab === 'bozorlar');
    document.getElementById('navMahsulotlar').classList.toggle('active', tab === 'mahsulotlar');
    document.getElementById('navDashboard').classList.toggle('active', tab === 'dashboard');
}

function goToTab(tab) {
    if (tab === 'bozorlar') {
        setActiveNav('bozorlar');
        showMarketGroups();
    } else if (tab === 'mahsulotlar') {
        setActiveNav('mahsulotlar');
        showProducts();
    } else if (tab === 'dashboard') {
        setActiveNav('dashboard');
        showDashboard();
    }
}

// Mahsulotlar ro'yxati
async function showProducts() {
    titleEl.textContent = 'Ombor & Mahsulotlar';
    backBtn.style.visibility = 'hidden';
    fabBtn.style.display = 'flex';
    fabBtn.onclick = showAddProductForm;

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        allProductsList = await apiGet('/products');

        contentEl.innerHTML = `
            <div class="form-group" style="padding-bottom:8px;">
                <input type="text" class="form-input" id="productSearchInput" placeholder="Mahsulot nomini qidirish..." oninput="filterProducts()">
            </div>
            <div id="productsListContainer"></div>
        `;
        renderProductRows(allProductsList);

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${err.message}</div>`;
    }
}

function renderProductRows(products) {
    const container = document.getElementById('productsListContainer');

    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state">Hech narsa topilmadi.</div>';
        return;
    }

    container.innerHTML = products.map(p => {
        const isZero = p.stockQuantity === 0;
        const isOil = p.name.toLowerCase().includes('yog');
        return `
            <div class="ledger-row" onclick="showAddStockInForm(${p.id}, '${escAttr(p.name)}')">
                <div class="ledger-row__main" style="display:flex; flex-direction:row; align-items:center; gap:12px;">
                    <div class="ledger-avatar ${isOil ? 'ledger-avatar--oil' : 'ledger-avatar--product'}">
                        ${isOil ? Icons.oil : Icons.box}
                    </div>
                    <div>
                        <div class="ledger-row__title">${escHtml(p.name)}</div>
                        <div class="ledger-row__subtitle">${escHtml(p.packageName)} · Sotish: ${formatMoney(p.sellPrice)}</div>
                    </div>
                </div>
                <div class="ledger-row__right">
                    <div class="ledger-row__amount ${isZero ? 'amount--debt' : 'amount--neutral'}">
                        ${isZero ? Icons.alertTriangle + ' ' : ''}${p.stockQuantity} ta
                    </div>
                    <button class="icon-btn" onclick="event.stopPropagation(); showEditProductForm(${p.id})" title="Tahrirlash">${Icons.edit}</button>
                    <button class="icon-btn icon-btn--danger" onclick="event.stopPropagation(); deleteProduct(${p.id})" title="O'chirish">${Icons.trash}</button>
                    <span class="chevron">${Icons.chevronRight}</span>
                </div>
            </div>
        `;
    }).join('');
}

function filterProducts() {
    const query = document.getElementById('productSearchInput').value.trim().toLowerCase();
    if (!query) {
        renderProductRows(allProductsList);
        return;
    }
    const filtered = allProductsList.filter(p => p.name.toLowerCase().includes(query));
    renderProductRows(filtered);
}

function showAddProductForm() {
    titleEl.textContent = 'Yangi mahsulot';
    backBtn.style.visibility = 'visible';
    backBtn.onclick = showProducts;
    fabBtn.style.display = 'none';

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(59, 130, 246, 0.15); color: #38BDF8;">
                    ${Icons.box}
                </div>
                <div>
                    <div class="form-card__title">Yangi mahsulot yaratish</div>
                    <div class="form-card__desc">Ombor katalogiga yangi tovar kiritish</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="pNameInput">
                    <span class="label-icon">${Icons.box}</span>
                    <span>Mahsulot nomi</span>
                </label>
                <input type="text" class="form-input" id="pNameInput" placeholder="Masalan: Shakar" autofocus>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div class="form-group">
                    <label class="form-label" for="pUnitInput">Birlik (izoh)</label>
                    <input type="text" class="form-input" id="pUnitInput" placeholder="kg, litr">
                </div>
                <div class="form-group">
                    <label class="form-label" for="pPackageInput">Qadoq turi</label>
                    <input type="text" class="form-input" id="pPackageInput" placeholder="xalta, qop">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="pUnitsPerPackageInput">1 paketda necha dona/kg</label>
                <input type="number" inputmode="decimal" class="form-input" id="pUnitsPerPackageInput" placeholder="Masalan: 50">
            </div>

            <div class="form-group">
                <label class="form-label" for="pPurchasePriceInput">
                    <span class="label-icon">${Icons.money}</span>
                    <span>Tannarx (1 paket uchun)</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="text" 
                               inputmode="numeric" 
                               class="form-input money-input" 
                               id="pPurchasePriceInput" 
                               placeholder="0" 
                               oninput="onMoneyInputChange(this, 'pPurchasePriceLive')">
                        <span class="money-suffix">so'm</span>
                    </div>
                    <div class="money-live-container" id="pPurchasePriceLive" style="display:none;"></div>
                </div>
                <div class="quick-chips-row">
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pPurchasePriceInput', 10000, 'pPurchasePriceLive')">+10 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pPurchasePriceInput', 50000, 'pPurchasePriceLive')">+50 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pPurchasePriceInput', 100000, 'pPurchasePriceLive')">+100 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pPurchasePriceInput', 500000, 'pPurchasePriceLive')">+500 ming</button>
                    <button type="button" class="preset-chip preset-chip--clear" onclick="clearMoneyInput('pPurchasePriceInput', 'pPurchasePriceLive')">Tozalash</button>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="pSellPriceInput">
                    <span class="label-icon">${Icons.money}</span>
                    <span>Sotish narxi (1 paket uchun)</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="text" 
                               inputmode="numeric" 
                               class="form-input money-input" 
                               id="pSellPriceInput" 
                               placeholder="0" 
                               oninput="onMoneyInputChange(this, 'pSellPriceLive')">
                        <span class="money-suffix">so'm</span>
                    </div>
                    <div class="money-live-container" id="pSellPriceLive" style="display:none;"></div>
                </div>
                <div class="quick-chips-row">
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pSellPriceInput', 10000, 'pSellPriceLive')">+10 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pSellPriceInput', 50000, 'pSellPriceLive')">+50 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pSellPriceInput', 100000, 'pSellPriceLive')">+100 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pSellPriceInput', 500000, 'pSellPriceLive')">+500 ming</button>
                    <button type="button" class="preset-chip preset-chip--clear" onclick="clearMoneyInput('pSellPriceInput', 'pSellPriceLive')">Tozalash</button>
                </div>
            </div>

            <div class="form-group" style="margin-top: 24px;">
                <button class="btn btn--primary btn--full" id="submitProductBtn" onclick="submitProduct()">
                    ${Icons.check} Mahsulotni saqlash
                </button>
            </div>
        </div>
    `;
}

async function submitProduct() {
    const name = document.getElementById('pNameInput').value.trim();
    const unit = document.getElementById('pUnitInput').value.trim();
    const packageName = document.getElementById('pPackageInput').value.trim();
    const unitsPerPackage = parseFloat(document.getElementById('pUnitsPerPackageInput').value) || null;
    const purchasePrice = parseMoney(document.getElementById('pPurchasePriceInput').value);
    const sellPrice = parseMoney(document.getElementById('pSellPriceInput').value);

    if (!name || !packageName || !purchasePrice || !sellPrice) {
        showToast('Barcha majburiy maydonlarni to\'ldiring', 'error');
        return;
    }

    const btn = document.getElementById('submitProductBtn');
    btn.disabled = true;

    try {
        await apiPost('/products', { name, unit, packageName, unitsPerPackage, purchasePrice, sellPrice });
        showToast('Mahsulot muvaffaqiyatli saqlandi', 'success');
        showProducts();
    } catch (err) {
        btn.disabled = false;
        showToast('Xatolik: ' + err.message, 'error');
    }
}

// Zaxira to'ldirish (Kirim) formasi
function showAddStockInForm(productId, productName) {
    titleEl.textContent = `Kirim: ${productName}`;
    backBtn.style.visibility = 'visible';
    backBtn.onclick = showProducts;
    fabBtn.style.display = 'none';

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(59, 130, 246, 0.15); color: #38BDF8;">
                    ${Icons.box}
                </div>
                <div>
                    <div class="form-card__title">${escHtml(productName)}</div>
                    <div class="form-card__desc">Omborga yangi tovar kirimi</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="stockPackageCountInput">
                    <span class="label-icon">${Icons.box}</span>
                    <span>Necha paket olindi</span>
                </label>
                <div class="quantity-input-box">
                    <input type="number" inputmode="numeric" class="form-input" id="stockPackageCountInput" placeholder="Masalan: 40" autofocus min="1">
                </div>
                <div class="quick-chips-row">
                    <button type="button" class="preset-chip" onclick="addQtyToInput('stockPackageCountInput', 5)">+5</button>
                    <button type="button" class="preset-chip" onclick="addQtyToInput('stockPackageCountInput', 10)">+10</button>
                    <button type="button" class="preset-chip" onclick="addQtyToInput('stockPackageCountInput', 20)">+20</button>
                    <button type="button" class="preset-chip" onclick="addQtyToInput('stockPackageCountInput', 50)">+50</button>
                    <button type="button" class="preset-chip" onclick="addQtyToInput('stockPackageCountInput', 100)">+100</button>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="stockTotalCostInput">
                    <span class="label-icon">${Icons.money}</span>
                    <span>Umumiy to'langan summa</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="text" 
                               inputmode="numeric" 
                               class="form-input money-input" 
                               id="stockTotalCostInput" 
                               placeholder="0" 
                               oninput="onMoneyInputChange(this, 'stockTotalCostLive')">
                        <span class="money-suffix">so'm</span>
                    </div>
                    <div class="money-live-container" id="stockTotalCostLive" style="display:none;"></div>
                </div>
                <div class="quick-chips-row">
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('stockTotalCostInput', 100000, 'stockTotalCostLive')">+100 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('stockTotalCostInput', 500000, 'stockTotalCostLive')">+500 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('stockTotalCostInput', 1000000, 'stockTotalCostLive')">+1 mln</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('stockTotalCostInput', 5000000, 'stockTotalCostLive')">+5 mln</button>
                    <button type="button" class="preset-chip preset-chip--clear" onclick="clearMoneyInput('stockTotalCostInput', 'stockTotalCostLive')">Tozalash</button>
                </div>
            </div>

            <div class="form-group" style="margin-top: 22px;">
                <button class="btn btn--primary btn--full" id="submitStockInBtn" onclick="submitStockIn(${productId})">
                    ${Icons.check} Kirimni saqlash
                </button>
            </div>
        </div>
    `;
}

async function submitStockIn(productId) {
    const packageCount = parseInt(document.getElementById('stockPackageCountInput').value);
    const totalCost = parseMoney(document.getElementById('stockTotalCostInput').value);

    if (!packageCount || !totalCost) {
        showToast('Barcha maydonlarni to\'ldiring', 'error');
        return;
    }

    const btn = document.getElementById('submitStockInBtn');
    btn.disabled = true;

    try {
        await apiPost('/stock-in', { productId, packageCount, totalCost });
        showToast('Kirim muvaffaqiyatli saqlandi!', 'success');
        showProducts();
    } catch (err) {
        btn.disabled = false;
        showToast('Xatolik: ' + err.message, 'error');
    }
}

// Hisobot (Dashboard)
let dashboardTab = 'umumiy';

async function showDashboard() {
    titleEl.textContent = 'Hisobot';
    backBtn.style.visibility = 'hidden';
    fabBtn.style.display = 'none';
    dashboardTab = 'umumiy';
    renderDashboardTabs();
}

function renderDashboardTabs() {
    contentEl.innerHTML = `
    <div class="tab-bar">
      <button class="tab-btn ${dashboardTab === 'umumiy' ? 'active' : ''}" onclick="switchDashboardTab('umumiy')">Umumiy qarz</button>
      <button class="tab-btn ${dashboardTab === 'kunlik' ? 'active' : ''}" onclick="switchDashboardTab('kunlik')">Kunlik</button>
      <button class="tab-btn ${dashboardTab === 'oylik' ? 'active' : ''}" onclick="switchDashboardTab('oylik')">Oylik</button>
      <button class="tab-btn ${dashboardTab === 'oraliq' ? 'active' : ''}" onclick="switchDashboardTab('oraliq')">Oraliq</button>
    </div>
    <div id="dashboardContent"><div class="loading"><div class="spinner"></div></div></div>
  `;
    loadDashboardTabContent();
}

function switchDashboardTab(tab) {
    dashboardTab = tab;
    renderDashboardTabs();
}

async function loadDashboardTabContent() {
    const el = document.getElementById('dashboardContent');
    try {
        if (dashboardTab === 'umumiy') {
            const [summary, overdueShops] = await Promise.all([
                apiGet('/dashboard/summary'),
                apiGet('/shops/overdue?days=14')
            ]);
            el.innerHTML = renderSummaryHtml(summary, overdueShops);
        } else if (dashboardTab === 'kunlik') {
            renderDailyPicker(el);
        } else if (dashboardTab === 'oylik') {
            renderMonthlyPicker(el);
        } else if (dashboardTab === 'oraliq') {
            renderRangePicker(el);
        }
    } catch (err) {
        el.innerHTML = `<div class="empty-state">Xatolik: ${err.message}</div>`;
    }
}

function renderSummaryHtml(summary, overdueShops) {
    let lowStockHtml = '';
    if (summary.lowStockProducts && summary.lowStockProducts.length > 0) {
        lowStockHtml = `
      <div class="section-title">${Icons.alertTriangle} Kam qolgan mahsulotlar</div>
      ${summary.lowStockProducts.map(p => `
        <div class="ledger-row" style="cursor:default;">
          <div class="ledger-row__main"><div class="ledger-row__title">${p.productName}</div></div>
          <div class="ledger-row__amount amount--debt">${p.stockQuantity} ta</div>
        </div>
      `).join('')}
    `;
    }

    let overdueHtml = '';
    if (overdueShops && overdueShops.length > 0) {
        overdueHtml = `
      <div class="section-title" style="color: var(--color-debt);">${Icons.badgeDebt} Uzoq to'lamagan do'konlar</div>
      ${overdueShops.map(s => `
        <div class="ledger-row" onclick="currentGroupId=null; currentGroupName=''; showShopDetail(${s.shopId})">
          <div class="ledger-row__main">
            <div class="ledger-row__title">${s.shopName}</div>
            <div class="ledger-row__subtitle">${s.daysSinceLastPayment} kundan beri to'lanmagan</div>
          </div>
          <div class="ledger-row__amount amount--debt">${formatMoney(s.currentDebt)}</div>
        </div>
      `).join('')}
    `;
    }

    return `
    <div class="stat-card" style="margin-bottom: 12px; text-align:center; padding:24px;">
      <div class="stat-card__label" style="text-transform:uppercase; letter-spacing:0.5px; font-size:12px;">Jami umumiy qarz</div>
      <div class="stat-card__value" style="color: var(--color-debt); font-size: 30px; margin-top:6px;">${formatMoney(summary.totalDebtAllShops)}</div>
    </div>
    <div class="form-group">
      <button class="btn btn--primary btn--full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;" onclick="showDebtorShopsList()">${Icons.wallet} Qarzdor do'konlar</button>
    </div>
    ${overdueHtml}
    ${lowStockHtml}
  `;
}

function renderDailyPicker(el) {
    const today = getLocalDateString();
    el.innerHTML = `
    <div class="form-group">
      <label class="form-label">Sanani tanlang</label>
      <input type="date" class="form-input" id="dailyDateInput" value="${today}" onchange="loadDailyReport()">
    </div>
    <div id="dailyReportResult"></div>
  `;
    loadDailyReport();
}

async function loadDailyReport() {
    const date = document.getElementById('dailyDateInput').value;
    const resultEl = document.getElementById('dailyReportResult');
    resultEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        const report = await apiGet(`/reports/daily?date=${date}`);
        resultEl.innerHTML = renderDailyReportHtml(report);
    } catch (err) {
        resultEl.innerHTML = `<div class="empty-state">Xatolik: ${err.message}</div>`;
    }
}

function renderDailyReportHtml(report) {
    const revenue = report.revenueByType || {};
    const totalSalesForDay = report.sales.reduce((sum, s) => sum + s.amount, 0);

    const salesHtml = report.sales.length ? report.sales.map(s => `
    <div class="ledger-row" style="cursor:default;">
      <div class="ledger-row__main">
        <div class="ledger-row__title">${s.shopName}</div>
        <div class="ledger-row__subtitle">${s.paymentType}</div>
      </div>
      <div class="ledger-row__amount amount--debt">${formatMoney(s.amount)}</div>
    </div>
  `).join('') : '<div class="empty-state">Bu kuni sotuv bo\'lmagan</div>';

    const paymentsHtml = report.payments.length ? report.payments.map(p => `
    <div class="ledger-row" style="cursor:default;">
      <div class="ledger-row__main"><div class="ledger-row__title">${p.shopName}</div></div>
      <div class="ledger-row__amount amount--paid">${formatMoney(p.amount)}</div>
    </div>
  `).join('') : '<div class="empty-state">Bu kuni to\'lov bo\'lmagan</div>';

    const stockInHtml = report.stockIns && report.stockIns.length ? report.stockIns.map(s => `
    <div class="ledger-row" style="cursor:default;">
      <div class="ledger-row__main">
        <div class="ledger-row__title">${s.productName}</div>
        <div class="ledger-row__subtitle">${s.packageCount} paket</div>
      </div>
      <div class="ledger-row__amount amount--debt">${formatMoney(s.totalCost)}</div>
    </div>
  `).join('') : '<div class="empty-state">Bu kuni kirim bo\'lmagan</div>';

    return `
    <div class="form-group">
      <button class="btn btn--primary btn--full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;" onclick="downloadDailyExcel()">${Icons.download} Excel'ga yuklab olish</button>
    </div>

   <div class="stat-grid">
  <div class="stat-card">
    <div class="stat-card__label">Kunlik savdo</div>
    <div class="stat-card__value" style="font-size:18px;">${formatMoney(totalSalesForDay)}</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">Kunlik sof foyda</div>
    <div class="stat-card__value" style="color:var(--color-paid); font-size:18px;">${formatMoney(report.dailyProfit)}</div>
  </div>
</div>
<div class="stat-card" style="margin-bottom:12px;">
  <div class="stat-card__label">Bugungi xarajat (kirim)</div>
  <div class="stat-card__value" style="color:var(--color-debt); font-size:18px;">${formatMoney(report.totalStockInCost)}</div>
</div>

    <div class="stat-card" style="margin-bottom:12px;">
      <div class="stat-card__label" style="margin-bottom:10px;">Tushum (to'lov turi bo'yicha)</div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--color-line);">
        <span>NAQD</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.NAQD || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--color-line);">
        <span>KARTA</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.KARTA || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0;">
        <span>NASIYA</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.NASIYA || 0)}</span>
      </div>
    </div>

    <div class="section-title">${Icons.box} Kimga sotildi</div>
    ${salesHtml}

    <div class="section-title">${Icons.money} Kimdan olindi</div>
    ${paymentsHtml}

    <div class="section-title">${Icons.cart} Bazadan kirim</div>
    ${stockInHtml}
  `;
}

function renderMonthlyPicker(el) {
    const currentMonth = getLocalMonthString();
    el.innerHTML = `
    <div class="form-group">
      <label class="form-label">Oyni tanlang</label>
      <input type="month" class="form-input" id="monthlyInput" value="${currentMonth}" onchange="loadMonthlyReport()">
    </div>
    <div id="monthlyReportResult"></div>
  `;
    loadMonthlyReport();
}

async function loadMonthlyReport() {
    const month = document.getElementById('monthlyInput').value;
    const resultEl = document.getElementById('monthlyReportResult');
    resultEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        const report = await apiGet(`/reports/monthly?month=${month}`);
        resultEl.innerHTML = renderMonthlyReportHtml(report);
    } catch (err) {
        resultEl.innerHTML = `<div class="empty-state">Xatolik: ${err.message}</div>`;
    }
}

function renderMonthlyReportHtml(report) {
    const revenue = report.revenueByType || {};

    const productVolHtml = report.productSalesVolume.length ? report.productSalesVolume.map(p => `
    <div class="ledger-row" style="cursor:default;">
      <div class="ledger-row__main"><div class="ledger-row__title">${p.productName}</div></div>
      <div class="ledger-row__amount amount--neutral">${p.totalPackagesSold} ta</div>
    </div>
  `).join('') : '<div class="empty-state">Ma\'lumot yo\'q</div>';

    const stockInVolHtml = report.stockInVolume && report.stockInVolume.length ? report.stockInVolume.map(s => `
  <div class="ledger-row" style="cursor:default;">
    <div class="ledger-row__main"><div class="ledger-row__title">${s.productName}</div></div>
    <div class="ledger-row__amount amount--debt">${s.totalPackagesReceived} ta</div>
  </div>
`).join('') : '<div class="empty-state">Ma\'lumot yo\'q</div>';

    return `
<div class="form-group">
  <button class="btn btn--primary btn--full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;" onclick="downloadMonthlyExcel()">${Icons.download} Excel'ga yuklab olish</button>
</div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-card__label">Oylik sotuv</div>
        <div class="stat-card__value" style="font-size:18px;">${formatMoney(report.totalSalesAmount)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Oylik sof foyda</div>
        <div class="stat-card__value" style="color:var(--color-paid); font-size:18px;">${formatMoney(report.totalProfit)}</div>
      </div>
    </div>
    
    <div class="stat-card" style="margin-bottom:12px;">
  <div class="stat-card__label">Bazadan xarajat (kirim)</div>
  <div class="stat-card__value" style="color:var(--color-debt); font-size:18px;">${formatMoney(report.totalStockInCost)}</div>
</div>
    
    <div class="stat-card" style="margin-bottom:12px;">
  <div class="stat-card__label" style="margin-bottom:10px;">Tushum (to'lov turi bo'yicha)</div>
  <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--color-line);">
    <span>NAQD</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.NAQD || 0)}</span>
  </div>
  <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--color-line);">
    <span>KARTA</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.KARTA || 0)}</span>
  </div>
  <div style="display:flex; justify-content:space-between; padding:6px 0;">
    <span>NASIYA</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.NASIYA || 0)}</span>
  </div>
</div>

<div class="section-title">${Icons.cart} Bazadan kirim (mahsulot bo'yicha)</div>
${stockInVolHtml}
  

    <div class="section-title">${Icons.chart} Mahsulot bo'yicha sotuv</div>
    ${productVolHtml}
  `;



}


function showEditMarketGroupForm(id, currentName) {
    titleEl.textContent = 'Toifani tahrirlash';
    backBtn.style.visibility = 'visible';
    backBtn.onclick = showMarketGroups;
    fabBtn.style.display = 'none';

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(59, 130, 246, 0.15); color: #38BDF8;">
                    ${Icons.market}
                </div>
                <div>
                    <div class="form-card__title">${escHtml(currentName)}</div>
                    <div class="form-card__desc">Toifa yoki bozor nomini o'zgartirish</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="groupNameInput">
                    <span class="label-icon">${Icons.market}</span>
                    <span>Toifa yoki bozor nomi</span>
                </label>
                <input type="text" class="form-input" id="groupNameInput" value="${escAttr(currentName)}">
            </div>
            <div class="form-group" style="margin-top: 24px;">
                <button class="btn btn--primary btn--full" onclick="submitEditMarketGroup(${id})">
                    ${Icons.check} O'zgarishlarni saqlash
                </button>
            </div>
        </div>
    `;
}

async function submitEditMarketGroup(id) {
    const name = document.getElementById('groupNameInput').value.trim();
    if (!name) {
        showToast('Nomini kiriting', 'error');
        return;
    }
    try {
        await apiPut(`/market-groups/${id}`, { name });
        showToast('Toifa nomi yangilandi', 'success');
        showMarketGroups();
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
    }
}

async function deleteMarketGroup(id) {
    if (!confirm('Rostdan ham shu toifani o\'chirmoqchimisiz? Ichidagi do\'konlar ham ta\'sirlanishi mumkin.')) {
        return;
    }
    try {
        await apiDelete(`/market-groups/${id}`);
        showToast('Toifa muvaffaqiyatli o\'chirildi', 'success');
        showMarketGroups();
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
    }
}


function showEditShopForm(id, name, ownerName, phone) {
    titleEl.textContent = 'Do\'konni tahrirlash';
    backBtn.style.visibility = 'visible';
    backBtn.onclick = () => showShops(currentGroupId, currentGroupName);
    fabBtn.style.display = 'none';

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(59, 130, 246, 0.15); color: #38BDF8;">
                    ${Icons.market}
                </div>
                <div>
                    <div class="form-card__title">${escHtml(name)}</div>
                    <div class="form-card__desc">Do'kon ma'lumotlarini tahrirlash</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="shopNameInput">
                    <span class="label-icon">${Icons.market}</span>
                    <span>Do'kon nomi</span>
                </label>
                <input type="text" class="form-input" id="shopNameInput" value="${escAttr(name)}">
            </div>
            <div class="form-group">
                <label class="form-label" for="ownerNameInput">
                    <span class="label-icon">${Icons.user}</span>
                    <span>Egasining ismi</span>
                </label>
                <input type="text" class="form-input" id="ownerNameInput" value="${escAttr(ownerName)}">
            </div>
            <div class="form-group">
                <label class="form-label" for="phoneInput">
                    <span class="label-icon">${Icons.phoneAction}</span>
                    <span>Telefon raqami</span>
                </label>
                <input type="tel" class="form-input" id="phoneInput" value="${escAttr(phone)}">
            </div>
            <div class="form-group" style="margin-top: 24px;">
                <button class="btn btn--primary btn--full" onclick="submitEditShop(${id})">
                    ${Icons.check} O'zgarishlarni saqlash
                </button>
            </div>
        </div>
    `;
}

async function submitEditShop(id) {
    const name = document.getElementById('shopNameInput').value.trim();
    const ownerName = document.getElementById('ownerNameInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();

    if (!name) {
        showToast('Do\'kon nomini kiriting', 'error');
        return;
    }

    try {
        await apiPut(`/shops/${id}`, { name, ownerName, phone, marketGroupId: currentGroupId });
        showToast('Do\'kon ma\'lumotlari yangilandi', 'success');
        showShops(currentGroupId, currentGroupName);
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
    }
}

async function deleteShop(id) {
    if (!confirm('Rostdan ham shu do\'konni o\'chirmoqchimisiz? Uning butun tarixi (sotuv/to\'lov) ham ta\'sirlanadi.')) {
        return;
    }
    try {
        await apiDelete(`/shops/${id}`);
        showToast('Do\'kon muvaffaqiyatli o\'chirildi', 'success');
        showShops(currentGroupId, currentGroupName);
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
    }
}

async function showEditProductForm(id) {
    titleEl.textContent = 'Mahsulotni tahrirlash';
    backBtn.style.visibility = 'visible';
    backBtn.onclick = showProducts;
    fabBtn.style.display = 'none';

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const p = await apiGet(`/products/${id}`);

        contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(59, 130, 246, 0.15); color: #38BDF8;">
                    ${Icons.box}
                </div>
                <div>
                    <div class="form-card__title">${escHtml(p.name)}</div>
                    <div class="form-card__desc">Mahsulot narxi va ma'lumotlarini tahrirlash</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="pNameInput">
                    <span class="label-icon">${Icons.box}</span>
                    <span>Mahsulot nomi</span>
                </label>
                <input type="text" class="form-input" id="pNameInput" value="${escAttr(p.name)}">
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div class="form-group">
                    <label class="form-label" for="pUnitInput">Birlik (izoh)</label>
                    <input type="text" class="form-input" id="pUnitInput" value="${escAttr(p.unit || '')}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="pPackageInput">Qadoq turi</label>
                    <input type="text" class="form-input" id="pPackageInput" value="${escAttr(p.packageName || '')}">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="pUnitsPerPackageInput">1 paketda necha dona/kg</label>
                <input type="number" inputmode="decimal" class="form-input" id="pUnitsPerPackageInput" value="${p.unitsPerPackage || ''}">
            </div>

            <div class="form-group">
                <label class="form-label" for="pPurchasePriceInput">
                    <span class="label-icon">${Icons.money}</span>
                    <span>Tannarx (1 paket uchun)</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="text" 
                               inputmode="numeric" 
                               class="form-input money-input" 
                               id="pPurchasePriceInput" 
                               value="${formatNumberWithSpaces(p.purchasePrice)}" 
                               oninput="onMoneyInputChange(this, 'pPurchasePriceLive')">
                        <span class="money-suffix">so'm</span>
                    </div>
                    <div class="money-live-container" id="pPurchasePriceLive">
                        <span class="live-preview-pill">
                            <span class="live-preview-val">${formatMoney(p.purchasePrice)}</span>
                            <span class="live-preview-words">(${formatMoneyWords(p.purchasePrice)})</span>
                        </span>
                    </div>
                </div>
                <div class="quick-chips-row">
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pPurchasePriceInput', 10000, 'pPurchasePriceLive')">+10 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pPurchasePriceInput', 50000, 'pPurchasePriceLive')">+50 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pPurchasePriceInput', 100000, 'pPurchasePriceLive')">+100 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pPurchasePriceInput', 500000, 'pPurchasePriceLive')">+500 ming</button>
                    <button type="button" class="preset-chip preset-chip--clear" onclick="clearMoneyInput('pPurchasePriceInput', 'pPurchasePriceLive')">Tozalash</button>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="pSellPriceInput">
                    <span class="label-icon">${Icons.money}</span>
                    <span>Sotish narxi (1 paket uchun)</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="text" 
                               inputmode="numeric" 
                               class="form-input money-input" 
                               id="pSellPriceInput" 
                               value="${formatNumberWithSpaces(p.sellPrice)}" 
                               oninput="onMoneyInputChange(this, 'pSellPriceLive')">
                        <span class="money-suffix">so'm</span>
                    </div>
                    <div class="money-live-container" id="pSellPriceLive">
                        <span class="live-preview-pill">
                            <span class="live-preview-val">${formatMoney(p.sellPrice)}</span>
                            <span class="live-preview-words">(${formatMoneyWords(p.sellPrice)})</span>
                        </span>
                    </div>
                </div>
                <div class="quick-chips-row">
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pSellPriceInput', 10000, 'pSellPriceLive')">+10 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pSellPriceInput', 50000, 'pSellPriceLive')">+50 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pSellPriceInput', 100000, 'pSellPriceLive')">+100 ming</button>
                    <button type="button" class="preset-chip" onclick="addMoneyToInput('pSellPriceInput', 500000, 'pSellPriceLive')">+500 ming</button>
                    <button type="button" class="preset-chip preset-chip--clear" onclick="clearMoneyInput('pSellPriceInput', 'pSellPriceLive')">Tozalash</button>
                </div>
            </div>

            <div class="form-group" style="margin-top: 24px;">
                <button class="btn btn--primary btn--full" onclick="submitEditProduct(${id})">
                    ${Icons.check} O'zgarishlarni saqlash
                </button>
            </div>
        </div>
    `;
    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${err.message}</div>`;
    }
}

async function submitEditProduct(id) {
    const name = document.getElementById('pNameInput').value.trim();
    const unit = document.getElementById('pUnitInput').value.trim();
    const packageName = document.getElementById('pPackageInput').value.trim();
    const unitsPerPackage = parseFloat(document.getElementById('pUnitsPerPackageInput').value) || null;
    const purchasePrice = parseMoney(document.getElementById('pPurchasePriceInput').value);
    const sellPrice = parseMoney(document.getElementById('pSellPriceInput').value);

    if (!name || !packageName || !purchasePrice || !sellPrice) {
        showToast('Barcha majburiy maydonlarni to\'ldiring', 'error');
        return;
    }

    try {
        await apiPut(`/products/${id}`, { name, unit, packageName, unitsPerPackage, purchasePrice, sellPrice });
        showToast('Mahsulot muvaffaqiyatli saqlandi', 'success');
        showProducts();
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Rostdan ham shu mahsulotni o\'chirmoqchimisiz?')) {
        return;
    }
    try {
        await apiDelete(`/products/${id}`);
        showProducts();
    } catch (err) {
        alert('Xatolik: ' + err.message);
    }
}


function renderRangePicker(el) {
    const today = getLocalDateString();
    const weekAgoDate = new Date();
    weekAgoDate.setDate(weekAgoDate.getDate() - 7);
    const weekAgo = getLocalDateString(weekAgoDate);
    el.innerHTML = `
    <div class="form-group" style="display:flex; gap:10px;">
      <div style="flex:1;">
        <label class="form-label">Boshlanish sanasi</label>
        <input type="date" class="form-input" id="rangeStartInput" value="${weekAgo}" onchange="loadRangeReport()">
      </div>
      <div style="flex:1;">
        <label class="form-label">Tugash sanasi</label>
        <input type="date" class="form-input" id="rangeEndInput" value="${today}" onchange="loadRangeReport()">
      </div>
    </div>
    <div id="rangeReportResult"></div>
  `;
    loadRangeReport();
}

async function loadRangeReport() {
    const start = document.getElementById('rangeStartInput').value;
    const end = document.getElementById('rangeEndInput').value;
    const resultEl = document.getElementById('rangeReportResult');
    resultEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        const report = await apiGet(`/reports/range?start=${start}&end=${end}`);
        resultEl.innerHTML = renderRangeReportHtml(report);
    } catch (err) {
        resultEl.innerHTML = `<div class="empty-state">Xatolik: ${err.message}</div>`;
    }
}

function renderRangeReportHtml(report) {
    const revenue = report.revenueByType || {};


    const stockInVolHtml = report.stockInVolume && report.stockInVolume.length ? report.stockInVolume.map(s => `
  <div class="ledger-row" style="cursor:default;">
    <div class="ledger-row__main"><div class="ledger-row__title">${s.productName}</div></div>
    <div class="ledger-row__amount amount--debt">${s.totalPackagesReceived} ta</div>
  </div>
`).join('') : '<div class="empty-state">Ma\'lumot yo\'q</div>';



    const productVolHtml = report.productSalesVolume.length ? report.productSalesVolume.map(p => `
    <div class="ledger-row" style="cursor:default;">
      <div class="ledger-row__main"><div class="ledger-row__title">${p.productName}</div></div>
      <div class="ledger-row__amount amount--neutral">${p.totalPackagesSold} ta</div>
    </div>
  `).join('') : '<div class="empty-state">Ma\'lumot yo\'q</div>';

    return `
<div class="form-group">
  <button class="btn btn--primary btn--full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;" onclick="downloadRangeExcel()">${Icons.download} Excel'ga yuklab olish</button>
</div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-card__label">Umumiy sotuv</div>
        <div class="stat-card__value" style="font-size:18px;">${formatMoney(report.totalSalesAmount)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Umumiy sof foyda</div>
        <div class="stat-card__value" style="color:var(--color-paid); font-size:18px;">${formatMoney(report.totalProfit)}</div>
      </div>
    </div>
    
    <div class="stat-card" style="margin-bottom:12px;">
  <div class="stat-card__label">Bazadan xarajat (kirim)</div>
  <div class="stat-card__value" style="color:var(--color-debt); font-size:18px;">${formatMoney(report.totalStockInCost)}</div>
</div>

    <div class="stat-card" style="margin-bottom:12px;">
      <div class="stat-card__label" style="margin-bottom:10px;">Tushum (to'lov turi bo'yicha)</div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--color-line);">
        <span>NAQD</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.NAQD || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--color-line);">
        <span>KARTA</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.KARTA || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0;">
        <span>NASIYA</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.NASIYA || 0)}</span>
      </div>
    </div>
    
    
    <div class="section-title">${Icons.cart} Bazadan kirim (mahsulot bo'yicha)</div>
${stockInVolHtml}

   

    <div class="section-title">${Icons.chart} Mahsulot bo'yicha sotuv</div>
    ${productVolHtml}
  `;
}

function downloadDailyExcel() {
    const date = document.getElementById('dailyDateInput').value;
    window.location.href = `${API_BASE}/reports/daily/export?date=${date}`;
}

function downloadMonthlyExcel() {
    const month = document.getElementById('monthlyInput').value;
    window.location.href = `${API_BASE}/reports/monthly/export?month=${month}`;
}

function downloadRangeExcel() {
    const start = document.getElementById('rangeStartInput').value;
    const end = document.getElementById('rangeEndInput').value;
    window.location.href = `${API_BASE}/reports/range/export?start=${start}&end=${end}`;
}
async function showDebtorShopsList() {
    titleEl.textContent = 'Qarzdor do\'konlar';
    backBtn.style.visibility = 'visible';
    backBtn.onclick = () => { dashboardTab = 'umumiy'; showDashboard(); };
    fabBtn.style.display = 'none';

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const shops = await apiGet('/shops');
        const debtors = shops.filter(s => (Number(s.currentDebt) || 0) > 0)
                             .sort((a, b) => Number(b.currentDebt) - Number(a.currentDebt));

        if (debtors.length === 0) {
            contentEl.innerHTML = '<div class="empty-state">Qarzdor do\'kon yo\'q</div>';
            return;
        }

        contentEl.innerHTML = debtors.map(shop => {
            const debt = Number(shop.currentDebt) || 0;
            return `
                <div class="shop-card" onclick="currentGroupId=${shop.marketGroupId}; currentGroupName='${escAttr(shop.marketGroupName)}'; showShopDetail(${shop.id})">
                    <div class="shop-card__top">
                        <div class="shop-card__main">
                            <div class="shop-card__title">${escHtml(shop.name)}</div>
                            <div class="shop-card__subtitle">
                                <span class="shop-card__meta">${escHtml(shop.marketGroupName || '')}</span>
                                ${shop.phone ? `<span style="opacity:0.4;">·</span><span class="shop-card__meta">${escHtml(shop.phone)}</span>` : ''}
                            </div>
                        </div>
                        <div class="shop-card__badge-wrap">
                            <div class="ledger-row__amount amount--debt">${formatMoney(debt)}</div>
                            <span class="chevron">${Icons.chevronRight}</span>
                        </div>
                    </div>
                    <div class="shop-card__actions" onclick="event.stopPropagation()">
                        <div class="shop-card__action-group">
                            ${shop.phone ? `
                                <a href="tel:${escAttr(shop.phone)}" class="action-chip action-chip--call" title="Qo'ng'iroq qilish">
                                    ${Icons.phoneAction}
                                    <span>Qo'ng'iroq</span>
                                </a>
                            ` : ''}
                            <button class="action-chip action-chip--telegram" onclick="shareShopDebt('${escAttr(shop.name)}', ${debt}, '${escAttr(shop.phone || '')}')" title="Telegramga hisob yuborish">
                                ${Icons.tgAction}
                                <span>Telegram</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function toggleShopSort() {
    if (shopSortMode === 'none' || shopSortMode === 'debtAsc') {
        setShopSort('debtDesc');
    } else {
        setShopSort('debtAsc');
    }
}
