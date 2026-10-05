const API_BASE = '/api';

const contentEl = document.getElementById('content');
const titleEl = document.getElementById('pageTitle');
const subtitleEl = document.getElementById('pageSubtitle');
const titleBadgeEl = document.getElementById('pageTitleBadge');
const backBtn = document.getElementById('backBtn');
const fabBtn = document.getElementById('fabBtn');
const pwaInstallBtn = document.getElementById('pwaInstallBtn');
const networkStatusEl = document.getElementById('networkStatus');

function updateHeaderMeta(title, subtitle = '', badge = 'PRO') {
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) {
        if (subtitle) {
            subtitleEl.style.display = 'block';
            subtitleEl.textContent = subtitle;
        } else {
            subtitleEl.style.display = 'none';
        }
    }
    if (titleBadgeEl) {
        titleBadgeEl.textContent = badge;
    }
}

let currentShopId = null;
let currentGroupId = null;
let currentGroupName = null;
let saleItems = [];
let allShopsInGroup = [];
let allProductsList = [];
let shopSortMode = 'none'; // 'none' | 'debtDesc' | 'nameAsc'
let currentLoggedInUser = 'admin';

async function fetchCurrentUserInfo() {
    try {
        const res = await apiGet('/auth/me');
        if (res && res.username) {
            currentLoggedInUser = res.username;
        }
    } catch (e) {
        console.warn('Foydalanuvchi ma\'lumotini olib bo\'lmadi:', e);
    }
}
fetchCurrentUserInfo();

function formatAdminBadge(name) {
    const user = (name && name.trim()) ? name.trim() : (currentLoggedInUser || 'admin');
    return `<span class="badge-admin" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; background:rgba(59,130,246,0.14); color:#60A5FA; border:1px solid rgba(59,130,246,0.28); padding:2px 7px; border-radius:6px; flex-shrink:0; letter-spacing:0.2px;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.9;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>${escHtml(user)}</span>
    </span>`;
}

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
    phoneApp: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line><path d="M12 7v6m-3-3l3 3 3-3"/></svg>`,
    storeFront: `<svg class="svg-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1-5h16l1 5"></path><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"></path><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"></path><path d="M9 21v-7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7"></path></svg>`,
    shopBag: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-1px; margin-right:3px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    truck: `<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
    scale: `<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"></path><rect x="4" y="7" width="16" height="2" rx="1"></rect><path d="M6 9l-3 7h6l-3-7z"></path><path d="M18 9l-3 7h6l-3-7z"></path></svg>`
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
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escJs(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
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

// ==========================================
// NATIVE MOBILE NAVIGATION & HISTORY MANAGER
// ==========================================
const Nav = {
    stack: [],
    isNavigatingHistory: false,
    activeModalCount: 0,
    lastExitPressTime: 0,
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        try {
            // Android hardware back buttonni rootda ilovani darhol yopib yubormasligi uchun sentinel o'rnatamiz
            window.history.replaceState({ navType: 'exit-sentinel' }, '');
            window.history.pushState({ navType: 'root' }, '');
        } catch (e) {
            console.warn('History API not available', e);
        }

        window.addEventListener('popstate', (e) => this.handlePopState(e));

        if (backBtn) {
            backBtn.onclick = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.goBack();
            };
        }
    },

    pushScreen(screenName, backAction) {
        if (this.isNavigatingHistory) return;

        // Agar forma saqlangandan so'ng avvalgi ekranga qaytilsa (masalan: shopDetail)
        const existingIndex = this.stack.findIndex(s => s.name === screenName);
        if (existingIndex !== -1) {
            this.stack = this.stack.slice(0, existingIndex + 1);
            this.stack[existingIndex].backAction = backAction;
            try {
                window.history.replaceState({ navType: 'screen', name: screenName }, '');
            } catch (e) {}
            return;
        }

        this.stack.push({
            name: screenName,
            backAction: backAction
        });

        try {
            window.history.pushState({ navType: 'screen', name: screenName, depth: this.stack.length }, '');
        } catch (e) {}
    },

    enterRoot(tabName = 'bozorlar') {
        if (this.isNavigatingHistory) return;

        this.stack = [];

        if (tabName !== 'bozorlar') {
            this.stack.push({
                name: 'tab-' + tabName,
                backAction: () => goToTab('bozorlar')
            });
            try {
                window.history.pushState({ navType: 'tab', name: tabName }, '');
            } catch (e) {}
        }
    },

    onModalOpen() {
        if (this.isNavigatingHistory) return;
        this.activeModalCount++;
        try {
            window.history.pushState({ navType: 'modal', count: this.activeModalCount }, '');
        } catch (e) {}
    },

    onModalClose() {
        if (this.activeModalCount > 0) {
            this.activeModalCount--;
            this.isNavigatingHistory = true;
            window.history.back();
            setTimeout(() => {
                this.isNavigatingHistory = false;
            }, 60);
        }
    },

    isAnyModalOpen() {
        const bs = document.getElementById('globalBottomSheet');
        if (bs && bs.classList.contains('show')) return true;
        const confirm = document.getElementById('globalConfirmDialog');
        if (confirm && confirm.classList.contains('show')) return true;
        const stmt = document.getElementById('statementModal');
        if (stmt && stmt.classList.contains('show')) return true;
        return false;
    },

    closeTopModal() {
        const stmt = document.getElementById('statementModal');
        if (stmt && stmt.classList.contains('show')) {
            closeStatementModal(false);
            return true;
        }
        const confirm = document.getElementById('globalConfirmDialog');
        if (confirm && confirm.classList.contains('show')) {
            closeConfirmDialog(false);
            return true;
        }
        const bs = document.getElementById('globalBottomSheet');
        if (bs && bs.classList.contains('show')) {
            closeBottomSheet(false);
            return true;
        }
        return false;
    },

    goBack() {
        if (this.isAnyModalOpen()) {
            this.onModalClose();
            return;
        }

        if (this.stack.length > 0) {
            window.history.back();
        } else {
            this.handleRootExit();
        }
    },

    handlePopState(e) {
        // 1. Agar biror modal / bottom-sheet ochiq bo'lsa, avval uni yopamiz
        if (this.isAnyModalOpen()) {
            if (this.activeModalCount > 0) this.activeModalCount--;
            this.closeTopModal();
            return;
        }

        // 2. Agar ichki bo'limlarda bo'lsak, navbatdagi oldingi bo'limga qaytamiz
        if (this.stack.length > 0) {
            const item = this.stack.pop();
            if (item && typeof item.backAction === 'function') {
                this.isNavigatingHistory = true;
                try {
                    item.backAction();
                } finally {
                    this.isNavigatingHistory = false;
                }
                return;
            }
        }

        // 3. Asosiy sahifada (Root) telfonning chiqish tugmasi bosilganda
        this.handleRootExit();
    },

    handleRootExit() {
        const now = Date.now();
        if (now - this.lastExitPressTime < 2000) {
            // 2 soniya ichida qayta bosildi -> ilovadan chiqishga ruxsat beramiz
            window.history.back();
        } else {
            this.lastExitPressTime = now;
            showToast("Ilovadan chiqish uchun yana bir marta bosing", "info");
            try {
                window.history.pushState({ navType: 'root' }, '');
            } catch (e) {}
        }
    }
};

function setBackAction(backFn, screenName = '') {
    backBtn.style.visibility = 'visible';
    backBtn.onclick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        Nav.goBack();
    };
    Nav.pushScreen(screenName, backFn);
}

function setRootScreen(tabName = 'bozorlar') {
    backBtn.style.visibility = 'hidden';
    Nav.enterRoot(tabName);
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
    Nav.onModalOpen();
}

function closeBottomSheet(popHistory = true) {
    const bs = document.getElementById('globalBottomSheet');
    if (bs && bs.classList.contains('show')) {
        bs.classList.remove('show');
        if (popHistory) Nav.onModalClose();
    }
}

// Maxsus Tasdiqlash Modali (Brauzerning xunuk confirm dialogi o'rniga)
function showConfirmDialog({
    title = "O'chirishni tasdiqlang",
    message = "Rostdan ham ushbu ma'lumotni o'chirmoqchimisiz?",
    itemName = '',
    confirmText = "O'chirish",
    cancelText = "Bekor qilish",
    icon = null,
    isDanger = true,
    htmlContent = '',
    onConfirm = () => {}
}) {
    let dialogEl = document.getElementById('globalConfirmDialog');
    if (!dialogEl) {
        dialogEl = document.createElement('div');
        dialogEl.id = 'globalConfirmDialog';
        dialogEl.className = 'confirm-overlay';
        document.body.appendChild(dialogEl);
    }

    const badgeIcon = icon || (isDanger ? Icons.trash : Icons.check);
    const badgeStyle = isDanger 
        ? 'background: rgba(239, 68, 68, 0.15); color: #F87171;' 
        : 'background: rgba(59, 130, 246, 0.15); color: #60A5FA;';
    const submitBtnStyle = isDanger
        ? ''
        : 'background: linear-gradient(135deg, #2563EB, #1D4ED8); border-color: rgba(59, 130, 246, 0.5); color: #FFF;';

    dialogEl.innerHTML = `
        <div class="confirm-backdrop" onclick="closeConfirmDialog()"></div>
        <div class="confirm-card">
            <div class="confirm-icon-wrap">
                <div class="confirm-icon-badge" style="${badgeStyle}">
                    ${badgeIcon}
                </div>
            </div>
            <div class="confirm-title">${escHtml(title)}</div>
            ${itemName ? `<div class="confirm-item-name">${escHtml(itemName)}</div>` : ''}
            <div class="confirm-message">${escHtml(message)}</div>
            ${htmlContent ? `<div style="margin: 12px 0 16px 0;">${htmlContent}</div>` : ''}
            <div class="confirm-actions">
                <button type="button" class="confirm-btn-cancel" onclick="closeConfirmDialog()">
                    ${escHtml(cancelText)}
                </button>
                <button type="button" class="confirm-btn-submit" id="confirmDialogSubmitBtn" style="${submitBtnStyle}">
                    ${badgeIcon} ${escHtml(confirmText)}
                </button>
            </div>
        </div>
    `;

    const confirmBtn = document.getElementById('confirmDialogSubmitBtn');
    confirmBtn.onclick = async () => {
        if (confirmBtn.disabled) return;
        confirmBtn.disabled = true;
        closeConfirmDialog();
        if (typeof onConfirm === 'function') {
            await onConfirm();
        }
    };

    // Animatsiya bilan ko'rsatish
    requestAnimationFrame(() => {
        dialogEl.classList.add('show');
        Nav.onModalOpen();
    });
}

function closeConfirmDialog(popHistory = true) {
    const dialogEl = document.getElementById('globalConfirmDialog');
    if (dialogEl && dialogEl.classList.contains('show')) {
        dialogEl.classList.remove('show');
        if (popHistory) Nav.onModalClose();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeConfirmDialog();
        closeBottomSheet();
    }
});

// O'ng burchakdagi Logo / Profil tugmasi bosilganda chiquvchi modal
function showAppProfileModal() {
    const now = new Date();
    const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const monthNames = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];

    const dayOfWeek = dayNames[now.getDay()];
    const dayOfMonth = now.getDate();
    const monthName = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const formattedDate = `${dayOfMonth}-${monthName}, ${year} (${dayOfWeek})`;

    showBottomSheet(`
        <div style="padding: 4px 0 10px 0;">
            <!-- Brand & User Header -->
            <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px; padding-bottom:16px; border-bottom:1px solid var(--color-line);">
                <div style="width:52px; height:52px; border-radius:16px; background:#090D16; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 22px rgba(0,0,0,0.4), 0 0 15px rgba(59,130,246,0.3); border:1px solid rgba(255,255,255,0.15); flex-shrink:0; overflow:hidden;">
                    <img src="icons/icon-v2-192.png" alt="Logo" style="width:100%; height:100%; object-fit:cover; display:block;">
                </div>
                <div style="flex:1;">
                    <div style="font-size:17.5px; font-weight:700; color:#FFF; display:flex; align-items:center; gap:7px;">
                        <span>Bozor Distributor</span>
                        <span style="font-size:10px; background:rgba(16,185,129,0.2); color:#34D399; border:1px solid rgba(16,185,129,0.4); padding:2px 6px; border-radius:6px; font-weight:700; letter-spacing:0.5px;">PRO</span>
                    </div>
                    <div style="font-size:12.5px; color:var(--color-ink-dim); margin-top:3px; display:flex; align-items:center; gap:6px;">
                        <span style="width:7px; height:7px; border-radius:50%; background:#10B981; box-shadow:0 0 6px #10B981; display:inline-block;"></span>
                        <span>Admin: <strong style="color:#FFF; font-weight:700;">${escHtml(currentLoggedInUser || 'admin')}</strong></span>
                    </div>
                </div>
            </div>

            <!-- Bugungi sana & status kartasi -->
            <div style="background:var(--color-paper-dim); border:1px solid var(--color-line); border-radius:14px; padding:12px 14px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:11px; color:var(--color-ink-dim); text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Bugungi sana</div>
                    <div style="font-size:13.5px; font-weight:700; color:#FFF; margin-top:2px;">
                        ${formattedDate}
                    </div>
                </div>
                <div style="font-size:12px; color:#34D399; font-weight:600; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.25); padding:4px 10px; border-radius:8px; display:flex; align-items:center; gap:5px;">
                    <span style="width:6px; height:6px; border-radius:50%; background:#34D399;"></span>
                    Online
                </div>
            </div>

            <!-- Tezkor amallar -->
            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
                <button class="btn" style="background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.3); color:#60A5FA; justify-content:flex-start; padding:13px 15px; font-size:14px; border-radius:14px; display:flex; align-items:center; gap:12px;" onclick="forceAppUpdate()">
                    <span style="color:#60A5FA; display:flex;">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    </span>
                    <div style="text-align:left;">
                        <div style="font-weight:700; font-size:14px; color:#FFF;">Ilovani yangilash (Keshni tozalash)</div>
                        <div style="font-size:12px; color:var(--color-ink-dim);">Eng so'nggi versiyaga majburiy o'tish</div>
                    </div>
                </button>

                <button class="btn" style="background:rgba(16,185,129,0.14); border:1px solid rgba(16,185,129,0.35); color:#34D399; justify-content:flex-start; padding:13px 15px; font-size:14px; border-radius:14px; display:flex; align-items:center; gap:12px; width:100%; box-shadow:0 4px 14px rgba(16,185,129,0.15);" onclick="downloadDatabaseExcelBackup()">
                    <span style="color:#34D399; display:flex;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </span>
                    <div style="text-align:left;">
                        <div style="font-weight:700; font-size:14.5px; color:#FFF; display:flex; align-items:center; gap:6px;">
                            <span>Bazani Excel'da yuklab olish</span>
                            <span style="font-size:10px; background:rgba(16,185,129,0.25); color:#34D399; padding:1px 5px; border-radius:4px; font-weight:700;">.XLSX</span>
                        </div>
                        <div style="font-size:11.5px; color:#A7F3D0;">Hisobot va ko'rish uchun (qayta tiklanmaydi)</div>
                    </div>
                </button>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                    <button class="btn" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:#CBD5E1; justify-content:center; padding:10px; font-size:12.5px; border-radius:12px; display:flex; align-items:center; gap:6px;" onclick="downloadDatabaseBackup()" title="Dastur uchun to'liq texnik zaxira (.json)">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>JSON zaxira</span>
                    </button>
                    <button class="btn" style="background:rgba(255,255,255,0.04); border:1px dashed rgba(255,255,255,0.18); color:#CBD5E1; justify-content:center; padding:10px; font-size:12.5px; border-radius:12px; display:flex; align-items:center; gap:6px;" onclick="triggerRestoreBackup()" title="Faqat JSON zaxira faylidan bazani qayta tiklaydi">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span>JSON'dan tiklash</span>
                    </button>
                </div>
                <input type="file" id="backupFileInput" accept=".json" style="display:none;" onchange="onBackupFileSelected(event)">

                <button class="btn" style="background:rgba(244,63,94,0.12); border:1px solid rgba(244,63,94,0.3); color:#FB7185; justify-content:center; padding:13px 16px; font-size:14px; font-weight:700; border-radius:14px; display:flex; align-items:center; gap:8px;" onclick="window.location.href='/logout'">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Tizimdan chiqish (Logout)
                </button>
            </div>

            <button class="btn btn--full" style="background:var(--color-paper-dim); color:var(--color-ink-dim); border:1px solid var(--color-line); padding:11px; border-radius:12px; font-size:13.5px;" onclick="closeBottomSheet()">Yopish</button>
        </div>
    `);
}
 
async function forceAppUpdate() {
    showToast("Ilova eng so'nggi versiyaga yangilanmoqda...", "info");
    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
        }
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                await caches.delete(name);
            }
        }
    } catch (e) {
        console.warn("Kesh tozalash xatosi:", e);
    }
    window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
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
});

// iOS Safari tekshiruvi (Add to Home Screen)
const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

async function handlePwaInstallClick() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
            showToast("Ilova muvaffaqiyatli ekranga o'rnatildi", 'success');
        }
        deferredPrompt = null;
        return;
    }
    if (isIos) {
        showIosInstallGuide();
        return;
    }
    showGeneralInstallGuide();
}

function showIosInstallGuide() {
    showBottomSheet(`
        <div style="text-align:center;">
            <div class="sheet-icon-badge" style="background: rgba(56, 189, 248, 0.15); color: #38BDF8;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
                    <path d="M12 7v6"></path>
                    <path d="M9 10l3 3 3-3"></path>
                    <circle cx="12" cy="18" r="0.8" fill="currentColor"></circle>
                </svg>
            </div>
            <div style="font-size:18px; font-weight:800; color:#FFF; margin-bottom:6px; font-family: var(--font-heading);">Ilovani ekranga chiqarish (iOS)</div>
            <div style="font-size:13px; color:var(--color-ink-dim); margin-bottom:18px;">
                Ilovadan alohida dastur kabi tezkor foydalanish uchun uni bosh ekranga qo'shing:
            </div>
            <div style="background:var(--color-paper-dim); border:1px solid var(--color-line); border-radius:var(--radius-sm); padding:14px; text-align:left; font-size:13.5px; line-height:1.6; margin-bottom:18px;">
                <div style="margin-bottom:8px;">1. Safari brauzeri pastidagi <strong>Ulashish (Share ⎋)</strong> belgisini bosing.</div>
                <div>2. Chiqqan ro'yxatdan <strong>"Bosh ekranga qo'shish (Add to Home Screen ⊞)"</strong> ni tanlang.</div>
            </div>
            <button class="btn btn--primary btn--full" onclick="closeBottomSheet()">${Icons.check} Tushunarli</button>
        </div>
    `);
}

function showGeneralInstallGuide() {
    showBottomSheet(`
        <div style="text-align:center;">
            <div class="sheet-icon-badge" style="background: rgba(56, 189, 248, 0.15); color: #38BDF8;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
                    <path d="M12 7v6"></path>
                    <path d="M9 10l3 3 3-3"></path>
                    <circle cx="12" cy="18" r="0.8" fill="currentColor"></circle>
                </svg>
            </div>
            <div style="font-size:18px; font-weight:800; color:#FFF; margin-bottom:6px; font-family: var(--font-heading);">Ilovani ekranga o'rnatish</div>
            <div style="font-size:13px; color:var(--color-ink-dim); margin-bottom:18px;">
                Dasturdan doimiy, tez va qulay foydalanish uchun telefoningiz yoki kompyuteringiz bosh ekraniga o'rnating:
            </div>
            <div style="background:var(--color-paper-dim); border:1px solid var(--color-line); border-radius:var(--radius-sm); padding:14px; text-align:left; font-size:13.5px; line-height:1.6; margin-bottom:18px;">
                <div style="margin-bottom:8px;">1. Brauzeringizning <strong>uch nuqta (⋮)</strong> menyusini oching.</div>
                <div>2. <strong>"Ilovani o'rnatish"</strong> yoki <strong>"Bosh ekranga qo'shish" (Add to Home screen)</strong> tugmasini bosing.</div>
            </div>
            <button class="btn btn--primary btn--full" onclick="closeBottomSheet()">${Icons.check} Tushunarli</button>
        </div>
    `);
}

function handleAuthRedirect(response) {
    if (response.status === 401 || response.redirected || (response.url && response.url.includes('/login.html'))) {
        window.location.href = '/login.html';
        return true;
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
        window.location.href = '/login.html';
        return true;
    }
    return false;
}

// Backend'ga so'rov yuborish yordamchilari
async function apiGet(path) {
    const response = await fetch(`${API_BASE}${path}`);
    if (handleAuthRedirect(response)) {
        return new Promise(() => {});
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || ('Server xatosi: ' + response.status));
    }
    return response.json();
}

async function apiPost(path, body) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (handleAuthRedirect(response)) {
        return new Promise(() => {});
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
    if (handleAuthRedirect(response)) {
        return new Promise(() => {});
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
    if (handleAuthRedirect(response)) {
        return new Promise(() => {});
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server xatosi');
    }
    return response.ok;
}

// ==========================================
// BOZORLAR (MARKET GROUPS - Variant 2 Fintech)
// ==========================================
const MARKET_THEMES = [
    {
        border: 'rgba(56, 189, 248, 0.28)',
        borderHover: 'rgba(56, 189, 248, 0.65)',
        glow: 'rgba(56, 189, 248, 0.18)',
        glowHover: 'rgba(56, 189, 248, 0.35)',
        avatarBg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(37, 99, 235, 0.16) 100%)',
        avatarBorder: 'rgba(56, 189, 248, 0.45)',
        avatarColor: '#38BDF8',
        avatarShadow: 'rgba(56, 189, 248, 0.3)',
        badgeBg: 'rgba(56, 189, 248, 0.12)',
        badgeBorder: 'rgba(56, 189, 248, 0.25)',
        badgeText: '#7DD3FC'
    },
    {
        border: 'rgba(52, 211, 153, 0.28)',
        borderHover: 'rgba(52, 211, 153, 0.65)',
        glow: 'rgba(52, 211, 153, 0.18)',
        glowHover: 'rgba(52, 211, 153, 0.35)',
        avatarBg: 'linear-gradient(135deg, rgba(52, 211, 153, 0.22) 0%, rgba(5, 150, 105, 0.16) 100%)',
        avatarBorder: 'rgba(52, 211, 153, 0.45)',
        avatarColor: '#34D399',
        avatarShadow: 'rgba(52, 211, 153, 0.3)',
        badgeBg: 'rgba(52, 211, 153, 0.12)',
        badgeBorder: 'rgba(52, 211, 153, 0.25)',
        badgeText: '#6EE7B7'
    },
    {
        border: 'rgba(168, 85, 247, 0.28)',
        borderHover: 'rgba(168, 85, 247, 0.65)',
        glow: 'rgba(168, 85, 247, 0.18)',
        glowHover: 'rgba(168, 85, 247, 0.35)',
        avatarBg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(124, 58, 237, 0.16) 100%)',
        avatarBorder: 'rgba(168, 85, 247, 0.45)',
        avatarColor: '#C084FC',
        avatarShadow: 'rgba(168, 85, 247, 0.3)',
        badgeBg: 'rgba(168, 85, 247, 0.12)',
        badgeBorder: 'rgba(168, 85, 247, 0.25)',
        badgeText: '#D8B4FE'
    },
    {
        border: 'rgba(251, 191, 36, 0.28)',
        borderHover: 'rgba(251, 191, 36, 0.65)',
        glow: 'rgba(251, 191, 36, 0.18)',
        glowHover: 'rgba(251, 191, 36, 0.35)',
        avatarBg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.22) 0%, rgba(217, 119, 6, 0.16) 100%)',
        avatarBorder: 'rgba(251, 191, 36, 0.45)',
        avatarColor: '#FBBF24',
        avatarShadow: 'rgba(251, 191, 36, 0.3)',
        badgeBg: 'rgba(251, 191, 36, 0.12)',
        badgeBorder: 'rgba(251, 191, 36, 0.25)',
        badgeText: '#FDE68A'
    },
    {
        border: 'rgba(244, 63, 94, 0.28)',
        borderHover: 'rgba(244, 63, 94, 0.65)',
        glow: 'rgba(244, 63, 94, 0.18)',
        glowHover: 'rgba(244, 63, 94, 0.35)',
        avatarBg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(225, 29, 72, 0.16) 100%)',
        avatarBorder: 'rgba(244, 63, 94, 0.45)',
        avatarColor: '#FB7185',
        avatarShadow: 'rgba(244, 63, 94, 0.3)',
        badgeBg: 'rgba(244, 63, 94, 0.12)',
        badgeBorder: 'rgba(244, 63, 94, 0.25)',
        badgeText: '#FDA4AF'
    },
    {
        border: 'rgba(99, 102, 241, 0.28)',
        borderHover: 'rgba(99, 102, 241, 0.65)',
        glow: 'rgba(99, 102, 241, 0.18)',
        glowHover: 'rgba(99, 102, 241, 0.35)',
        avatarBg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(79, 70, 229, 0.16) 100%)',
        avatarBorder: 'rgba(99, 102, 241, 0.45)',
        avatarColor: '#818CF8',
        avatarShadow: 'rgba(99, 102, 241, 0.3)',
        badgeBg: 'rgba(99, 102, 241, 0.12)',
        badgeBorder: 'rgba(99, 102, 241, 0.25)',
        badgeText: '#A5B4FC'
    },
    {
        border: 'rgba(20, 184, 166, 0.28)',
        borderHover: 'rgba(20, 184, 166, 0.65)',
        glow: 'rgba(20, 184, 166, 0.18)',
        glowHover: 'rgba(20, 184, 166, 0.35)',
        avatarBg: 'linear-gradient(135deg, rgba(20, 184, 166, 0.22) 0%, rgba(13, 148, 136, 0.16) 100%)',
        avatarBorder: 'rgba(20, 184, 166, 0.45)',
        avatarColor: '#2DD4BF',
        avatarShadow: 'rgba(20, 184, 166, 0.3)',
        badgeBg: 'rgba(20, 184, 166, 0.12)',
        badgeBorder: 'rgba(20, 184, 166, 0.25)',
        badgeText: '#5EEAD4'
    },
    {
        border: 'rgba(249, 115, 22, 0.28)',
        borderHover: 'rgba(249, 115, 22, 0.65)',
        glow: 'rgba(249, 115, 22, 0.18)',
        glowHover: 'rgba(249, 115, 22, 0.35)',
        avatarBg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(194, 65, 12, 0.16) 100%)',
        avatarBorder: 'rgba(249, 115, 22, 0.45)',
        avatarColor: '#FB923C',
        avatarShadow: 'rgba(249, 115, 22, 0.3)',
        badgeBg: 'rgba(249, 115, 22, 0.12)',
        badgeBorder: 'rgba(249, 115, 22, 0.25)',
        badgeText: '#FDBA74'
    }
];

function getShopTheme(id, name) {
    let hash = 0;
    const str = (name || '') + (id || 0);
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return MARKET_THEMES[Math.abs(hash) % MARKET_THEMES.length];
}

let allMarketGroupsList = [];

// Toifalar (Bozorlar) ro'yxatini ko'rsatish
async function showMarketGroups() {
    updateHeaderMeta('Bozorlar', "Do'konlar va savdo nuqtalari", 'PRO');
    setRootScreen('bozorlar');
    fabBtn.style.display = 'flex';
    fabBtn.onclick = showAddMarketGroupForm;

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const groups = await apiGet('/market-groups');
        allMarketGroupsList = Array.isArray(groups) ? groups : [];

        if (allMarketGroupsList.length === 0) {
            contentEl.innerHTML = '<div class="empty-state">Hali bozor qo\'shilmagan.<br>Pastdagi + tugmasi orqali yangi bozor qo\'shing.</div>';
            return;
        }

        const totalShops = allMarketGroupsList.reduce((sum, g) => sum + (Number(g.shopCount) || 0), 0);

        let html = `
            <div class="market-summary-bar">
                <div class="market-summary-item">
                    <span>🏪</span>
                    <span>Jami: <strong>${allMarketGroupsList.length} ta bozor</strong></span>
                </div>
                <div class="market-summary-divider"></div>
                <div class="market-summary-item">
                    <span>🏬</span>
                    <span><strong>${totalShops} ta do'kon</strong></span>
                </div>
            </div>
        `;

        if (allMarketGroupsList.length >= 4) {
            html += `
                <div class="form-group" style="padding-bottom:10px;">
                    <input type="text" class="form-input" id="marketSearchInput" placeholder="Bozor nomini qidirish..." oninput="filterMarketGroups()">
                </div>
            `;
        }

        html += `<div id="marketCardsContainer">`;
        html += renderMarketCardsHtml(allMarketGroupsList);
        html += `</div>`;

        contentEl.innerHTML = html;

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function renderMarketCardsHtml(groups) {
    if (!groups || groups.length === 0) {
        return '<div class="empty-state" style="padding:20px 0;">Bozor topilmadi.</div>';
    }

    return groups.map((group, index) => {
        const t = MARKET_THEMES[index % MARKET_THEMES.length];
        const count = Number(group.shopCount) || 0;

        return `
            <div class="market-card" style="
                --card-border: ${t.border};
                --card-border-hover: ${t.borderHover};
                --card-glow: ${t.glow};
                --card-glow-hover: ${t.glowHover};
                --avatar-bg: ${t.avatarBg};
                --avatar-border: ${t.avatarBorder};
                --avatar-color: ${t.avatarColor};
                --avatar-shadow: ${t.avatarShadow};
            " onclick="showShops(${group.id}, '${escJs(group.name)}')">
                <div class="market-card__avatar">
                    ${Icons.storeFront || Icons.market}
                </div>
                <div class="market-card__info">
                    <div class="market-card__title">${escHtml(group.name)}</div>
                    <div class="market-card__badge" style="background:${t.badgeBg}; border:1px solid ${t.badgeBorder}; color:${t.badgeText};">
                        <span class="market-card__badge-icon">${Icons.shopBag}</span>
                        <span class="market-card__badge-count">${count} ta do'kon</span>
                    </div>
                </div>
                <div class="market-card__actions" onclick="event.stopPropagation()">
                    <button class="market-action-btn" onclick="showEditMarketGroupForm(${group.id}, '${escJs(group.name)}')" title="Tahrirlash">${Icons.edit}</button>
                    <button class="market-action-btn market-action-btn--danger" onclick="deleteMarketGroup(${group.id}, '${escJs(group.name)}')" title="O'chirish">${Icons.trash}</button>
                    <span class="market-card__chevron">${Icons.chevronRight}</span>
                </div>
            </div>
        `;
    }).join('');
}

function filterMarketGroups() {
    const input = document.getElementById('marketSearchInput');
    const container = document.getElementById('marketCardsContainer');
    if (!container) return;
    const query = input ? input.value.trim().toLowerCase() : '';
    if (!query) {
        container.innerHTML = renderMarketCardsHtml(allMarketGroupsList);
        return;
    }
    const filtered = allMarketGroupsList.filter(g => g.name && g.name.toLowerCase().includes(query));
    container.innerHTML = renderMarketCardsHtml(filtered);
}

// Boshlang'ich sahifa
Nav.init();
showMarketGroups();

// Yangi toifa qo'shish formasi
function showAddMarketGroupForm() {
    updateHeaderMeta('Yangi toifa', "Bozor yoki hudud kiritish", "QO'SHISH");
    setBackAction(showMarketGroups, 'addMarketGroup');
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
                <button class="btn btn--primary btn--full" id="submitMarketGroupBtn" onclick="submitMarketGroup()">
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
    const btn = document.getElementById('submitMarketGroupBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Saqlanmoqda...';
    }
    try {
        await apiPost('/market-groups', { name });
        showToast('Yangi toifa yaratildi', 'success');
        showMarketGroups();
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} Toifani saqlash`;
        }
    }
}

// Do'konlar ro'yxatini ko'rsatish
async function showShops(groupId, groupName) {
    updateHeaderMeta(groupName, "Bozor do'konlari ro'yxati", 'BOZOR');
    currentGroupId = groupId;
    currentGroupName = groupName;
    setBackAction(showMarketGroups, 'shops');
    fabBtn.style.display = 'flex';
    fabBtn.onclick = () => showAddShopForm(groupId);

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        allShopsInGroup = await apiGet(`/shops?groupId=${groupId}`);
        allShopsInGroup = Array.isArray(allShopsInGroup) ? allShopsInGroup : [];

        const totalMarketDebt = allShopsInGroup.reduce((sum, s) => sum + (Number(s.currentDebt) || 0), 0);

        contentEl.innerHTML = `
            <div class="market-summary-bar">
                <div class="market-summary-item">
                    <span>🏪</span>
                    <span>Do'konlar: <strong>${allShopsInGroup.length} ta</strong></span>
                </div>
                <div class="market-summary-divider"></div>
                <div class="market-summary-item">
                    <span>💳</span>
                    <span>${totalMarketDebt > 0 ? `Qarz: <strong style="color:#F87171;">${formatMoney(totalMarketDebt)}</strong>` : `<strong style="color:#34D399;">Qarz yo'q ✓</strong>`}</span>
                </div>
            </div>

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
    filterShops(true);
}

let _shopFilterTimer = null;
function filterShops(immediate = false) {
    if (immediate) {
        clearTimeout(_shopFilterTimer);
        _executeShopFilter();
        return;
    }
    clearTimeout(_shopFilterTimer);
    _shopFilterTimer = setTimeout(_executeShopFilter, 100);
}

function _executeShopFilter() {
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
        const initial = (shop.name && shop.name.trim().length > 0) ? shop.name.trim()[0].toUpperCase() : 'D';
        const theme = getShopTheme(shop.id, shop.name);

        const isDebt = debt > 0;
        const isCredit = debt < 0;

        // Holatga qarab qirra va yoritish
        const statusAccent = isDebt ? '#F43F5E' : (isCredit ? '#0EA5E9' : '#10B981');
        const cardGlow = isDebt ? 'rgba(244, 63, 94, 0.18)' : (isCredit ? 'rgba(14, 165, 233, 0.18)' : 'rgba(16, 185, 129, 0.15)');
        const cardGlowHover = isDebt ? 'rgba(244, 63, 94, 0.35)' : (isCredit ? 'rgba(14, 165, 233, 0.35)' : 'rgba(16, 185, 129, 0.3)');

        // 2-qator: Maxsus Do'kon Qarzi Paneli
        let statusIcon = '🔴';
        let statusLabel = "Do'kon qarzi:";
        let statusColor = '#FB7185';
        let statusBgBorder = 'rgba(244, 63, 94, 0.25)';
        let statusText = formatMoney(debt);

        if (isCredit) {
            statusIcon = '🔵';
            statusLabel = "Haqdorlik (Avans):";
            statusColor = '#38BDF8';
            statusBgBorder = 'rgba(56, 189, 248, 0.25)';
            statusText = formatMoney(Math.abs(debt));
        } else if (!isDebt) {
            statusIcon = '🟢';
            statusLabel = "Hisob holati:";
            statusColor = '#34D399';
            statusBgBorder = 'rgba(52, 211, 153, 0.25)';
            statusText = "Qarz yo'q (0 so'm)";
        }

        let subtitleParts = [];
        if (shop.ownerName && shop.ownerName !== shop.name) {
            subtitleParts.push(`<span class="shop-card__meta">${Icons.user} <span>${escHtml(shop.ownerName)}</span></span>`);
        }
        if (shop.phone) {
            subtitleParts.push(`<span class="shop-card__meta" style="color:#38BDF8;">${Icons.phoneAction} <span>${escHtml(shop.phone)}</span></span>`);
        }

        const rawPhone = (shop.phone || '').replace(/[^\d+]/g, '');
        const cleanPhone = (shop.phone || '').replace(/[^\d]/g, '');

        return `
            <div class="shop-card" style="
                --card-accent: ${statusAccent};
                --card-glow: ${cardGlow};
                --card-glow-hover: ${cardGlowHover};
                margin-bottom: 13px;
                padding: 14px 16px;
            " onclick="showShopDetail(${shop.id})">
                <!-- 1-qator: Avatar, Do'kon nomi va Egasi/Telefon (To'liq kenglikda) -->
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:11px;">
                    <div class="shop-card__avatar" style="
                        background: ${theme.avatarBg};
                        border: 1.5px solid ${theme.avatarBorder};
                        color: ${theme.avatarColor};
                        box-shadow: 0 4px 14px ${theme.avatarShadow};
                    ">
                        ${escHtml(initial)}
                    </div>
                    <div style="flex:1; min-width:0;">
                        <div style="font-family:var(--font-heading); font-size:16px; font-weight:700; color:#FFFFFF; letter-spacing:-0.2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-transform:uppercase;">
                            ${escHtml(shop.name)}
                        </div>
                        <div style="font-size:12px; color:#94A3B8; margin-top:3px; display:flex; align-items:center; gap:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                            ${subtitleParts.length > 0 ? subtitleParts.join('<span style="opacity:0.35;">·</span>') : '<span style="color:var(--color-ink-dim);">Ma\'lumot kiritilmagan</span>'}
                        </div>
                    </div>
                    <span class="market-card__chevron" style="flex-shrink:0; opacity:0.65; margin-left:4px;">${Icons.chevronRight}</span>
                </div>

                <!-- 2-qator: Maxsus Do'kon Qarzi Paneli (To'liq alohida qator, hech qachon ism bilan to'qnashmaydi) -->
                <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; background:rgba(0,0,0,0.25); border:1px solid ${statusBgBorder}; border-radius:12px; padding:8px 12px; margin-bottom:11px;">
                    <div style="display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:var(--color-ink-dim);">
                        <span style="font-size:11px;">${statusIcon}</span>
                        <span>${statusLabel}</span>
                    </div>
                    <div style="font-size:14.5px; font-weight:800; color:${statusColor}; font-variant-numeric:tabular-nums; white-space:nowrap;">
                        ${statusText}
                    </div>
                </div>

                <!-- 3-qator: Qo'ng'iroq, Telegram, Tahrirlash, O'chirish -->
                <div class="shop-card__actions" onclick="event.stopPropagation()">
                    <div class="shop-card__action-group">
                        ${rawPhone ? `
                            <a href="tel:${escAttr(rawPhone)}" class="action-chip action-chip--call" title="Qo'ng'iroq qilish">
                                ${Icons.phoneAction}
                                <span>Qo'ng'iroq</span>
                            </a>
                        ` : ''}
                        ${cleanPhone ? `
                            <a href="https://t.me/+${escAttr(cleanPhone)}" target="_blank" rel="noopener noreferrer" class="action-chip action-chip--telegram" title="Telegram">
                                ${Icons.tgAction}
                                <span>Telegram</span>
                            </a>
                        ` : ''}
                    </div>
                    <div class="shop-card__action-group">
                        <button class="market-action-btn" onclick="showEditShopForm(${shop.id}, '${escJs(shop.name)}', '${escJs(shop.ownerName || '')}', '${escJs(shop.phone || '')}')" title="Tahrirlash">${Icons.edit}</button>
                        <button class="market-action-btn market-action-btn--danger" onclick="deleteShop(${shop.id}, '${escJs(shop.name)}', ${debt})" title="O'chirish">${Icons.trash}</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


function showAddShopForm(groupId) {
    updateHeaderMeta('Yangi do\'kon', currentGroupName ? `${currentGroupName} toifasi` : 'Bozor toifasiga qo\'shish', 'QO\'SHISH');
    setBackAction(() => showShops(groupId, currentGroupName), 'addShop');
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
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Saqlanmoqda...';
    }

    try {
        await apiPost('/shops', { name, ownerName, phone, marketGroupId: groupId });
        showToast('Do\'kon muvaffaqiyatli qo\'shildi', 'success');
        showShops(groupId, currentGroupName);
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} Do'konni saqlash`;
        }
        showToast('Xatolik: ' + err.message, 'error');
    }
}

// State for ledger filtering
let currentLedgerData = null;
let currentLedgerFilterMode = 'day'; // 'day' | 'all'
let currentLedgerSelectedDate = getLocalDateString();

function getEntryDateString(dateVal) {
    if (!dateVal) return '';
    if (typeof dateVal === 'string' && dateVal.length >= 10 && dateVal.indexOf('-') === 4) {
        return dateVal.slice(0, 10);
    }
    return getLocalDateString(new Date(dateVal));
}

function formatDatePretty(dateStr) {
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            const monthNames = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
            const monthName = monthNames[d.getMonth()] || parts[1];
            const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
            const dayOfWeek = dayNames[d.getDay()] || '';
            return `${Number(parts[2])}-${monthName} (${dayOfWeek})`;
        }
    } catch (e) {}
    return dateStr;
}

function formatLedgerDateLabel(dateStr) {
    const todayStr = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if (dateStr === todayStr) {
        return `Bugun (${formatDatePretty(dateStr)})`;
    } else if (dateStr === yesterdayStr) {
        return `Kecha (${formatDatePretty(dateStr)})`;
    } else {
        return formatDatePretty(dateStr);
    }
}

function changeLedgerDate(deltaDays) {
    currentLedgerFilterMode = 'day';
    const baseDate = currentLedgerSelectedDate || getLocalDateString();
    const parts = baseDate.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + deltaDays);
    currentLedgerSelectedDate = getLocalDateString(d);
    renderLedgerSection();
}

function setLedgerDateFilter(mode) {
    if (mode === 'today') {
        currentLedgerFilterMode = 'day';
        currentLedgerSelectedDate = getLocalDateString();
    } else if (mode === 'yesterday') {
        currentLedgerFilterMode = 'day';
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        currentLedgerSelectedDate = getLocalDateString(yesterday);
    } else if (mode === 'all') {
        currentLedgerFilterMode = 'all';
    }
    renderLedgerSection();
}

function onLedgerDatePicked(pickedDate) {
    if (pickedDate) {
        currentLedgerFilterMode = 'day';
        currentLedgerSelectedDate = pickedDate;
        renderLedgerSection();
    }
}

function renderLedgerEntryCard(entry, shopId) {
    const isCancelled = Boolean(entry.isCancelled);
    const isSale = entry.type === 'SOTUV';
    const rowOpacity = isCancelled ? 'opacity: 0.65; background: rgba(239,68,68,0.04);' : '';
    const titleStyle = isCancelled ? 'text-decoration: line-through; color: var(--color-ink-dim);' : '';
    const amountClass = isCancelled 
        ? 'amount--muted' 
        : (isSale ? 'amount--debt' : 'amount--paid');
    const amountText = (isSale ? '+' : '−') + formatMoney(entry.amount);

    let cancelBadge = '';
    if (isCancelled) {
        cancelBadge = `
            <div style="font-size:11.5px; color:#F87171; display:flex; flex-wrap:wrap; align-items:center; gap:6px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); padding:6px 10px; border-radius:8px;">
                <span style="background:rgba(239,68,68,0.25); border:1px solid rgba(239,68,68,0.4); padding:1px 5px; border-radius:4px; font-weight:700; font-size:10px;">BEKOR QILINGAN</span>
                <span>${escHtml(entry.cancelReason || '')}</span>
                <span style="opacity:0.8;">(${escHtml(entry.cancelledBy || '')})</span>
            </div>
        `;
    }

    let actionBtn = '';
    if (!isCancelled && entry.id) {
        actionBtn = `
            <button class="btn" onclick="promptCancelEntry('${entry.type}', ${entry.id}, ${shopId}, '${escJs(entry.description || '')}', ${entry.amount})" 
                    style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); color:#F87171; padding:4px 8px; border-radius:8px; font-size:11.5px; font-weight:600; display:inline-flex; align-items:center; gap:5px; cursor:pointer;" 
                    title="Operatsiyani bekor qilish (Storno)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                <span>Bekor qilish</span>
            </button>
        `;
    }

    const typeTitle = isSale 
        ? 'Sotuv' 
        : ('To\'lov (' + escHtml(entry.paymentMethod || 'NAQD') + ')');
    const typeIcon = isSale ? Icons.box : Icons.wallet;
    const iconColor = isSale ? '#60A5FA' : '#34D399';
    const iconBg = isSale ? 'rgba(59,130,246,0.14)' : 'rgba(16,185,129,0.14)';

    return `
    <div class="ledger-row" style="cursor:default; margin-bottom:10px; display:flex; flex-direction:column; align-items:stretch; gap:10px; padding:14px 15px; ${rowOpacity}">
        <!-- 1-qator: Turi va Summa -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:${iconBg}; color:${iconColor}; flex-shrink:0;">
                    ${typeIcon}
                </div>
                <span style="font-weight:700; font-size:14.5px; color:#FFFFFF; letter-spacing:-0.2px;">
                    ${typeTitle}
                </span>
            </div>
            <div class="ledger-row__amount ${amountClass}" style="font-size:14px; font-weight:800; padding:4px 12px; border-radius:999px; ${isCancelled ? 'text-decoration: line-through; opacity:0.6;' : ''}">
                ${amountText}
            </div>
        </div>

        <!-- 2-qator: Mahsulotlar tarkibi (faqat sotuv uchun) -->
        ${isSale && entry.description ? `
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:8px 11px; font-size:13px; font-weight:500; color:#F1F5F9; line-height:1.45; word-break:break-word; ${titleStyle}">
                <span style="color:var(--color-ink-dim); font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.4px; display:block; margin-bottom:2px;">Tovar tarkibi:</span>
                ${escHtml(entry.description)}
            </div>
        ` : ''}

        <!-- 3-qator: Sana & Qoldiq -->
        <div style="display:flex; align-items:center; justify-content:space-between; font-size:12px; color:var(--color-ink-dim); flex-wrap:wrap; gap:6px;">
            <span style="display:inline-flex; align-items:center; gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${new Date(entry.date).toLocaleDateString('uz-UZ')}, ${new Date(entry.date).toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'})}
            </span>
            <span style="font-weight:600; color:#94A3B8;">
                ${Number(entry.balanceAfter) <= 0 ? 'Qoldiq: 0 so\'m' : 'Qoldiq: ' + formatMoney(entry.balanceAfter)}
            </span>
        </div>

        ${cancelBadge}

        <!-- 4-qator: Mas'ul xodim & Bekor qilish tugmasi -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.08); margin-top:2px;">
            <div>
                ${formatAdminBadge(entry.createdBy)}
            </div>
            <div>
                ${actionBtn}
            </div>
        </div>
    </div>
    `;
}

function renderLedgerSection() {
    const container = document.getElementById('ledgerSectionContainer');
    if (!container || !currentLedgerData) return;

    const todayStr = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const isDayMode = currentLedgerFilterMode === 'day';
    const isToday = isDayMode && currentLedgerSelectedDate === todayStr;
    const isYesterday = isDayMode && currentLedgerSelectedDate === yesterdayStr;
    const isAll = currentLedgerFilterMode === 'all';

    const allEntries = currentLedgerData.entries ? currentLedgerData.entries.slice().reverse() : [];

    let filteredEntries = [];
    if (isDayMode) {
        filteredEntries = allEntries.filter(e => getEntryDateString(e.date) === currentLedgerSelectedDate);
    } else {
        filteredEntries = allEntries;
    }

    // Sarhisob (faqat bekor qilinmagan operatsiyalar)
    let totalSales = 0;
    let totalPayments = 0;
    filteredEntries.forEach(e => {
        if (!e.isCancelled) {
            const amt = Number(e.amount) || 0;
            if (e.type === 'SOTUV') {
                totalSales += amt;
            } else {
                totalPayments += amt;
            }
        }
    });

    let entriesListHtml = '';
    if (filteredEntries.length === 0) {
        if (isDayMode) {
            entriesListHtml = `
                <div class="empty-state" style="padding:26px 16px; margin: 10px 0; background:rgba(255,255,255,0.02); border:1px dashed var(--color-line); border-radius:16px;">
                    <div style="font-size:26px; margin-bottom:8px;">📅</div>
                    <div style="font-weight:700; color:#FFF; font-size:15px; margin-bottom:4px;">Ushbu sanada operatsiyalar yo'q</div>
                    <div style="font-size:12.5px; color:var(--color-ink-dim); margin-bottom:14px;">Tanlangan kunda sotuv yoki to'lov bo'lmagan.</div>
                    <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
                        ${!isToday ? `<button class="chip-btn active" onclick="setLedgerDateFilter('today')">Bugungi kun</button>` : ''}
                        <button class="chip-btn" onclick="setLedgerDateFilter('all')">Barcha amallarni ko'rish</button>
                    </div>
                </div>
            `;
        } else {
            entriesListHtml = '<div class="empty-state">Hali harakatlar tarixi mavjud emas.</div>';
        }
    } else if (isAll) {
        let lastDateGroup = null;
        entriesListHtml = filteredEntries.map(entry => {
            const entryDateStr = getEntryDateString(entry.date);
            let groupHeader = '';
            if (entryDateStr !== lastDateGroup) {
                lastDateGroup = entryDateStr;
                groupHeader = `
                    <div style="display:flex; align-items:center; gap:8px; margin:18px 0 10px 0;">
                        <span style="font-size:12px; font-weight:700; color:#60A5FA; background:rgba(37,99,235,0.15); border:1px solid rgba(37,99,235,0.3); padding:4px 12px; border-radius:999px;">
                            📅 ${formatLedgerDateLabel(entryDateStr)}
                        </span>
                        <div style="flex:1; height:1px; background:var(--color-line);"></div>
                    </div>
                `;
            }
            return groupHeader + renderLedgerEntryCard(entry, currentLedgerData.shopId);
        }).join('');
    } else {
        entriesListHtml = filteredEntries.map(entry => renderLedgerEntryCard(entry, currentLedgerData.shopId)).join('');
    }

    container.innerHTML = `
        <!-- Filter Tugmalari -->
        <div style="margin-bottom:14px;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:10px;">
                <div class="chips-group" style="margin:0; gap:6px;">
                    <button class="chip-btn ${isToday ? 'active' : ''}" onclick="setLedgerDateFilter('today')">Bugun</button>
                    <button class="chip-btn ${isYesterday ? 'active' : ''}" onclick="setLedgerDateFilter('yesterday')">Kecha</button>
                    <button class="chip-btn ${isAll ? 'active' : ''}" onclick="setLedgerDateFilter('all')">Barchasi (${allEntries.length})</button>
                </div>
            </div>

            <!-- Kunma-kun varaqlash (Faqat kunlik rejimda) -->
            ${isDayMode ? `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:var(--color-paper-dim); border:1px solid var(--color-line); border-radius:14px; padding:7px 10px; margin-bottom:12px;">
                    <button class="btn" onclick="changeLedgerDate(-1)" style="padding:6px 12px; background:rgba(255,255,255,0.06); border:none; color:#FFF; border-radius:8px; cursor:pointer;" title="Oldingi kun">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    
                    <label style="display:flex; align-items:center; gap:7px; cursor:pointer; margin:0; position:relative; flex:1; justify-content:center;">
                        <input type="date" value="${currentLedgerSelectedDate}" onchange="onLedgerDatePicked(this.value)" style="position:absolute; opacity:0; width:100%; height:100%; top:0; left:0; cursor:pointer;">
                        <span style="font-size:13.5px; font-weight:700; color:#FFFFFF; display:flex; align-items:center; gap:6px;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            ${formatLedgerDateLabel(currentLedgerSelectedDate)}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.6;"><path d="M6 9l6 6 6-6"/></svg>
                    </label>

                    <button class="btn" onclick="changeLedgerDate(1)" style="padding:6px 12px; background:rgba(255,255,255,0.06); border:none; color:#FFF; border-radius:8px; cursor:pointer;" title="Keyingi kun">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                </div>
            ` : ''}

            <!-- Kunlik sarhisob kartochkasi -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:14px;">
                <div style="background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.2); border-radius:12px; padding:10px 12px;">
                    <div style="font-size:11px; color:var(--color-debt); font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">${isDayMode ? 'Kunlik savdo' : 'Jami savdo'}</div>
                    <div style="font-size:15px; font-weight:800; color:var(--color-debt); margin-top:2px;">+${formatMoney(totalSales)}</div>
                </div>
                <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:12px; padding:10px 12px;">
                    <div style="font-size:11px; color:var(--color-paid); font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">${isDayMode ? "Kunlik to'lov" : "Jami to'lov"}</div>
                    <div style="font-size:15px; font-weight:800; color:var(--color-paid); margin-top:2px;">−${formatMoney(totalPayments)}</div>
                </div>
            </div>
        </div>

        <!-- Operatsiyalar ro'yxati -->
        <div>
            ${entriesListHtml}
        </div>
    `;
}

// Do'kon ichki kabineti (Tarix va operatsiyalar)
async function showShopDetail(shopId) {
    currentShopId = shopId;
    updateHeaderMeta('Yuklanmoqda...', '', 'DAFTAR');
    setBackAction(() => currentGroupId ? showShops(currentGroupId, currentGroupName) : showMarketGroups(), 'shopDetail');
    fabBtn.style.display = 'none';

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const ledger = await apiGet(`/shops/${shopId}/ledger`);
        currentLedgerData = ledger;
        if (!currentLedgerSelectedDate) {
            currentLedgerSelectedDate = getLocalDateString();
        }

        updateHeaderMeta(ledger.shopName, "Do'kon qarz daftari va amallar", 'DAFTAR');

        const debt = Number(ledger.currentDebt) || 0;
        let debtLabel = 'Joriy qarz balansi';
        let debtValueText = formatMoney(debt);
        let debtStyleColor = 'var(--color-paid)';
        let lineGradient = 'linear-gradient(90deg, #10B981, #34D399)';
        if (debt > 0) {
            debtLabel = 'Joriy qarz balansi';
            debtValueText = formatMoney(debt);
            debtStyleColor = 'var(--color-debt)';
            lineGradient = 'linear-gradient(90deg, #F43F5E, #FB7185)';
        } else {
            debtLabel = 'Hisob toza (Qarzdorlik yo\'q)';
            debtValueText = '0 so\'m';
            debtStyleColor = 'var(--color-paid)';
            lineGradient = 'linear-gradient(90deg, #10B981, #34D399)';
        }

        const debtGlowClass = debt > 0 ? 'stat-card--glow-rose' : 'stat-card--glow-emerald';

        contentEl.innerHTML = `
            <div class="stat-card ${debtGlowClass}" style="margin-bottom:16px; text-align:center; padding: 22px 18px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: ${lineGradient};"></div>
                <div class="stat-card__label" style="text-transform:uppercase; letter-spacing:0.8px; font-size:11.5px; font-weight:700; color:var(--color-ink-dim);">${debtLabel}</div>
                <div class="stat-card__value" style="color: ${debtStyleColor}; font-size: 28px; font-weight:800; margin-top:6px; font-variant-numeric: tabular-nums;">
                    ${debtValueText}
                </div>
                <div style="margin-top:14px; display:flex; justify-content:center;">
                    <button class="action-chip" onclick="directPrintShopStatement(${shopId})" style="display:inline-flex; align-items:center; gap:8px; padding: 9px 20px; width:auto; border-radius: 12px; font-size: 13.5px; font-weight: 600; background:rgba(37,99,235,0.18); border:1px solid rgba(37,99,235,0.4); color:#60A5FA;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        <span>Chop etish / PDF olish</span>
                    </button>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom: 20px;">
                <button class="btn btn--primary" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius: 14px; padding: 14px; box-shadow: 0 4px 16px rgba(37,99,235,0.3);" onclick="showAddSaleForm(${shopId})">
                    ${Icons.plus} Yangi sotuv
                </button>
                <button class="btn" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.18) 100%); color: #34D399; border: 1.5px solid rgba(16,185,129,0.45); display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius: 14px; padding: 14px; font-weight: 700; box-shadow: 0 4px 16px rgba(16,185,129,0.2);" onclick="showAddPaymentForm(${shopId}, ${debt})">
                    ${Icons.wallet} To'lov olish
                </button>
            </div>

            <div class="section-title">
                Operatsiyalar tarixi
            </div>

            <div id="ledgerSectionContainer"></div>
        `;

        renderLedgerSection();

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

// Operatsiyani bekor qilish (Storno) oynasi
function promptCancelEntry(type, id, shopId, description, amount) {
    const isSale = type === 'SOTUV';
    
    showBottomSheet(`
        <div style="text-align:left;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
                <div style="width:42px; height:42px; border-radius:12px; background:rgba(239,68,68,0.15); color:#F87171; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                </div>
                <div>
                    <div style="font-size:16px; font-weight:800; color:#FFF;">Operatsiyani bekor qilish (Storno)</div>
                    <div style="font-size:12.5px; color:var(--color-ink-dim);">Ushbu amal do'kon qarzini avtomatik to'g'irlaydi</div>
                </div>
            </div>

            <div style="background:var(--color-paper-dim); border:1px solid var(--color-line); border-radius:12px; padding:12px 14px; margin-bottom:14px; font-size:13px; line-height:1.6;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--color-ink-dim);">Amal turi:</span>
                    <strong style="color:#FFF;">${isSale ? 'Sotuv #' + id : 'To\'lov #' + id}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--color-ink-dim);">Summa:</span>
                    <strong style="color:#60A5FA;">${formatMoney(amount)}</strong>
                </div>
                ${description ? `
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--color-ink-dim);">Tavsif:</span>
                    <span style="color:var(--color-ink);">${escHtml(description)}</span>
                </div>` : ''}
                <div style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--color-line); color:#FCA5A5; font-size:12px;">
                    ⚠️ ${isSale 
                        ? 'Sotuv bekor qilinganda do\'kon qarzi mos ravishda kamaytiriladi.' 
                        : 'To\'lov bekor qilinganda do\'konning so\'ndirilgan qarzi qayta tiklanadi.'}
                </div>
            </div>

            <div class="form-group" style="margin-bottom:18px;">
                <label class="form-label" for="cancelReasonInput">
                    <span>Bekor qilish sababi</span>
                </label>
                <input type="text" class="form-input" id="cancelReasonInput" placeholder="Masalan: Adashib kiritilgan yoki mijoz rad etdi" value="Xato kiritilgan">
                <div class="quick-chips-row" style="margin-top:8px;">
                    <button type="button" class="preset-chip" onclick="document.getElementById('cancelReasonInput').value = 'Adashib kiritilgan'">Adashib kiritilgan</button>
                    <button type="button" class="preset-chip" onclick="document.getElementById('cancelReasonInput').value = 'Mijoz tovar/to\\'lovni qaytardi'">Mijoz qaytardi</button>
                    <button type="button" class="preset-chip" onclick="document.getElementById('cancelReasonInput').value = 'Hisob-kitobda xatolik'">Hisobda xatolik</button>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <button type="button" class="btn" style="background:rgba(255,255,255,0.06); border:1px solid var(--color-line); color:#FFF;" onclick="closeBottomSheet()">
                    Ortga
                </button>
                <button type="button" class="btn" id="confirmCancelEntryBtn" style="background:#EF4444; border:1px solid #DC2626; color:#FFF; font-weight:700;" onclick="executeCancelEntry('${type}', ${id}, ${shopId})">
                    Ha, bekor qilinsin
                </button>
            </div>
        </div>
    `);
}

async function executeCancelEntry(type, id, shopId) {
    const reasonInput = document.getElementById('cancelReasonInput');
    const reason = (reasonInput?.value || '').trim() || 'Sabab ko\'rsatilmadi';
    const btn = document.getElementById('confirmCancelEntryBtn');

    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Bekor qilinmoqda...';
    }

    try {
        const endpoint = type === 'SOTUV' ? `/sales/${id}/cancel` : `/payments/${id}/cancel`;
        await apiPost(endpoint, { reason: reason });
        closeBottomSheet();
        showToast('Operatsiya muvaffaqiyatli bekor qilindi (Storno)!', 'success');
        showShopDetail(shopId);
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Ha, bekor qilinsin';
        }
        showToast('Xatolik: ' + err.message, 'error');
    }
}

// Yangi sotuv formasi
async function showAddSaleForm(shopId) {
    updateHeaderMeta('Yangi sotuv', "Tovarlarni rasmiylashtirish", 'SOTUV');
    setBackAction(() => showShopDetail(shopId), 'addSale');
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
                        <div class="form-card__desc">Sana, tovar, soni va narxini belgilang</div>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom:16px;">
                    <label class="form-label" for="saleDateInput">
                        <span class="label-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </span>
                        <span>Sotuv sanasi</span>
                    </label>
                    <input type="date" class="form-input" id="saleDateInput" value="${getLocalDateString()}" max="${getLocalDateString()}">
                    <div style="font-size:11.5px; color:var(--color-ink-dim); margin-top:5px; line-height:1.4;">
                        * Kelajak sanani tanlab bo'lmaydi
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="productSelect">
                        <span class="label-icon">${Icons.box}</span>
                        <span>Mahsulotni tanlang</span>
                    </label>
                    <select class="form-select" id="productSelect" onchange="onProductSelectChanged(this.value)">
                        <option value="">— Mahsulot tanlang —</option>
                        ${products.map(p => `
                            <option value="${p.id}">
                                ${escHtml(p.name)}${p.unit ? ` (${escHtml(p.unit)})` : ''}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="packageCountInput">
                        <span class="label-icon">${Icons.box}</span>
                        <span>Miqdori (soni / qop / karobka)</span>
                    </label>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button type="button" class="action-chip" style="width:46px; height:46px; padding:0; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#FFF; flex-shrink:0;" onclick="stepQty('packageCountInput', -1)">−</button>
                        <input type="number" inputmode="numeric" class="form-input" id="packageCountInput" placeholder="Masalan: 10" min="1" style="text-align:center; font-size:18px; font-weight:700; flex:1;" oninput="updateItemLineTotalPreview()">
                        <button type="button" class="action-chip" style="width:46px; height:46px; padding:0; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; border-radius:12px; background:rgba(37,99,235,0.22); border:1px solid rgba(59,130,246,0.45); color:#60A5FA; flex-shrink:0;" onclick="stepQty('packageCountInput', 1)">+</button>
                    </div>
                    <div class="quick-chips-row" style="margin-top:8px;">
                        <button type="button" class="preset-chip" onclick="addQtyToInput('packageCountInput', 1); updateItemLineTotalPreview()">+1</button>
                        <button type="button" class="preset-chip" onclick="addQtyToInput('packageCountInput', 2); updateItemLineTotalPreview()">+2</button>
                        <button type="button" class="preset-chip" onclick="addQtyToInput('packageCountInput', 5); updateItemLineTotalPreview()">+5</button>
                        <button type="button" class="preset-chip" onclick="addQtyToInput('packageCountInput', 10); updateItemLineTotalPreview()">+10</button>
                        <button type="button" class="preset-chip" onclick="addQtyToInput('packageCountInput', 20); updateItemLineTotalPreview()">+20</button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="itemPriceInput">
                        <span class="label-icon">${Icons.money}</span>
                        <span>1 tasi narxi (dona / qop / karobka)</span>
                    </label>
                    <div class="money-field-wrap">
                        <div class="money-input-box">
                            <input type="text" 
                                   inputmode="numeric" 
                                   class="form-input money-input" 
                                   id="itemPriceInput" 
                                   placeholder="Masalan: 620 000" 
                                   oninput="onMoneyInputChange(this, 'itemPriceLive'); updateItemLineTotalPreview()">
                            <span class="money-suffix">so'm</span>
                        </div>
                        <div class="money-live-container" id="itemPriceLive" style="display:none;"></div>
                    </div>
                    <div class="quick-chips-row">
                        <button type="button" class="preset-chip" onclick="addMoneyToInput('itemPriceInput', 10000, 'itemPriceLive'); updateItemLineTotalPreview()">+10 ming</button>
                        <button type="button" class="preset-chip" onclick="addMoneyToInput('itemPriceInput', 50000, 'itemPriceLive'); updateItemLineTotalPreview()">+50 ming</button>
                        <button type="button" class="preset-chip" onclick="addMoneyToInput('itemPriceInput', 100000, 'itemPriceLive'); updateItemLineTotalPreview()">+100 ming</button>
                        <button type="button" class="preset-chip" onclick="addMoneyToInput('itemPriceInput', 500000, 'itemPriceLive'); updateItemLineTotalPreview()">+500 ming</button>
                        <button type="button" class="preset-chip preset-chip--clear" onclick="clearMoneyInput('itemPriceInput', 'itemPriceLive'); updateItemLineTotalPreview()">Tozalash</button>
                    </div>
                </div>

                <div id="itemLineTotalBox" style="display:none; margin: 12px 0 16px 0; padding: 13px 16px; background: rgba(56, 189, 248, 0.12); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 14px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 14px rgba(56,189,248,0.15);">
                    <span style="font-size: 13px; color: #93C5FD; font-weight: 600;">Jami tovar summasi:</span>
                    <span id="itemLineTotalVal" style="font-size: 17px; color: #38BDF8; font-weight: 800; font-variant-numeric: tabular-nums;">0 so'm</span>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                    <button class="btn btn--full" style="background: linear-gradient(135deg, rgba(37,99,235,0.3) 0%, rgba(59,130,246,0.2) 100%); border: 1.5px solid rgba(59, 130, 246, 0.45); color: #60A5FA; display:inline-flex; align-items:center; justify-content:center; gap:8px; font-weight:700; padding:14px; border-radius:14px; box-shadow: 0 4px 16px rgba(37,99,235,0.25);" onclick="addSaleItem()">
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
                    <label class="form-label" style="margin-bottom:8px;">
                        <span class="label-icon">${Icons.wallet}</span>
                        <span>To'lov usuli</span>
                    </label>
                    <div class="segmented-group">
                        <button type="button" class="segmented-btn segmented-btn--emerald active" id="saleMethodNaqdBtn" onclick="setSalePaymentMethod('NAQD')">
                            💵 NAQD (qo'lma-qo'l)
                        </button>
                        <button type="button" class="segmented-btn segmented-btn--sky" id="saleMethodKartaBtn" onclick="setSalePaymentMethod('KARTA')">
                            💳 KARTA (Click / Plastik)
                        </button>
                    </div>
                    <select class="form-select" id="paymentMethodSelect" style="display:none;">
                        <option value="NAQD" selected>NAQD (qo'lma-qo'l)</option>
                        <option value="KARTA">KARTA (Click / Plastik karta)</option>
                    </select>
                </div>
            </div>

            <div class="form-group" style="margin-top: 18px;">
                <button class="btn btn--primary btn--full" id="submitSaleBtn" style="padding:15px; border-radius:14px; font-size:15px; font-weight:800; box-shadow: 0 6px 20px rgba(37,99,235,0.4);" onclick="submitSale(${shopId})">
                    ${Icons.check} Sotuvni rasmiylashtirish
                </button>
            </div>
        `;
    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function onProductSelectChanged(productId) {
    if (!productId || !window.allProducts) return;
    const product = window.allProducts.find(p => p.id == productId);
    if (!product) return;

    if (product.sellPrice && Number(product.sellPrice) > 0) {
        setMoneyInputValue('itemPriceInput', product.sellPrice, 'itemPriceLive');
    }

    const countInput = document.getElementById('packageCountInput');
    if (countInput && (!countInput.value || parseInt(countInput.value) <= 0)) {
        countInput.value = '1';
    }

    updateItemLineTotalPreview();
}

function stepQty(inputId, delta) {
    const el = document.getElementById(inputId);
    if (!el) return;
    let val = parseInt(el.value) || 0;
    val += delta;
    if (val < 1) val = 1;
    el.value = val;
    updateItemLineTotalPreview();
}

function setSalePaymentMethod(method) {
    const select = document.getElementById('paymentMethodSelect');
    if (select) select.value = method;
    document.getElementById('saleMethodNaqdBtn')?.classList.toggle('active', method === 'NAQD');
    document.getElementById('saleMethodKartaBtn')?.classList.toggle('active', method === 'KARTA');
}

function updateItemLineTotalPreview() {
    const count = parseInt(document.getElementById('packageCountInput')?.value) || 0;
    const price = parseMoney(document.getElementById('itemPriceInput')?.value) || 0;
    const box = document.getElementById('itemLineTotalBox');
    const val = document.getElementById('itemLineTotalVal');
    if (!box || !val) return;
    const lineTotal = count * price;
    if (lineTotal > 0) {
        box.style.display = 'flex';
        val.textContent = formatMoney(lineTotal);
    } else {
        box.style.display = 'none';
    }
}

function addSaleItem() {
    const select = document.getElementById('productSelect');
    const productId = select?.value;
    const countInput = document.getElementById('packageCountInput');
    const priceInput = document.getElementById('itemPriceInput');

    const packageCount = parseInt(countInput?.value);
    const price = parseMoney(priceInput?.value);

    if (!productId) {
        showToast('Mahsulotni tanlang', 'error');
        return;
    }
    if (isNaN(packageCount) || packageCount < 1) {
        showToast('Miqdorni (sonini) to\'g\'ri kiriting', 'error');
        return;
    }
    if (!price || price <= 0) {
        showToast('1 tasi narxini to\'g\'ri kiriting', 'error');
        return;
    }

    const product = window.allProducts.find(p => p.id == productId);
    if (!product) return;

    saleItems.push({
        productId: parseInt(productId),
        packageCount: packageCount,
        productName: product.name,
        price: price
    });

    if (countInput) countInput.value = '';
    if (priceInput) priceInput.value = '';
    clearMoneyInput('itemPriceInput', 'itemPriceLive');
    if (select) select.value = '';
    updateItemLineTotalPreview();

    renderSaleItemsList();
}

function getSaleTotal() {
    return saleItems.reduce((sum, item) => sum + (item.packageCount * item.price), 0);
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
        <div style="background: linear-gradient(135deg, rgba(17, 24, 39, 0.88) 0%, rgba(15, 23, 42, 0.78) 100%); border: 1.5px solid rgba(59, 130, 246, 0.35); border-radius: 20px; padding: 16px; margin-bottom: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.35), 0 0 20px rgba(37,99,235,0.15);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08);">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:18px;">🛒</span>
                    <span style="font-size:13px; color:#94A3B8; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Tanlangan mahsulotlar (${saleItems.length})</span>
                </div>
                <span style="font-size:16px; font-weight:800; color:#38BDF8; font-variant-numeric:tabular-nums;">${formatMoney(total)}</span>
            </div>
            ${saleItems.map((item, index) => `
                <div class="sale-basket-item">
                    <div style="min-width:0; flex:1;">
                        <div style="font-weight:700; color:#FFFFFF; font-size:14.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(item.productName)}</div>
                        <div style="font-size:12px; color:#94A3B8; margin-top:2px;">
                            <span style="background:rgba(255,255,255,0.08); padding:2px 8px; border-radius:6px; font-weight:600; color:#CBD5E1;">${item.packageCount} ta</span>
                            <span style="margin: 0 4px; opacity:0.4;">×</span>
                            <span>${formatMoney(item.price)}</span>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                        <span style="font-variant-numeric: tabular-nums; font-weight:800; color:#F8FAFC; font-size:14px;">${formatMoney(item.packageCount * item.price)}</span>
                        <button onclick="removeSaleItem(${index})" class="market-action-btn market-action-btn--danger" style="width:30px; height:30px; border-radius:8px;" title="O'chirish">
                            ${Icons.trash}
                        </button>
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

    const totalSaleAmount = getSaleTotal();
    const initialPaidAmount = parseMoney(document.getElementById('initialPaidInput')?.value);
    
    if (initialPaidAmount > totalSaleAmount) {
        showToast("Boshlang'ich to'lov jami savdo summasidan ko'p bo'lishi mumkin emas!", 'error');
        return;
    }

    const methodSelect = document.getElementById('paymentMethodSelect');
    const initialPaymentMethod = (initialPaidAmount > 0) ? (methodSelect?.value || 'NAQD') : null;
    const remainingDebt = Math.max(0, totalSaleAmount - initialPaidAmount);
    const totalPackages = saleItems.reduce((sum, item) => sum + (item.packageCount || 0), 0);
    const saleDate = document.getElementById('saleDateInput')?.value || null;
    const today = getLocalDateString();

    if (saleDate && saleDate > today) {
        showToast("Sotuv sanasi bugungi kundan keyingi (kelajak) bo'lishi mumkin emas!", 'error');
        return;
    }

    const summaryHtml = `
        <div style="background:var(--color-paper-dim); border:1px solid var(--color-line); border-radius:12px; padding:12px 14px; text-align:left; font-size:13px; line-height:1.7;">
            ${saleDate ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:var(--color-ink-dim);">Sotuv sanasi:</span>
                <strong style="color:#FFF;">${escHtml(saleDate)}</strong>
            </div>` : ''}
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:var(--color-ink-dim);">Tovarlar soni:</span>
                <strong style="color:#FFF;">${saleItems.length} xil (${totalPackages} ta)</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:var(--color-ink-dim);">Jami savdo summasi:</span>
                <strong style="color:#60A5FA; font-size:14.5px;">${formatMoney(totalSaleAmount)}</strong>
            </div>
            ${initialPaidAmount > 0 ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#34D399;">
                <span>Oldindan to'langan:</span>
                <strong>${formatMoney(initialPaidAmount)} (${initialPaymentMethod})</strong>
            </div>` : ''}
            <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--color-line); padding-top:6px; margin-top:4px;">
                <span style="color:var(--color-ink-dim);">Do'konga yoziladigan qarz:</span>
                <strong style="color:${remainingDebt > 0 ? '#F87171' : '#34D399'}; font-size:14px;">${formatMoney(remainingDebt)}${remainingDebt === 0 && initialPaidAmount > 0 ? " (To'liq to'landi)" : ""}</strong>
            </div>
        </div>
    `;

    showConfirmDialog({
        title: "Sotuvni tasdiqlang",
        itemName: `${saleItems.length} xil mahsulot`,
        message: "Sotuvni rasmiylashtirishni tasdiqlaysizmi?",
        htmlContent: summaryHtml,
        confirmText: "Ha, tasdiqlayman",
        cancelText: "Bekor qilish",
        icon: Icons.check,
        isDanger: false,
        onConfirm: async () => {
            const payload = {
                shopId: shopId,
                items: saleItems.map(item => ({ 
                    productId: item.productId, 
                    packageCount: item.packageCount,
                    price: item.price
                })),
                initialPaidAmount: initialPaidAmount,
                initialPaymentMethod: initialPaymentMethod,
                saleDate: saleDate
            };

            const btn = document.getElementById('submitSaleBtn');
            if (btn) {
                if (btn.disabled) return;
                btn.disabled = true;
                btn.innerHTML = 'Rasmiylashtirilmoqda...';
            }

            try {
                await apiPost('/sales', payload);
                showToast('Sotuv muvaffaqiyatli saqlandi!', 'success');
                if (saleDate) {
                    currentLedgerSelectedDate = saleDate;
                    currentLedgerFilterMode = 'day';
                }
                showShopDetail(shopId);
            } catch (err) {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = 'Sotuvni rasmiylashtirish';
                }
                showToast('Xatolik: ' + err.message, 'error');
            }
        }
    });
}

// Yangi to'lov formasi
function showAddPaymentForm(shopId, currentDebt = 0) {
    if (Number(currentDebt) <= 0) {
        showToast("Do'konda qarzdorlik yo'q. To'lov qabul qilinmaydi.", "info");
        return;
    }
    updateHeaderMeta("To'lov qabul qilish", "Qarzni so'ndirish oynasi", "TO'LOV");
    setBackAction(() => showShopDetail(shopId), 'addPayment');
    fabBtn.style.display = 'none';

    const today = getLocalDateString();
    let minPaymentDate = null;
    let dateHelpText = "* Kelajak sanani tanlab bo'lmaydi";

    if (currentLedgerData && currentLedgerData.entries && currentLedgerData.entries.length > 0) {
        const sales = currentLedgerData.entries.filter(e => e.type === 'SOTUV' && !e.isCancelled);
        if (sales.length > 0) {
            const sortedSales = sales.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
            minPaymentDate = getEntryDateString(sortedSales[0].date);
            dateHelpText = `* To'lov sanasi mahsulot berilgan ilk kundan (${formatLedgerDateLabel(minPaymentDate)}) oldin bo'lishi mumkin emas`;
        }
    }

    contentEl.innerHTML = `
        <div class="stat-card stat-card--glow-rose" style="margin-bottom:14px; text-align:center; padding: 18px 16px; position:relative; overflow:hidden;">
            <div style="position: absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, #F43F5E, #FB7185);"></div>
            <div class="stat-card__label" style="text-transform:uppercase; letter-spacing:0.8px; font-size:11px; font-weight:700; color:#FDA4AF;">Joriy qarzdorlik balansi</div>
            <div class="stat-card__value" style="color: #FB7185; font-size: 26px; font-weight:800; margin-top:4px; font-variant-numeric: tabular-nums;">
                ${formatMoney(currentDebt)}
            </div>
        </div>

        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(16, 185, 129, 0.15); color: #34D399;">
                    ${Icons.wallet}
                </div>
                <div>
                    <div class="form-card__title">To'lov qabul qilish</div>
                    <div class="form-card__desc">Sana, to'lov summasi va usulini tasdiqlang</div>
                </div>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="paymentDateInput">
                    <span class="label-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </span>
                    <span>To'lov sanasi</span>
                </label>
                <input type="date" 
                       class="form-input" 
                       id="paymentDateInput" 
                       value="${today}" 
                       ${minPaymentDate ? `min="${minPaymentDate}"` : ''} 
                       max="${today}">
                <div style="font-size:11.5px; color:var(--color-ink-dim); margin-top:5px; line-height:1.4;">
                    ${dateHelpText}
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
                <label class="form-label" style="margin-bottom:8px;">
                    <span class="label-icon">${Icons.wallet}</span>
                    <span>To'lov usuli</span>
                </label>
                <div class="segmented-group">
                    <button type="button" class="segmented-btn segmented-btn--emerald active" id="payMethodNaqdBtn" onclick="setPaymentMethodType('NAQD')">
                        💵 NAQD (qo'lma-qo'l)
                    </button>
                    <button type="button" class="segmented-btn segmented-btn--sky" id="payMethodKartaBtn" onclick="setPaymentMethodType('KARTA')">
                        💳 KARTA (Click / Plastik)
                    </button>
                </div>
                <select class="form-select" id="paymentMethodInput" style="display:none;">
                    <option value="NAQD" selected>NAQD (qo'lma-qo'l)</option>
                    <option value="KARTA">KARTA (Click / Plastik karta)</option>
                </select>
            </div>

            <div class="form-group" style="margin-top: 22px;">
                <button class="btn btn--full" id="submitPaymentBtn" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); border: 1px solid rgba(52, 211, 153, 0.4); color: #FFFFFF; font-size:15px; font-weight: 800; padding: 15px; border-radius: 14px; box-shadow: 0 4px 18px rgba(16, 185, 129, 0.35);" onclick="submitPayment(${shopId}, ${currentDebt})">
                    ${Icons.check} To'lovni saqlash
                </button>
            </div>
        </div>
    `;
}

function setPaymentMethodType(method) {
    const select = document.getElementById('paymentMethodInput');
    if (select) select.value = method;
    document.getElementById('payMethodNaqdBtn')?.classList.toggle('active', method === 'NAQD');
    document.getElementById('payMethodKartaBtn')?.classList.toggle('active', method === 'KARTA');
}

function setPaymentPreset(amount) {
    setMoneyInputValue('paymentAmountInput', amount, 'paymentAmountLive');
}

async function submitPayment(shopId, currentDebt = 0) {
    const paymentDateInput = document.getElementById('paymentDateInput');
    const paymentDate = paymentDateInput?.value || null;
    const minDateAttr = paymentDateInput?.getAttribute('min');
    const today = getLocalDateString();

    if (paymentDate) {
        if (paymentDate > today) {
            showToast("To'lov sanasi bugungi kundan keyingi (kelajak) bo'lishi mumkin emas!", 'error');
            return;
        }
        if (minDateAttr && paymentDate < minDateAttr) {
            showToast(`To'lov sanasi mahsulot berilgan ilk kundan (${formatLedgerDateLabel(minDateAttr)}) oldin bo'lishi mumkin emas!`, 'error');
            return;
        }
    }

    const amount = parseMoney(document.getElementById('paymentAmountInput').value);
    const method = document.getElementById('paymentMethodInput').value;

    if (!amount || amount <= 0) {
        showToast('To\'g\'ri summa kiriting', 'error');
        return;
    }

    const debtVal = Number(currentDebt) || 0;

    if (debtVal <= 0) {
        showToast("Do'konda qarzdorlik yo'q! To'lov qabul qilinmaydi.", 'error');
        return;
    }

    if (amount > debtVal) {
        showToast(`To'lov summasi (${formatMoney(amount)}) joriy qarzdorlikdan (${formatMoney(debtVal)}) ortiq bo'lishi mumkin emas! Avans qabul qilinmaydi.`, 'error');
        return;
    }

    executePayment(shopId, amount, method);
}

async function executePayment(shopId, amount, method) {
    const paymentDate = document.getElementById('paymentDateInput')?.value || null;
    const btn = document.getElementById('submitPaymentBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Saqlanmoqda...';
    }

    try {
        await apiPost('/payments', { shopId, amount, method, paymentDate });
        showToast('To\'lov qabul qilindi', 'success');
        if (paymentDate) {
            currentLedgerSelectedDate = paymentDate;
            currentLedgerFilterMode = 'day';
        }
        showShopDetail(shopId);
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'To\'lovni saqlash';
        }
        showToast('Xatolik: ' + err.message, 'error');
    }
}

// Pastki navigatsiya holatini o'zgartirish
function setActiveNav(tab) {
    document.getElementById('navBozorlar')?.classList.toggle('active', tab === 'bozorlar');
    document.getElementById('navMahsulotlar')?.classList.toggle('active', tab === 'mahsulotlar');
    document.getElementById('navTaminot')?.classList.toggle('active', tab === 'taminot');
    document.getElementById('navDashboard')?.classList.toggle('active', tab === 'dashboard');
    document.getElementById('navProfil')?.classList.toggle('active', tab === 'profil');
}

function goToTab(tab) {
    if (tab === 'bozorlar') {
        setActiveNav('bozorlar');
        showMarketGroups();
    } else if (tab === 'mahsulotlar') {
        setActiveNav('mahsulotlar');
        showProducts();
    } else if (tab === 'taminot') {
        setActiveNav('taminot');
        showSuppliers();
    } else if (tab === 'dashboard') {
        setActiveNav('dashboard');
        showDashboard();
    }
}

// Mahsulotlar ro'yxati
async function showProducts() {
    updateHeaderMeta('Mahsulotlar', 'Mahsulotlar katalogi', 'KATALOG');
    setRootScreen('mahsulotlar');
    fabBtn.style.display = 'flex';
    fabBtn.onclick = showAddProductForm;

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        allProductsList = await apiGet('/products');
        allProductsList = Array.isArray(allProductsList) ? allProductsList : [];

        contentEl.innerHTML = `
            <div class="market-summary-bar">
                <div class="market-summary-item">
                    <span>📦</span>
                    <span>Jami: <strong>${allProductsList.length} turdagi tovar</strong></span>
                </div>
            </div>

            <div class="form-group" style="padding-bottom:8px;">
                <input type="text" class="form-input" id="productSearchInput" placeholder="Mahsulot nomini qidirish..." oninput="filterProducts()">
            </div>
            <div id="productsListContainer"></div>
        `;
        renderProductRows(allProductsList);

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function renderProductRows(products) {
    const container = document.getElementById('productsListContainer');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding:20px 0;">Mahsulot topilmadi.</div>';
        return;
    }

    container.innerHTML = products.map((p, index) => {
        const isOil = p.name.toLowerCase().includes('yog');
        const unitText = p.unit ? escHtml(p.unit) : (p.packageName ? escHtml(p.packageName) : 'dona');
        const price = Number(p.sellPrice) || 0;
        const t = MARKET_THEMES[index % MARKET_THEMES.length];

        return `
            <div class="product-card" style="
                --card-border: ${t.border};
                --card-border-hover: ${t.borderHover};
                --card-glow: ${t.glow};
                --card-glow-hover: ${t.glowHover};
                --avatar-bg: ${t.avatarBg};
                --avatar-border: ${t.avatarBorder};
                --avatar-color: ${t.avatarColor};
                --avatar-shadow: ${t.avatarShadow};
            " onclick="showEditProductForm(${p.id})">
                <div class="product-card__avatar">
                    ${isOil ? Icons.oil : Icons.box}
                </div>
                <div class="product-card__info">
                    <div class="product-card__title">${escHtml(p.name)}</div>
                    <div class="product-card__badge" style="background:${t.badgeBg}; border:1px solid ${t.badgeBorder}; color:${t.badgeText};">
                        <span>${unitText}</span>
                    </div>
                </div>
                <div class="product-card__price-wrap">
                    ${price > 0 ? `<div class="product-card__price">${formatMoney(price)}</div>` : ''}
                </div>
                <div class="product-card__actions" onclick="event.stopPropagation()">
                    <button class="market-action-btn" onclick="showEditProductForm(${p.id})" title="Tahrirlash">${Icons.edit}</button>
                    <button class="market-action-btn market-action-btn--danger" onclick="deleteProduct(${p.id}, '${escJs(p.name)}')" title="O'chirish">${Icons.trash}</button>
                    <span class="market-card__chevron">${Icons.chevronRight}</span>
                </div>
            </div>
        `;
    }).join('');
}

let _productFilterTimer = null;
function filterProducts(immediate = false) {
    if (immediate) {
        clearTimeout(_productFilterTimer);
        _executeProductFilter();
        return;
    }
    clearTimeout(_productFilterTimer);
    _productFilterTimer = setTimeout(_executeProductFilter, 100);
}

function _executeProductFilter() {
    const input = document.getElementById('productSearchInput');
    const query = input ? input.value.trim().toLowerCase() : '';
    if (!query) {
        renderProductRows(allProductsList);
        return;
    }
    const filtered = allProductsList.filter(p => p.name.toLowerCase().includes(query));
    renderProductRows(filtered);
}

function showAddProductForm() {
    updateHeaderMeta('Yangi mahsulot', 'Katalogga tovar qo\'shish', 'QO\'SHISH');
    setBackAction(showProducts, 'addProduct');
    fabBtn.style.display = 'none';

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(59, 130, 246, 0.15); color: #38BDF8;">
                    ${Icons.box}
                </div>
                <div>
                    <div class="form-card__title">Yangi mahsulot yaratish</div>
                    <div class="form-card__desc">Katalogga yangi tovar kiritish</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="pNameInput">
                    <span class="label-icon">${Icons.box}</span>
                    <span>Mahsulot nomi</span>
                </label>
                <input type="text" class="form-input" id="pNameInput" placeholder="Masalan: Shakar yoki Yog' 5L" autofocus>
            </div>

            <div class="form-group">
                <label class="form-label" for="pUnitInput">
                    <span class="label-icon">${Icons.info}</span>
                    <span>Birlik / Izoh (ixtiyoriy)</span>
                </label>
                <input type="text" class="form-input" id="pUnitInput" placeholder="Masalan: qop, karobka, dona">
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

    if (!name) {
        showToast('Mahsulot nomini kiriting', 'error');
        return;
    }

    const btn = document.getElementById('submitProductBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Saqlanmoqda...';
    }

    try {
        await apiPost('/products', { name, unit: unit || null });
        showToast('Mahsulot muvaffaqiyatli saqlandi', 'success');
        showProducts();
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} Mahsulotni saqlash`;
        }
        showToast('Xatolik: ' + err.message, 'error');
    }
}

// Hisobot (Dashboard)
let dashboardTab = 'umumiy';

async function showDashboard() {
    updateHeaderMeta('Hisobot', 'Moliyaviy tahlil va ko\'rsatkichlar', 'MOLIYA');
    setRootScreen('dashboard');
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
        el.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function renderSummaryHtml(summary, overdueShops) {
    let lowStockHtml = '';
    if (summary.lowStockProducts && summary.lowStockProducts.length > 0) {
        lowStockHtml = `
      <div class="section-title" style="color: #FBBF24;">${Icons.alertTriangle} Kam qolgan mahsulotlar</div>
      ${summary.lowStockProducts.map(p => `
        <div class="sale-basket-item" style="border-color: rgba(245, 158, 11, 0.25);">
          <div style="min-width:0; flex:1;">
            <div style="font-weight:700; color:#FFFFFF; font-size:14.5px;">${escHtml(p.productName)}</div>
          </div>
          <div class="ledger-row__amount" style="background:rgba(245, 158, 11, 0.15); border:1px solid rgba(245, 158, 11, 0.35); color:#FBBF24; font-weight:800; font-size:13px; padding:4px 10px;">${p.stockQuantity} ta qoldi</div>
        </div>
      `).join('')}
    `;
    }

    let overdueHtml = '';
    if (overdueShops && overdueShops.length > 0) {
        overdueHtml = `
      <div class="section-title" style="color: #FB7185;">${Icons.badgeDebt} Uzoq to'lamagan do'konlar</div>
      ${overdueShops.map(s => `
        <div class="sale-basket-item" style="border-color: rgba(244, 63, 94, 0.3); cursor:pointer;" onclick="currentGroupId=null; currentGroupName=''; showShopDetail(${s.shopId})">
          <div style="min-width:0; flex:1;">
            <div style="font-weight:700; color:#FFFFFF; font-size:14.5px;">${escHtml(s.shopName)}</div>
            <div style="font-size:12px; color:#FB7185; margin-top:2px; font-weight:600;">⏳ ${s.daysSinceLastPayment} kundan beri to'lanmagan</div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="ledger-row__amount amount--debt" style="font-size:13.5px; padding:6px 12px; font-weight:800;">${formatMoney(s.currentDebt)}</div>
            <span class="market-card__chevron">${Icons.chevronRight}</span>
          </div>
        </div>
      `).join('')}
    `;
    }

    return `
    <div class="stat-card stat-card--glow-rose" style="margin-bottom: 12px; text-align:center; padding:22px 18px; position:relative; overflow:hidden;">
      <div style="position: absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, #F43F5E, #FB7185);"></div>
      <div class="stat-card__label" style="text-transform:uppercase; letter-spacing:0.8px; font-size:12px; font-weight:700; color:#FDA4AF;">Jami umumiy qarz</div>
      <div class="stat-card__value" style="color: #FB7185; font-size: 30px; font-weight:800; margin-top:6px; font-variant-numeric:tabular-nums;">${formatMoney(summary.totalDebtAllShops || 0)}</div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom: 14px;">
      <div class="stat-card stat-card--glow-blue" style="padding:16px 12px; text-align:center;">
        <div class="stat-card__label" style="font-size:11.5px; color:#93C5FD; font-weight:700; text-transform:uppercase; letter-spacing:0.4px;">Bugungi savdo</div>
        <div class="stat-card__value" style="color: #38BDF8; font-size:18px; font-weight:800; margin-top:4px; font-variant-numeric:tabular-nums;">${formatMoney(summary.todaysSalesTotal || 0)}</div>
      </div>
      <div class="stat-card stat-card--glow-emerald" style="padding:16px 12px; text-align:center;">
        <div class="stat-card__label" style="font-size:11.5px; color:#A7F3D0; font-weight:700; text-transform:uppercase; letter-spacing:0.4px;">Bugungi tushum (kassa)</div>
        <div class="stat-card__value" style="color: #34D399; font-size:18px; font-weight:800; margin-top:4px; font-variant-numeric:tabular-nums;">${formatMoney(summary.todaysPaymentsTotal || 0)}</div>
      </div>
    </div>

    <div class="form-group" style="margin-bottom: 16px;">
      <button class="btn btn--full" style="background: linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(126,34,206,0.2) 100%); border: 1.5px solid rgba(168,85,247,0.45); color: #C084FC; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:14px; border-radius:14px; font-weight:700; box-shadow:0 4px 16px rgba(168,85,247,0.2);" onclick="showDebtorShopsList()">${Icons.wallet} Qarzdor do'konlar ro'yxati</button>
    </div>
    ${overdueHtml}
    ${lowStockHtml}
  `;
}

function renderDailyPicker(el) {
    const today = getLocalDateString();
    el.innerHTML = `
    <div class="form-group" style="margin-bottom:14px;">
      <label class="form-label" style="display:flex; align-items:center; gap:6px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>Sanani tanlang</span>
      </label>
      <input type="date" class="form-input" id="dailyDateInput" value="${today}" max="${today}" onchange="loadDailyReport()">
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
        resultEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function renderDailyReportHtml(report) {
    const revenue = report.revenueByType || {};
    const totalSalesForDay = (report.totalSalesAmount != null)
        ? report.totalSalesAmount
        : (report.sales || []).reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    const salesHtml = report.sales.length ? report.sales.map(s => `
    <div class="sale-basket-item" style="cursor:default;">
      <div style="min-width:0; flex:1;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
          <span style="font-weight:700; color:#FFFFFF; font-size:14.5px;">${escHtml(s.shopName)}</span>
          ${formatAdminBadge(s.createdBy)}
        </div>
        <div style="font-size:12px; color:#94A3B8; margin-top:3px;">${s.paymentType}</div>
      </div>
      <div class="ledger-row__amount amount--debt" style="font-size:13.5px; padding:6px 12px; font-weight:800; margin-left:10px;">${formatMoney(s.amount)}</div>
    </div>
  `).join('') : '<div class="empty-state">Bu kuni sotuv bo\'lmagan</div>';

    const paymentsHtml = report.payments.length ? report.payments.map(p => `
    <div class="sale-basket-item" style="cursor:default;">
      <div style="min-width:0; flex:1;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
          <span style="font-weight:700; color:#FFFFFF; font-size:14.5px;">${escHtml(p.shopName)}</span>
          ${formatAdminBadge(p.createdBy)}
        </div>
        <div style="font-size:12px; color:#34D399; margin-top:3px; font-weight:600;">To'lov qabul qilindi</div>
      </div>
      <div class="ledger-row__amount amount--paid" style="font-size:13.5px; padding:6px 12px; font-weight:800; margin-left:10px;">${formatMoney(p.amount)}</div>
    </div>
  `).join('') : '<div class="empty-state">Bu kuni to\'lov bo\'lmagan</div>';

    return `
    <div class="form-group" style="margin-bottom:14px;">
      <button class="btn btn--primary btn--full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:12px; border-radius:12px;" onclick="downloadDailyExcel()">${Icons.download} Excel'ga yuklab olish</button>
    </div>

    <div class="stat-card stat-card--glow-blue" style="margin-bottom:12px; padding:18px 16px;">
      <div class="stat-card__label" style="text-transform:uppercase; letter-spacing:0.8px; font-size:11.5px; font-weight:700; color:#93C5FD;">Kunlik savdo</div>
      <div class="stat-card__value" style="font-size:26px; font-weight:800; color:#38BDF8; margin-top:4px;">${formatMoney(totalSalesForDay)}</div>
    </div>

    <div class="stat-card stat-card--glow-emerald" style="margin-bottom:12px; padding:18px 16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08);">
        <div class="stat-card__label" style="font-weight:700; color:#34D399; margin:0; text-transform:uppercase; letter-spacing:0.5px; font-size:11.5px;">Kassaga tushgan to'lovlar</div>
        <span style="font-size:16px; font-weight:800; color:#34D399; font-variant-numeric:tabular-nums;">${formatMoney((Number(revenue.NAQD) || 0) + (Number(revenue.KARTA) || 0))}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px;">
        <span style="color:#94A3B8;">💵 Naqd to'lov:</span><span style="font-variant-numeric:tabular-nums; font-weight:700; color:#FFFFFF;">${formatMoney(revenue.NAQD || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:13px;">
        <span style="color:#94A3B8;">💳 Karta orqali:</span><span style="font-variant-numeric:tabular-nums; font-weight:700; color:#FFFFFF;">${formatMoney(revenue.KARTA || 0)}</span>
      </div>
    </div>

    <div class="stat-card stat-card--glow-amber" style="margin-bottom:16px; padding:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="stat-card__label" style="color:#FBBF24; font-weight:700; margin:0; font-size:12.5px;">Nasiyaga berilgan savdo</div>
        <span style="font-size:15px; font-weight:800; color:#FBBF24; font-variant-numeric:tabular-nums;">${formatMoney(revenue.NASIYA || 0)}</span>
      </div>
    </div>

    <div class="section-title">${Icons.box} Kimga sotildi</div>
    ${salesHtml}

    <div class="section-title" style="margin-top:16px;">${Icons.money} Kimdan olindi</div>
    ${paymentsHtml}
  `;
}

function renderMonthlyPicker(el) {
    const currentMonth = getLocalMonthString();
    el.innerHTML = `
    <div class="form-group">
      <label class="form-label">Oyni tanlang</label>
      <input type="month" class="form-input" id="monthlyInput" value="${currentMonth}" max="${currentMonth}" onchange="loadMonthlyReport()">
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
        resultEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function renderMonthlyReportHtml(report) {
    const revenue = report.revenueByType || {};

    const productVolHtml = report.productSalesVolume.length ? report.productSalesVolume.map(p => `
    <div class="sale-basket-item" style="cursor:default;">
      <div style="min-width:0; flex:1;">
        <div style="font-weight:700; color:#FFFFFF; font-size:14.5px;">${escHtml(p.productName)}</div>
      </div>
      <div class="ledger-row__amount" style="background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.35); color:#38BDF8; font-weight:800; font-size:13px; padding:4px 12px;">${p.totalPackagesSold} ta sotildi</div>
    </div>
  `).join('') : '<div class="empty-state">Ma\'lumot yo\'q</div>';

    return `
    <div class="form-group" style="margin-bottom:14px;">
      <button class="btn btn--primary btn--full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:12px; border-radius:12px;" onclick="downloadMonthlyExcel()">${Icons.download} Excel'ga yuklab olish</button>
    </div>

    <div class="stat-card stat-card--glow-blue" style="margin-bottom:12px; padding:18px 16px;">
      <div class="stat-card__label" style="text-transform:uppercase; letter-spacing:0.8px; font-size:11.5px; font-weight:700; color:#93C5FD;">Oylik savdo</div>
      <div class="stat-card__value" style="font-size:26px; font-weight:800; color:#38BDF8; margin-top:4px;">${formatMoney(report.totalSalesAmount)}</div>
    </div>
    
    <div class="stat-card stat-card--glow-emerald" style="margin-bottom:12px; padding:18px 16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08);">
        <div class="stat-card__label" style="font-weight:700; color:#34D399; margin:0; text-transform:uppercase; letter-spacing:0.5px; font-size:11.5px;">Kassaga tushgan to'lovlar</div>
        <span style="font-size:16px; font-weight:800; color:#34D399; font-variant-numeric:tabular-nums;">${formatMoney((Number(revenue.NAQD) || 0) + (Number(revenue.KARTA) || 0))}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px;">
        <span style="color:#94A3B8;">💵 Naqd to'lov:</span><span style="font-variant-numeric:tabular-nums; font-weight:700; color:#FFFFFF;">${formatMoney(revenue.NAQD || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:13px;">
        <span style="color:#94A3B8;">💳 Karta orqali:</span><span style="font-variant-numeric:tabular-nums; font-weight:700; color:#FFFFFF;">${formatMoney(revenue.KARTA || 0)}</span>
      </div>
    </div>

    <div class="stat-card stat-card--glow-amber" style="margin-bottom:16px; padding:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="stat-card__label" style="color:#FBBF24; font-weight:700; margin:0; font-size:12.5px;">Nasiyaga berilgan savdo</div>
        <span style="font-size:15px; font-weight:800; color:#FBBF24; font-variant-numeric:tabular-nums;">${formatMoney(revenue.NASIYA || 0)}</span>
      </div>
    </div>

    <div class="section-title">${Icons.chart} Mahsulot bo'yicha sotuv</div>
    ${productVolHtml}
  `;
}


function showEditMarketGroupForm(id, currentName) {
    updateHeaderMeta('Toifani tahrirlash', currentName || 'Nomini o\'zgartirish', 'TAHRIR');
    setBackAction(showMarketGroups, 'editMarketGroup');
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
                <button class="btn btn--primary btn--full" id="submitEditMarketGroupBtn" onclick="submitEditMarketGroup(${id})">
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
    const btn = document.getElementById('submitEditMarketGroupBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Saqlanmoqda...';
    }
    try {
        await apiPut(`/market-groups/${id}`, { name });
        showToast('Toifa nomi yangilandi', 'success');
        showMarketGroups();
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} O'zgarishlarni saqlash`;
        }
    }
}

async function deleteMarketGroup(id, name) {
    showConfirmDialog({
        title: "Toifani o'chirish",
        itemName: name || 'Bozor toifasi',
        message: "Rostdan ham shu bozor toifasini o'chirmoqchimisiz? Toifani o'chirish uchun uning ichida faol do'konlar bo'lmasligi kerak.",
        confirmText: "O'chirish",
        cancelText: "Bekor qilish",
        onConfirm: async () => {
            try {
                await apiDelete(`/market-groups/${id}`);
                showToast('Toifa muvaffaqiyatli o\'chirildi', 'success');
                showMarketGroups();
            } catch (err) {
                showToast('Xatolik: ' + err.message, 'error');
            }
        }
    });
}


function showEditShopForm(id, name, ownerName, phone) {
    updateHeaderMeta('Do\'konni tahrirlash', name || 'Ma\'lumotlarni yangilash', 'TAHRIR');
    setBackAction(() => currentGroupId ? showShops(currentGroupId, currentGroupName) : showMarketGroups(), 'editShop');
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
                <button class="btn btn--primary btn--full" id="submitEditShopBtn" onclick="submitEditShop(${id})">
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

    const btn = document.getElementById('submitEditShopBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Saqlanmoqda...';
    }

    try {
        await apiPut(`/shops/${id}`, { name, ownerName, phone, marketGroupId: currentGroupId });
        showToast('Do\'kon ma\'lumotlari yangilandi', 'success');
        showShops(currentGroupId, currentGroupName);
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} O'zgarishlarni saqlash`;
        }
    }
}

async function deleteShop(id, name, debt = 0) {
    if (debt > 0) {
        showToast(`Ushbu do'konda ${formatMoney(debt)} qarz mavjud! Do'konni o'chirishdan oldin qarzni to'liq yoping.`, 'warning');
        return;
    }
    if (debt < 0) {
        showToast(`Ushbu do'konda ${formatMoney(Math.abs(debt))} avans (haqdorlik) mavjud! Avval hisob-kitobni yakunlang.`, 'warning');
        return;
    }

    showConfirmDialog({
        title: "Do'konni o'chirish",
        itemName: name || "Do'kon",
        message: "Rostdan ham shu do'konni o'chirmoqchimisiz? Uning butun savdo va to'lovlar tarixi butunlay o'chiriladi.",
        confirmText: "O'chirish",
        cancelText: "Bekor qilish",
        onConfirm: async () => {
            try {
                await apiDelete(`/shops/${id}`);
                showToast('Do\'kon muvaffaqiyatli o\'chirildi', 'success');
                showShops(currentGroupId, currentGroupName);
            } catch (err) {
                showToast('Xatolik: ' + err.message, 'error');
            }
        }
    });
}

async function showEditProductForm(id) {
    updateHeaderMeta('Mahsulotni tahrirlash', 'Nomini yangilash', 'TAHRIR');
    setBackAction(showProducts, 'editProduct');
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
                    <div class="form-card__desc">Mahsulot nomini tahrirlash</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="pNameInput">
                    <span class="label-icon">${Icons.box}</span>
                    <span>Mahsulot nomi</span>
                </label>
                <input type="text" class="form-input" id="pNameInput" value="${escAttr(p.name)}">
            </div>

            <div class="form-group">
                <label class="form-label" for="pUnitInput">
                    <span class="label-icon">${Icons.info}</span>
                    <span>Birlik / Izoh (ixtiyoriy)</span>
                </label>
                <input type="text" class="form-input" id="pUnitInput" value="${escAttr(p.unit || '')}" placeholder="Masalan: qop, karobka, dona">
            </div>

            <div class="form-group" style="margin-top: 24px;">
                <button class="btn btn--primary btn--full" id="submitEditProductBtn" onclick="submitEditProduct(${id})">
                    ${Icons.check} O'zgarishlarni saqlash
                </button>
            </div>
        </div>
    `;
    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

async function submitEditProduct(id) {
    const name = document.getElementById('pNameInput').value.trim();
    const unit = document.getElementById('pUnitInput').value.trim();

    if (!name) {
        showToast('Mahsulot nomini kiriting', 'error');
        return;
    }

    const btn = document.getElementById('submitEditProductBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Saqlanmoqda...';
    }

    try {
        await apiPut(`/products/${id}`, { name, unit: unit || null });
        showToast('Mahsulot muvaffaqiyatli saqlandi', 'success');
        showProducts();
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} O'zgarishlarni saqlash`;
        }
    }
}

async function deleteProduct(id, name) {
    showConfirmDialog({
        title: "Mahsulotni o'chirish",
        itemName: name || "Mahsulot",
        message: "Rostdan ham shu mahsulotni katalogdan o'chirmoqchimisiz?",
        confirmText: "O'chirish",
        cancelText: "Bekor qilish",
        onConfirm: async () => {
            try {
                await apiDelete(`/products/${id}`);
                showToast("Mahsulot muvaffaqiyatli o'chirildi", 'success');
                showProducts();
            } catch (err) {
                showToast('Xatolik: ' + err.message, 'error');
            }
        }
    });
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
        <input type="date" class="form-input" id="rangeStartInput" value="${weekAgo}" max="${today}" onchange="loadRangeReport()">
      </div>
      <div style="flex:1;">
        <label class="form-label">Tugash sanasi</label>
        <input type="date" class="form-input" id="rangeEndInput" value="${today}" max="${today}" onchange="loadRangeReport()">
      </div>
    </div>
    <div id="rangeReportResult"></div>
  `;
    loadRangeReport();
}

async function loadRangeReport() {
    const start = document.getElementById('rangeStartInput').value;
    const end = document.getElementById('rangeEndInput').value;
    if (start && end && start > end) {
        showToast("Boshlanish sanasi tugash sanasidan katta bo'lishi mumkin emas", 'warning');
        const resultEl = document.getElementById('rangeReportResult');
        if (resultEl) resultEl.innerHTML = '<div class="empty-state">Boshlanish sanasi tugash sanasidan kichik yoki teng bo\'lishi kerak</div>';
        return;
    }
    const resultEl = document.getElementById('rangeReportResult');
    resultEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        const report = await apiGet(`/reports/range?start=${start}&end=${end}`);
        resultEl.innerHTML = renderRangeReportHtml(report);
    } catch (err) {
        resultEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function renderRangeReportHtml(report) {
    const revenue = report.revenueByType || {};


    const stockInVolHtml = report.stockInVolume && report.stockInVolume.length ? report.stockInVolume.map(s => `
  <div class="sale-basket-item" style="cursor:default;">
    <div style="min-width:0; flex:1;">
      <div style="font-weight:700; color:#FFFFFF; font-size:14.5px;">${escHtml(s.productName)}</div>
    </div>
    <div class="ledger-row__amount amount--paid" style="font-size:13px; font-weight:800; padding:4px 12px;">+${s.totalPackagesReceived} ta qabul</div>
  </div>
`).join('') : '<div class="empty-state">Ma\'lumot yo\'q</div>';

    const productVolHtml = report.productSalesVolume.length ? report.productSalesVolume.map(p => `
    <div class="sale-basket-item" style="cursor:default;">
      <div style="min-width:0; flex:1;">
        <div style="font-weight:700; color:#FFFFFF; font-size:14.5px;">${escHtml(p.productName)}</div>
      </div>
      <div class="ledger-row__amount" style="background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.35); color:#38BDF8; font-weight:800; font-size:13px; padding:4px 12px;">${p.totalPackagesSold} ta sotildi</div>
    </div>
  `).join('') : '<div class="empty-state">Ma\'lumot yo\'q</div>';

    return `
    <div class="form-group" style="margin-bottom:14px;">
      <button class="btn btn--primary btn--full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:12px; border-radius:12px;" onclick="downloadRangeExcel()">${Icons.download} Excel'ga yuklab olish</button>
    </div>

    <div class="stat-card stat-card--glow-blue" style="margin-bottom:12px; padding:18px 16px;">
      <div class="stat-card__label" style="text-transform:uppercase; letter-spacing:0.8px; font-size:11.5px; font-weight:700; color:#93C5FD;">Umumiy savdo</div>
      <div class="stat-card__value" style="font-size:26px; font-weight:800; color:#38BDF8; margin-top:4px;">${formatMoney(report.totalSalesAmount)}</div>
    </div>

    <div class="stat-card stat-card--glow-emerald" style="margin-bottom:12px; padding:18px 16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08);">
        <div class="stat-card__label" style="font-weight:700; color:#34D399; margin:0; text-transform:uppercase; letter-spacing:0.5px; font-size:11.5px;">Kassaga tushgan to'lovlar</div>
        <span style="font-size:16px; font-weight:800; color:#34D399; font-variant-numeric:tabular-nums;">${formatMoney((Number(revenue.NAQD) || 0) + (Number(revenue.KARTA) || 0))}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px;">
        <span style="color:#94A3B8;">💵 Naqd to'lov:</span><span style="font-variant-numeric:tabular-nums; font-weight:700; color:#FFFFFF;">${formatMoney(revenue.NAQD || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:13px;">
        <span style="color:#94A3B8;">💳 Karta orqali:</span><span style="font-variant-numeric:tabular-nums; font-weight:700; color:#FFFFFF;">${formatMoney(revenue.KARTA || 0)}</span>
      </div>
    </div>

    <div class="stat-card stat-card--glow-amber" style="margin-bottom:16px; padding:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="stat-card__label" style="color:#FBBF24; font-weight:700; margin:0; font-size:12.5px;">Nasiyaga berilgan savdo</div>
        <span style="font-size:15px; font-weight:800; color:#FBBF24; font-variant-numeric:tabular-nums;">${formatMoney(revenue.NASIYA || 0)}</span>
      </div>
    </div>

    <div class="section-title">${Icons.chart} Mahsulot bo'yicha sotuv</div>
    ${productVolHtml}

    <div class="section-title" style="margin-top:16px;">${Icons.box} Mahsulot kirimi</div>
    ${stockInVolHtml}
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
    if (start && end && start > end) {
        showToast("Boshlanish sanasi tugash sanasidan katta bo'lishi mumkin emas", 'warning');
        return;
    }
    window.location.href = `${API_BASE}/reports/range/export?start=${start}&end=${end}`;
}

async function showDebtorShopsList() {
    updateHeaderMeta('Qarzdor do\'konlar', 'Muddati o\'tgan va joriy qarzlar', 'QARZ');
    setBackAction(() => { dashboardTab = 'umumiy'; showDashboard(); }, 'debtorShops');
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

        const totalDebtorsDebt = debtors.reduce((sum, s) => sum + (Number(s.currentDebt) || 0), 0);

        contentEl.innerHTML = `
            <div class="market-summary-bar">
                <div class="market-summary-item">
                    <span>⚠️</span>
                    <span>Qarzdorlar: <strong>${debtors.length} ta do'kon</strong></span>
                </div>
                <div class="market-summary-divider"></div>
                <div class="market-summary-item">
                    <span>💳</span>
                    <span>Jami qarz: <strong style="color:#F87171;">${formatMoney(totalDebtorsDebt)}</strong></span>
                </div>
            </div>
            ${debtors.map(shop => {
                const debt = Number(shop.currentDebt) || 0;
                const initial = (shop.name && shop.name.trim().length > 0) ? shop.name.trim()[0].toUpperCase() : 'D';
                const theme = getShopTheme(shop.id, shop.name);
                const rawPhone = (shop.phone || '').replace(/[^\d+]/g, '');
                const cleanPhone = (shop.phone || '').replace(/[^\d]/g, '');

                return `
                    <div class="shop-card" style="
                        --card-accent: #F43F5E;
                        --card-glow: rgba(244, 63, 94, 0.2);
                        --card-glow-hover: rgba(244, 63, 94, 0.35);
                        margin-bottom: 13px;
                        padding: 14px 16px;
                    " onclick="currentGroupId=${shop.marketGroupId}; currentGroupName='${escJs(shop.marketGroupName || '')}'; showShopDetail(${shop.id})">
                        <!-- 1-qator: Avatar, Do'kon nomi va Bozor/Telefon (To'liq kenglikda) -->
                        <div style="display:flex; align-items:center; gap:12px; margin-bottom:11px;">
                            <div class="shop-card__avatar" style="
                                background: ${theme.avatarBg};
                                border: 1.5px solid ${theme.avatarBorder};
                                color: ${theme.avatarColor};
                                box-shadow: 0 4px 14px ${theme.avatarShadow};
                            ">
                                ${escHtml(initial)}
                            </div>
                            <div style="flex:1; min-width:0;">
                                <div style="font-family:var(--font-heading); font-size:16px; font-weight:700; color:#FFFFFF; letter-spacing:-0.2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-transform:uppercase;">
                                    ${escHtml(shop.name)}
                                </div>
                                <div style="font-size:12px; color:#94A3B8; margin-top:3px; display:flex; align-items:center; gap:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                    <span class="shop-card__meta">${escHtml(shop.marketGroupName || '')}</span>
                                    ${shop.phone ? `<span style="opacity:0.35;">·</span><span class="shop-card__meta" style="color:#38BDF8;">${Icons.phoneAction} <span>${escHtml(shop.phone)}</span></span>` : ''}
                                </div>
                            </div>
                            <span class="market-card__chevron" style="flex-shrink:0; opacity:0.65; margin-left:4px;">${Icons.chevronRight}</span>
                        </div>

                        <!-- 2-qator: Maxsus Do'kon Qarzi Paneli -->
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; background:rgba(0,0,0,0.25); border:1px solid rgba(244,63,94,0.25); border-radius:12px; padding:8px 12px; margin-bottom:11px;">
                            <div style="display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:var(--color-ink-dim);">
                                <span style="font-size:11px;">🔴</span>
                                <span>Do'kon qarzi:</span>
                            </div>
                            <div style="font-size:14.5px; font-weight:800; color:#FB7185; font-variant-numeric:tabular-nums; white-space:nowrap;">
                                ${formatMoney(debt)}
                            </div>
                        </div>

                        <!-- 3-qator: Qo'ng'iroq va Telegram -->
                        <div class="shop-card__actions" onclick="event.stopPropagation()">
                            <div class="shop-card__action-group">
                                ${rawPhone ? `
                                    <a href="tel:${escAttr(rawPhone)}" class="action-chip action-chip--call" title="Qo'ng'iroq qilish">
                                        ${Icons.phoneAction}
                                        <span>Qo'ng'iroq</span>
                                    </a>
                                ` : ''}
                                ${cleanPhone ? `
                                    <a href="https://t.me/+${escAttr(cleanPhone)}" target="_blank" rel="noopener noreferrer" class="action-chip action-chip--telegram" title="Telegram">
                                        ${Icons.tgAction}
                                        <span>Telegram</span>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;

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

// ==========================================
// 8. BAZA ZAXIRA NUSXASI (BACKUP & RESTORE)
// ==========================================

async function downloadDatabaseExcelBackup() {
    showToast('Baza Excel (.xlsx) fayli tayyorlanmoqda...', 'info');
    try {
        const response = await fetch('/api/backup/download-excel');
        if (handleAuthRedirect(response)) return;
        if (!response.ok) {
            throw new Error('Excel zaxirasini yuklashda xatolik yuz berdi');
        }
        const blob = await response.blob();
        const contentDisp = response.headers.get('content-disposition');
        let filename = 'Bozor_Distributor_Baza.xlsx';
        if (contentDisp && contentDisp.includes('filename=')) {
            const match = contentDisp.match(/filename="?([^";]+)"?/);
            if (match && match[1]) filename = match[1];
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showToast('Excel baza fayli muvaffaqiyatli yuklab olindi!', 'success');
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
    }
}

async function downloadDatabaseBackup() {
    showToast('Baza JSON zaxira nusxasi tayyorlanmoqda...', 'info');
    try {
        const response = await fetch('/api/backup/download');
        if (handleAuthRedirect(response)) return;
        if (!response.ok) {
            throw new Error('Zaxira faylini olishda xatolik yuz berdi');
        }
        const blob = await response.blob();
        const contentDisp = response.headers.get('content-disposition');
        let filename = 'distributor_baza_backup.json';
        if (contentDisp && contentDisp.includes('filename=')) {
            const match = contentDisp.match(/filename="?([^";]+)"?/);
            if (match && match[1]) filename = match[1];
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showToast('Baza nusxasi muvaffaqiyatli yuklab olindi!', 'success');
    } catch (err) {
        showToast('Xatolik: ' + err.message, 'error');
    }
}

function triggerRestoreBackup() {
    const fileInput = document.getElementById('backupFileInput');
    if (fileInput) {
        fileInput.value = '';
        fileInput.click();
    }
}

async function onBackupFileSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    showRestorePasswordModal(file);
}

function showRestorePasswordModal(file) {
    let dialogEl = document.getElementById('globalConfirmDialog');
    if (!dialogEl) {
        dialogEl = document.createElement('div');
        dialogEl.id = 'globalConfirmDialog';
        dialogEl.className = 'confirm-overlay';
        document.body.appendChild(dialogEl);
    }

    dialogEl.innerHTML = `
        <div class="confirm-backdrop" onclick="closeConfirmDialog()"></div>
        <div class="confirm-card">
            <div class="confirm-icon-wrap">
                <div class="confirm-icon-badge" style="background: rgba(239, 68, 68, 0.15); color: #EF4444;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
            </div>
            <div class="confirm-title">Bazani tiklashni tasdiqlang</div>
            <div class="confirm-item-name" style="word-break: break-all;">${escHtml(file.name)}</div>
            <div class="confirm-message" style="margin-bottom: 14px;">
                DIQQAT: Ushbu fayldagi ma'lumotlar qayta tiklanadi. Bu amal mavjud barcha ma'lumotlarni almashtiradi.<br><br>
                Xavfsizlik yuzasidan <strong>administrator paroli</strong>ni kiriting:
            </div>
            <div class="form-group" style="margin-bottom: 18px; text-align: left;">
                <input type="password" id="restoreAdminPasswordInput" class="form-input" placeholder="Admin parolini kiriting" autofocus style="text-align:center; font-size:15px; letter-spacing:1px;">
            </div>
            <div class="confirm-actions">
                <button type="button" class="confirm-btn-cancel" onclick="closeConfirmDialog()">Bekor qilish</button>
                <button type="button" class="confirm-btn-danger" id="confirmRestoreBtn">Tasdiqlash va Tiklash</button>
            </div>
        </div>
    `;
    dialogEl.classList.add('show');

    const input = document.getElementById('restoreAdminPasswordInput');
    const btn = document.getElementById('confirmRestoreBtn');

    const handleConfirm = async () => {
        const password = input.value.trim();
        if (!password) {
            showToast('Administrator parolini kiritishingiz shart!', 'error');
            input.focus();
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Tekshirilmoqda...';

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('password', password);

            showToast('Baza tekshirilmoqda va tiklanmoqda...', 'info');

            const response = await fetch('/api/backup/restore', {
                method: 'POST',
                body: formData
            });

            if (handleAuthRedirect(response)) return;

            const result = await response.json().catch(() => ({}));
            if (response.ok && result.success) {
                closeConfirmDialog();
                closeBottomSheet();
                showToast('Baza muvaffaqiyatli tiklandi! Sahifa yangilanmoqda...', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1600);
            } else {
                btn.disabled = false;
                btn.textContent = 'Tasdiqlash va Tiklash';
                showToast(result.message || 'Parol noto\'g\'ri yoki fayl buzilgan', 'error');
            }
        } catch (err) {
            btn.disabled = false;
            btn.textContent = 'Tasdiqlash va Tiklash';
            showToast('Tiklashda xatolik: ' + err.message, 'error');
        }
    };

    btn.onclick = handleConfirm;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleConfirm();
    });
}

// ==========================================
// 9. DO'KON AKT SVERKA VA CHOP ETISH (PDF)
// ==========================================

function generateStatementPaperHtml(ledger, shopId) {
    const entries = ledger.entries || [];
    const debt = Number(ledger.currentDebt) || 0;
    const totalSales = Number(ledger.totalSalesAmount) || 0;
    const totalPayments = Number(ledger.totalPaymentsAmount) || 0;
    const genDate = new Date().toLocaleString('uz-UZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    let balanceStyle = '';
    let balanceText = '';
    if (debt > 0) {
        balanceText = formatMoney(debt) + " (Qarz)";
        balanceStyle = 'color: #DC2626;';
    } else if (debt < 0) {
        balanceText = formatMoney(Math.abs(debt)) + " (Avans)";
        balanceStyle = 'color: #059669;';
    } else {
        balanceText = "0 so'm (Qarzsiz)";
        balanceStyle = 'color: #475569;';
    }

    let rowsHtml = '';
    if (entries.length === 0) {
        rowsHtml = `
            <tr>
                <td colspan="6" style="text-align:center; padding:30px; color:#64748B; font-style:italic;">
                    Ushbu do'kon bo'yicha hali savdo yoki to'lov amaliyotlari mavjud emas.
                </td>
            </tr>
        `;
    } else {
        rowsHtml = entries.map((entry, index) => {
            const isSale = entry.type === 'SOTUV';
            const entryDate = entry.date ? new Date(entry.date).toLocaleString('uz-UZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '—';

            const isCancelled = Boolean(entry.isCancelled);
            let typeBadge = '';
            if (isCancelled) {
                typeBadge = `<span class="pdf-badge" style="background:#FEE2E2; color:#B91C1C; border:1px solid #FCA5A5;">BEKOR</span>`;
            } else if (isSale) {
                typeBadge = `<span class="pdf-badge pdf-badge--sale"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> SOTUV</span>`;
            } else {
                typeBadge = `<span class="pdf-badge pdf-badge--payment"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> TO'LOV</span>`;
            }

            let detailHtml = `<div style="font-weight:600; color:#0F172A; ${isCancelled ? 'text-decoration: line-through; opacity:0.7;' : ''}">${escHtml(entry.description || (isSale ? 'Tovarlar yetkazildi' : "To'lov qabul qilindi"))}</div>`;

            if (isCancelled) {
                detailHtml += `<div style="color:#DC2626; font-size:11px; margin-top:2px;">(Bekor qilingan: ${escHtml(entry.cancelReason || 'Sabab ko\'rsatilmadi')})</div>`;
            }

            if (isSale && entry.items && entry.items.length > 0) {
                detailHtml += `
                    <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; padding:6px 8px; margin-top:6px; font-size:11.5px; line-height:1.5;">
                        ${entry.items.map(it => `
                            <div style="display:flex; justify-content:space-between; gap:10px; border-bottom:1px dashed #E2E8F0; padding:2px 0;">
                                <span>📦 <b>${escHtml(it.productName)}</b> &nbsp;<span style="color:#64748B;">(${it.packageCount} dona × ${formatMoney(it.price)})</span></span>
                                <span style="font-weight:700; color:#1E293B;">${formatMoney(it.total)}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                if (entry.initialPaidAmount && Number(entry.initialPaidAmount) > 0) {
                    detailHtml += `
                        <div style="font-size:11px; color:#047857; margin-top:4px; font-weight:600;">
                            ✓ Yetkazish vaqtida to'langan qism: ${formatMoney(entry.initialPaidAmount)}
                        </div>
                    `;
                }
            } else if (!isSale) {
                detailHtml += `
                    <div style="display:flex; gap:6px; align-items:center; margin-top:4px;">
                        <span class="pdf-badge" style="background:#FEF3C7; color:#92400E; border:1px solid #FDE68A;">Usul: ${escHtml(entry.paymentMethod || 'Naqd')}</span>
                    </div>
                `;
            }

            let amountText = `${isSale ? '+' : '−'}${formatMoney(entry.amount)}`;
            let amountColor = isSale ? '#2563EB' : '#059669';
            if (isCancelled) {
                amountText = `<del style="color:#94A3B8;">${amountText}</del>`;
                amountColor = '#94A3B8';
            }

            const balanceVal = Number(entry.balanceAfter) || 0;
            let balanceColText = '';
            let balanceColColor = '';
            if (balanceVal > 0) {
                balanceColText = formatMoney(balanceVal);
                balanceColColor = '#DC2626';
            } else if (balanceVal < 0) {
                balanceColText = 'Avans: ' + formatMoney(Math.abs(balanceVal));
                balanceColColor = '#059669';
            } else {
                balanceColText = "0 so'm";
                balanceColColor = '#64748B';
            }

            return `
                <tr>
                    <td style="color:#64748B; font-weight:600; text-align:center;">${index + 1}</td>
                    <td style="white-space:nowrap; font-size:12px; color:#334155;">${entryDate}</td>
                    <td>${typeBadge}</td>
                    <td>${detailHtml}</td>
                    <td style="text-align:right; font-weight:800; font-variant-numeric:tabular-nums; color:${amountColor}; white-space:nowrap;">${amountText}</td>
                    <td style="text-align:right; font-weight:700; font-variant-numeric:tabular-nums; color:${balanceColColor}; white-space:nowrap;">${balanceColText}</td>
                </tr>
            `;
        }).join('');
    }

    return `
        <div class="statement-paper">
            <!-- Hujjat sarlavhasi (Header) -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0F172A; padding-bottom:14px; margin-bottom:18px; gap:16px;">
                <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:22px; font-weight:900; letter-spacing:-0.5px; color:#0F172A;">BOZOR DISTRIBUTOR</span>
                        <span class="pdf-badge" style="background:#0F172A; color:#FFFFFF; font-size:10px;">RASMIY AKT</span>
                    </div>
                    <div style="font-size:12px; color:#64748B; margin-top:2px; font-weight:500;">
                        Tovarlar distribyutsiyasi va o'zaro hisob-kitoblar tizimi
                    </div>
                </div>
                <div style="text-align:right; font-size:12px; color:#475569; line-height:1.5;">
                    <div>Hujjat №: <b style="color:#0F172A;">AKT-${shopId}</b></div>
                    <div>Sana: <b>${genDate}</b></div>
                </div>
            </div>

            <!-- Hujjat nomi -->
            <div style="text-align:center; margin-bottom:18px;">
                <h2 style="margin:0; font-size:18px; font-weight:800; color:#0F172A; text-transform:uppercase; letter-spacing:0.5px;">
                    O'zaro hisob-kitoblar dalolatnomasi (Akt sverka)
                </h2>
                <div style="font-size:12px; color:#64748B; margin-top:4px;">
                    Yetkazib beruvchi va xaridor o'rtasidagi barcha tovar va to'lovlar tarixi
                </div>
            </div>

            <!-- Do'kon rekvizitlari -->
            <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:12px; padding:12px 16px; margin-bottom:18px;">
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; font-size:12.5px;">
                    <div>
                        <span style="color:#64748B; display:block; font-size:11px; text-transform:uppercase; font-weight:700;">Do'kon nomi:</span>
                        <span style="font-weight:800; font-size:14px; color:#0F172A;">${escHtml(ledger.shopName)}</span>
                    </div>
                    <div>
                        <span style="color:#64748B; display:block; font-size:11px; text-transform:uppercase; font-weight:700;">Mas'ul shaxs (Egasi):</span>
                        <span style="font-weight:700; color:#1E293B;">${escHtml(ledger.ownerName || '—')}</span>
                    </div>
                    <div>
                        <span style="color:#64748B; display:block; font-size:11px; text-transform:uppercase; font-weight:700;">Telefon raqami:</span>
                        <span style="font-weight:700; color:#1E293B;">${escHtml(ledger.phone || '—')}</span>
                    </div>
                    <div>
                        <span style="color:#64748B; display:block; font-size:11px; text-transform:uppercase; font-weight:700;">Bozor / Hudud:</span>
                        <span style="font-weight:700; color:#1E293B;">${escHtml(ledger.marketGroupName || 'Umumiy')}</span>
                    </div>
                </div>
            </div>

            <!-- Moliyaviy ko'rsatkichlar (KPIs) -->
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:20px;">
                <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:12px 14px; text-align:center;">
                    <div style="font-size:11px; font-weight:700; color:#1D4ED8; text-transform:uppercase; letter-spacing:0.4px;">Jami yetkazilgan</div>
                    <div style="font-size:16px; font-weight:800; color:#1E3A8A; margin-top:4px;">${formatMoney(totalSales)}</div>
                </div>
                <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:10px; padding:12px 14px; text-align:center;">
                    <div style="font-size:11px; font-weight:700; color:#047857; text-transform:uppercase; letter-spacing:0.4px;">Jami to'langan</div>
                    <div style="font-size:16px; font-weight:800; color:#064E3B; margin-top:4px;">${formatMoney(totalPayments)}</div>
                </div>
                <div style="background:#FFF1F2; border:1px solid #FECDD3; border-radius:10px; padding:12px 14px; text-align:center;">
                    <div style="font-size:11px; font-weight:700; color:#BE123C; text-transform:uppercase; letter-spacing:0.4px;">Joriy qoldiq holati</div>
                    <div style="font-size:16px; font-weight:800; margin-top:4px; ${balanceStyle}">${balanceText}</div>
                </div>
            </div>

            <!-- Amaliyotlar jadvali -->
            <div class="pdf-table-wrapper">
                <table class="pdf-table">
                    <thead>
                        <tr>
                            <th style="width:36px; text-align:center;">№</th>
                            <th style="width:115px;">Sana & Vaqt</th>
                            <th style="width:90px;">Amal</th>
                            <th>Tafsilot & Mahsulotlar</th>
                            <th style="width:130px; text-align:right;">Amal summasi</th>
                            <th style="width:125px; text-align:right;">Qoldiq</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>

            <!-- Imzolar va tasdiqlash bloki -->
            <div class="pdf-signature-block" style="margin-top:20px; padding-top:14px; border-top:1px dashed #CBD5E1; page-break-inside:avoid; break-inside:avoid;">
                <div style="font-size:11px; color:#64748B; font-style:italic; text-align:center; margin-bottom:14px;">
                    Mazkur dalolatnoma tomonlar o'rtasida tovar yetkazib berish va o'zaro hisob-kitoblar to'g'riligini tasdiqlaydi.
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; font-size:12px;">
                    <div style="border:1px solid #E2E8F0; border-radius:8px; padding:10px 12px; background:#F8FAFC;">
                        <div style="font-weight:700; color:#0F172A; margin-bottom:4px;">Yetkazib beruvchi:</div>
                        <div style="color:#475569; font-size:11.5px;">"Bozor Distributor" MChJ</div>
                        <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:flex-end;">
                            <span style="color:#64748B;">Imzo: _______________</span>
                            <span style="color:#64748B;">Sana: ____.____.202__</span>
                        </div>
                    </div>
                    <div style="border:1px solid #E2E8F0; border-radius:8px; padding:10px 12px; background:#F8FAFC;">
                        <div style="font-weight:700; color:#0F172A; margin-bottom:4px;">Qabul qiluvchi (Do'kon):</div>
                        <div style="color:#475569; font-size:11.5px;">${escHtml(ledger.shopName)} (${escHtml(ledger.ownerName || "Mas'ul shaxs")})</div>
                        <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:flex-end;">
                            <span style="color:#64748B;">Imzo: _______________</span>
                            <span style="color:#64748B;">Sana: ____.____.202__</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 1 ta bosishda to'g'ridan-to'g'ri chop etish / PDF sifatida saqlash oynasini chaqirish
async function directPrintShopStatement(shopId) {
    showToast("Akt-sverka hujjati tayyorlanmoqda...", "info");
    try {
        const ledger = await apiGet(`/shops/${shopId}/ledger`);
        let printContainer = document.getElementById('printStatementContainer');
        if (!printContainer) {
            printContainer = document.createElement('div');
            printContainer.id = 'printStatementContainer';
            document.body.appendChild(printContainer);
        }

        printContainer.innerHTML = generateStatementPaperHtml(ledger, shopId);

        // Kichik kechikish bilan brauzer DOM ni to'liq chizib olgach chaqiramiz
        setTimeout(() => {
            window.print();
        }, 250);

    } catch (err) {
        showToast("Xatolik: " + err.message, "error");
    }
}

// Modal ko'rinishida ochish (agar kerak bo'lsa)
async function openShopPdfStatement(shopId) {
    const modal = document.getElementById('statementModal');
    if (!modal) return;

    modal.innerHTML = `
        <div style="padding:60px 20px; text-align:center; color:#94A3B8;">
            <div class="spinner" style="margin:0 auto 16px auto;"></div>
            <div style="font-weight:600; font-size:15px; color:#F1F5F9;">Akt-sverka tayyorlanmoqda...</div>
        </div>
    `;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    Nav.onModalOpen();

    try {
        const ledger = await apiGet(`/shops/${shopId}/ledger`);
        modal.innerHTML = `
            <div class="statement-top-bar no-print">
                <button class="btn" onclick="closeStatementModal()" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#F1F5F9; padding:8px 14px; border-radius:10px; font-weight:600; font-size:13px; display:inline-flex; align-items:center; gap:6px;">
                    ✕ Yopish
                </button>
                <button class="btn" onclick="window.print()" style="background:linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color:#FFFFFF; border:none; padding:9px 18px; border-radius:10px; font-weight:700; font-size:13.5px; display:inline-flex; align-items:center; gap:8px;">
                    🖨️ PDF saqlash / Chop etish
                </button>
            </div>
            ${generateStatementPaperHtml(ledger, shopId)}
        `;
    } catch (err) {
        modal.innerHTML = `
            <div class="statement-top-bar">
                <button class="btn" onclick="closeStatementModal()">✕ Yopish</button>
            </div>
            <div class="statement-paper" style="text-align:center; padding:30px;">
                <div style="color:#EF4444; font-weight:700;">Xatolik: ${escHtml(err.message)}</div>
            </div>
        `;
    }
}

function closeStatementModal(popHistory = true) {
    const modal = document.getElementById('statementModal');
    if (modal && modal.classList.contains('show')) {
        modal.classList.remove('show');
        modal.innerHTML = '';
        document.body.style.overflow = '';
        if (popHistory) Nav.onModalClose();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeStatementModal();
    }
});

// ==========================================
// TA'MINOT (BIRJALAR VA TA'MINOTCHILAR MODULI)
// ==========================================
let currentSupplyCategory = 'SHAKAR';
let allSuppliersList = [];
let currentSupplierId = null;
let currentSupplierLedgerData = null;
let currentSupplierLedgerFilterMode = 'all'; // 'all' | 'day'
let currentSupplierLedgerSelectedDate = getLocalDateString();
let currentPurchaseUnit = 'QOP'; // 'QOP' | 'TONNA' | 'KG'
let currentSupplyPaymentMethod = 'NAQD'; // 'NAQD' | 'KARTA' | 'BANK'

function formatDollar(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
    const num = Number(amount);
    const isNegative = num < 0;
    const absVal = Math.abs(num);
    const parts = absVal.toFixed(2).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (isNegative ? '−$' : '$') + intPart + '.' + parts[1];
}

function parseDollar(val) {
    if (!val) return 0;
    const clean = String(val).replace(/\$/g, '').replace(/\s+/g, '').replace(/,/g, '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.max(0, num);
}

function formatSupplyMoney(amount, category) {
    if (category === 'YOG') return formatDollar(amount);
    return formatMoney(amount);
}

async function showSuppliers(category = 'SHAKAR') {
    currentSupplyCategory = category;
    const isOil = category === 'YOG';
    if (isOil) {
        updateHeaderMeta('Ta\'minot', 'Yog\' zavodlari va ta\'minotchilar ($ USD)', 'TA\'MINOT');
    } else {
        updateHeaderMeta('Ta\'minot', 'Ta\'minotchilar va birjalar qarz daftari', 'TA\'MINOT');
    }
    setRootScreen('taminot');
    fabBtn.style.display = 'flex';
    fabBtn.onclick = () => showAddSupplierForm();

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const suppliers = await apiGet('/suppliers?category=' + encodeURIComponent(category));
        allSuppliersList = Array.isArray(suppliers) ? suppliers : [];

        const totalDebt = allSuppliersList.reduce((sum, s) => sum + (Number(s.currentDebt) || 0), 0);

        let html = `
            <!-- Kategoriya tablari (Shakar & Yog') -->
            <div class="tab-bar" style="margin-bottom:14px;">
                <button type="button" class="tab-btn ${currentSupplyCategory === 'SHAKAR' ? 'active' : ''}" onclick="showSuppliers('SHAKAR')" style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                    <span>🍚</span>
                    <span>Shakar</span>
                </button>
                <button type="button" class="tab-btn ${currentSupplyCategory === 'YOG' ? 'active' : ''}" onclick="showSuppliers('YOG')" style="display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                    <span>🛢️</span>
                    <span>Yog'</span>
                    <span style="font-size:10px; background:rgba(16,185,129,0.22); color:#34D399; border:1px solid rgba(16,185,129,0.35); padding:1px 6px; border-radius:6px; font-weight:700;">$ USD</span>
                </button>
            </div>

            <!-- Sarhisob paneli -->
            <div class="market-summary-bar" style="justify-content:space-between; padding:10px 16px;">
                <div class="market-summary-item" style="font-size:12.5px;">
                    <span>🏭</span>
                    <span>Jami: <strong>${allSuppliersList.length} ta ${isOil ? 'zavod' : 'birja'}</strong></span>
                </div>
                <div class="market-summary-divider"></div>
                <div class="market-summary-item" style="font-size:12.5px;">
                    <span>💳</span>
                    <span>Qarzimiz: <strong style="color:${totalDebt > 0 ? '#FB7185' : '#34D399'}; font-variant-numeric:tabular-nums; white-space:nowrap;">${isOil ? formatDollar(totalDebt) : formatMoney(totalDebt)}</strong></span>
                </div>
            </div>

            <!-- Qidiruv maydoni -->
            <div class="form-group" style="padding-bottom:10px;">
                <input type="text" class="form-input" id="supplierSearchInput" placeholder="${isOil ? 'Yog\' zavodi yoki ta\'minotchi nomini qidirish...' : 'Birja yoki ta\'minotchi nomini qidirish...'}" oninput="filterSuppliers()">
            </div>

            <div id="suppliersListContainer"></div>
        `;

        contentEl.innerHTML = html;
        renderSupplierRows(allSuppliersList);

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function filterSuppliers() {
    const q = (document.getElementById('supplierSearchInput')?.value || '').toLowerCase().trim();
    if (!q) {
        renderSupplierRows(allSuppliersList);
        return;
    }
    const filtered = allSuppliersList.filter(s => {
        const nameMatch = (s.name || '').toLowerCase().includes(q);
        const phoneMatch = (s.phone || '').toLowerCase().includes(q);
        return nameMatch || phoneMatch;
    });
    renderSupplierRows(filtered);
}

function renderSupplierRows(suppliers) {
    const container = document.getElementById('suppliersListContainer');
    if (!container) return;

    const isOil = currentSupplyCategory === 'YOG';

    if (!suppliers || suppliers.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 36px 16px;">
                <div style="font-size:36px; margin-bottom:10px;">${isOil ? '🛢️' : '🏭'}</div>
                <div style="font-weight:700; color:#FFF; font-size:16px; margin-bottom:6px;">${isOil ? 'Hali yog\' zavodi yoki ta\'minotchi yo\'q' : 'Hali birja yoki ta\'minotchi yo\'q'}</div>
                <div style="font-size:13px; color:var(--color-ink-dim); max-width:280px; margin:0 auto 16px auto;">${isOil ? 'Pastdagi + tugmasini bosib yog\' olinadigan zavod yoki ta\'minotchilarni qo\'shing (hisob-kitob dollarda).' : 'Pastdagi + tugmasini bosib shakar oladigan birja yoki ta\'minotchilarni qo\'shing.'}</div>
                <button class="btn btn--primary" onclick="showAddSupplierForm()" style="display:inline-flex; align-items:center; gap:8px;">
                    ${Icons.plus} ${isOil ? 'Yangi yog\' ta\'minotchisi qo\'shish' : 'Yangi birja qo\'shish'}
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = suppliers.map(supplier => {
        const debt = Number(supplier.currentDebt) || 0;
        const initial = (supplier.name && supplier.name.trim().length > 0) ? supplier.name.trim()[0].toUpperCase() : (isOil ? 'Y' : 'B');
        const isDebt = debt > 0;
        const supplierIsOil = (supplier.category || currentSupplyCategory) === 'YOG';

        const theme = getShopTheme(supplier.id, supplier.name);
        const rawPhone = (supplier.phone || '').replace(/[^\d+]/g, '');
        const cleanPhone = (supplier.phone || '').replace(/[^\d]/g, '');

        return `
            <div class="shop-card" style="
                --card-accent: ${isDebt ? '#F43F5E' : '#10B981'};
                --card-glow: ${isDebt ? 'rgba(244, 63, 94, 0.2)' : 'rgba(52, 211, 153, 0.18)'};
                --card-glow-hover: ${isDebt ? 'rgba(244, 63, 94, 0.35)' : 'rgba(52, 211, 153, 0.32)'};
                margin-bottom: 13px;
                padding: 14px 16px;
            " onclick="showSupplierDetail(${supplier.id})">
                <!-- 1-qator: Avatar, Ta'minotchi nomi va Telefon raqami (To'liq kenglikda) -->
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:11px;">
                    <div class="shop-card__avatar" style="
                        background: ${theme.avatarBg};
                        border: 1.5px solid ${theme.avatarBorder};
                        color: ${theme.avatarColor};
                        box-shadow: 0 4px 14px ${theme.avatarShadow};
                    ">
                        ${escHtml(initial)}
                    </div>
                    <div style="flex:1; min-width:0;">
                        <div style="font-family:var(--font-heading); font-size:16px; font-weight:700; color:#FFFFFF; letter-spacing:-0.2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-transform:uppercase;">
                            ${escHtml(supplier.name)}
                        </div>
                        <div style="font-size:12px; color:#94A3B8; margin-top:3px; display:flex; align-items:center; gap:5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                            ${supplier.phone ? `<span style="display:inline-flex; align-items:center; gap:4px; color:#38BDF8;">${Icons.phoneAction} <span>${escHtml(supplier.phone)}</span></span>` : '<span style="color:var(--color-ink-dim);">Telefon kiritilmagan</span>'}
                        </div>
                    </div>
                    <span class="market-card__chevron" style="flex-shrink:0; opacity:0.65; margin-left:4px;">${Icons.chevronRight}</span>
                </div>

                <!-- 2-qator: Maxsus Qarz Ko'rsatkichi (To'liq alohida qator) -->
                <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; background:rgba(255,255,255,0.03); border:1px solid ${isDebt ? 'rgba(244,63,94,0.25)' : 'rgba(52,211,153,0.22)'}; border-radius:12px; padding:8px 12px; margin-bottom:11px;">
                    <div style="display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:var(--color-ink-dim);">
                        <span style="font-size:11px;">${isDebt ? '🔴' : '🟢'}</span>
                        <span>${isDebt ? 'Bizning qarzimiz:' : 'Qarzdorlik holati:'}</span>
                    </div>
                    <div style="font-size:14.5px; font-weight:800; color:${isDebt ? '#FB7185' : '#34D399'}; font-variant-numeric:tabular-nums; white-space:nowrap;">
                        ${isDebt ? (supplierIsOil ? formatDollar(debt) : formatMoney(debt)) : (supplierIsOil ? "Qarz yo'q ($0.00)" : "Qarz yo'q (0 so'm)")}
                    </div>
                </div>

                <!-- 3-qator: Qo'ng'iroq, Telegram, Tahrirlash, O'chirish tugmalari -->
                <div class="shop-card__actions" onclick="event.stopPropagation()">
                    <div class="shop-card__action-group">
                        ${rawPhone ? `
                            <a href="tel:${escAttr(rawPhone)}" class="action-chip action-chip--call" title="Qo'ng'iroq qilish">
                                ${Icons.phoneAction}
                                <span>Qo'ng'iroq</span>
                            </a>
                        ` : ''}
                        ${cleanPhone ? `
                            <a href="https://t.me/+${escAttr(cleanPhone)}" target="_blank" rel="noopener noreferrer" class="action-chip action-chip--telegram" title="Telegram">
                                ${Icons.tgAction}
                                <span>Telegram</span>
                            </a>
                        ` : ''}
                    </div>
                    <div class="shop-card__action-group">
                        <button class="market-action-btn" onclick="showEditSupplierForm(${supplier.id})" title="Tahrirlash">${Icons.edit}</button>
                        <button class="market-action-btn market-action-btn--danger" onclick="deleteSupplier(${supplier.id}, '${escJs(supplier.name)}', ${debt}, '${escJs(supplier.category || currentSupplyCategory)}')" title="O'chirish">${Icons.trash}</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showAddSupplierForm() {
    const isOil = currentSupplyCategory === 'YOG';
    updateHeaderMeta(isOil ? "Yangi zavod" : "Yangi birja", isOil ? "Yog' ta'minotchisi qo'shish ($ USD)" : "Ta'minotchi qo'shish", 'QO\'SHISH');
    setBackAction(() => showSuppliers(currentSupplyCategory), 'addSupplier');
    fabBtn.style.display = 'none';

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: ${isOil ? 'rgba(245, 158, 11, 0.18)' : 'rgba(59, 130, 246, 0.15)'}; color: ${isOil ? '#FBBF24' : '#60A5FA'};">
                    ${isOil ? '🛢️' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 7v14M21 7v14M6 11h12M6 15h12M9 7V3h6v4"/></svg>'}
                </div>
                <div>
                    <div class="form-card__title">${isOil ? 'Yangi yog\' zavodi / ta\'minotchi' : 'Yangi birja / ta\'minotchi'}</div>
                    <div class="form-card__desc">${isOil ? 'Yog\' olinadigan firma yoki zavod ma\'lumotlari (Valyuta: $ USD)' : 'Shakar olinadigan firma yoki shaxs ma\'lumotlari'}</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="supplierNameInput">
                    <span class="label-icon">${Icons.storeFront}</span>
                    <span>Nomi yoki Firma nomi *</span>
                </label>
                <input type="text" class="form-input" id="supplierNameInput" placeholder="${isOil ? 'Masalan: Sunny Gold Zavod, Rossiya Maslo, Bekzod aka...' : 'Masalan: Xorazm Shakar Birja, Bekzod aka...'}" autofocus>
            </div>

            <div class="form-group">
                <label class="form-label" for="supplierPhoneInput">
                    <span class="label-icon">${Icons.phoneAction}</span>
                    <span>Telefon raqami (ixtiyoriy)</span>
                </label>
                <input type="tel" inputmode="tel" class="form-input" id="supplierPhoneInput" placeholder="+998 90 123 45 67">
            </div>

            <div class="form-group" style="margin-top: 24px;">
                <button class="btn btn--primary btn--full" id="submitSupplierBtn" onclick="submitSupplier()">
                    ${Icons.check} Saqlash
                </button>
            </div>
        </div>
    `;
}

async function showEditSupplierForm(supplierId) {
    const supplier = allSuppliersList.find(s => s.id === supplierId);
    if (!supplier) {
        showToast("Ta'minotchi topilmadi", "error");
        return;
    }

    const isOil = (supplier.category || currentSupplyCategory) === 'YOG';
    updateHeaderMeta("Tahrirlash", supplier.name, "TAHRIR");
    setBackAction(() => showSuppliers(currentSupplyCategory), 'editSupplier');
    fabBtn.style.display = 'none';

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">
                    ${Icons.edit}
                </div>
                <div>
                    <div class="form-card__title">${isOil ? 'Yog\' ta\'minotchisi ma\'lumotlarini tahrirlash' : 'Birja ma\'lumotlarini tahrirlash'}</div>
                    <div class="form-card__desc">Nom va telefon raqamini o'zgartirish</div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="supplierNameInput">
                    <span class="label-icon">${Icons.storeFront}</span>
                    <span>Nomi yoki Firma nomi *</span>
                </label>
                <input type="text" class="form-input" id="supplierNameInput" value="${escAttr(supplier.name)}" autofocus>
            </div>

            <div class="form-group">
                <label class="form-label" for="supplierPhoneInput">
                    <span class="label-icon">${Icons.phoneAction}</span>
                    <span>Telefon raqami</span>
                </label>
                <input type="tel" inputmode="tel" class="form-input" id="supplierPhoneInput" value="${escAttr(supplier.phone || '')}">
            </div>

            <div class="form-group" style="margin-top: 24px;">
                <button class="btn btn--primary btn--full" id="submitSupplierBtn" onclick="submitSupplier(${supplier.id}, '${escJs(supplier.category || currentSupplyCategory || 'SHAKAR')}')">
                    ${Icons.check} O'zgarishlarni saqlash
                </button>
            </div>
        </div>
    `;
}

async function submitSupplier(supplierId = null, category = null) {
    const name = document.getElementById('supplierNameInput')?.value.trim();
    const phone = document.getElementById('supplierPhoneInput')?.value.trim();

    if (!name) {
        showToast("Birja yoki ta'minotchi nomini kiriting", "error");
        return;
    }

    const btn = document.getElementById('submitSupplierBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Saqlanmoqda...';
    }

    try {
        const payload = {
            name: name,
            phone: phone || null,
            category: category || currentSupplyCategory || 'SHAKAR'
        };

        if (supplierId) {
            await apiPut('/suppliers/' + supplierId, payload);
            showToast("Ma'lumotlar muvaffaqiyatli yangilandi", "success");
        } else {
            await apiPost('/suppliers', payload);
            showToast("Yangi ta'minotchi muvaffaqiyatli qo'shildi", "success");
        }
        showSuppliers(currentSupplyCategory);
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} Saqlash`;
        }
        showToast("Xatolik: " + err.message, "error");
    }
}

async function deleteSupplier(supplierId, name, currentDebt, category = 'SHAKAR') {
    const isOil = category === 'YOG';
    if (Number(currentDebt) > 0) {
        const debtText = isOil ? formatDollar(currentDebt) : formatMoney(currentDebt);
        showToast(`Ushbu ta'minotchidan hali qarzimiz bor (${debtText})! Qarz to'liq yopilmaguncha o'chirib bo'lmaydi.`, "error");
        return;
    }

    showConfirmDialog({
        title: isOil ? "Ta'minotchini o'chirish" : "Birjani o'chirish",
        message: "Rostdan ham ushbu ta'minotchini o'chirmoqchimisiz?",
        itemName: name,
        confirmText: "O'chirish",
        isDanger: true,
        onConfirm: async () => {
            try {
                await apiDelete('/suppliers/' + supplierId);
                showToast("Ta'minotchi o'chirildi", "success");
                showSuppliers(currentSupplyCategory);
            } catch (err) {
                showToast("Xatolik: " + err.message, "error");
            }
        }
    });
}

// ==========================================
// TA'MINOTCHI TAFSILOTLARI VA DAFTAR
// ==========================================
async function showSupplierDetail(supplierId) {
    currentSupplierId = supplierId;
    updateHeaderMeta('Yuklanmoqda...', '', 'TA\'MINOT');
    setBackAction(() => showSuppliers(currentSupplyCategory), 'supplierDetail');
    fabBtn.style.display = 'none';

    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const ledger = await apiGet('/suppliers/' + supplierId + '/ledger');
        currentSupplierLedgerData = ledger;

        const isOil = ledger.category === 'YOG';
        updateHeaderMeta(ledger.supplierName, isOil ? "Yog' ta'minotchisi qarz daftari ($ USD)" : "Ta'minotchi qarz daftari va amallar", 'TA\'MINOT');

        const debt = Number(ledger.currentDebt) || 0;
        const isDebt = debt > 0;
        const debtLabel = isDebt ? (isOil ? "Bizning qarzimiz ($ AQSH Dollari)" : "Bizning qarzimiz (Berishimiz kerak)") : (isOil ? "Hisob toza ($0.00 qarz)" : "Hisob toza (Qarzdorlik yo'q)");
        const debtValueText = isOil ? formatDollar(debt) : formatMoney(debt);
        const debtStyleColor = isDebt ? 'var(--color-debt)' : 'var(--color-paid)';
        const lineGradient = isDebt ? 'linear-gradient(90deg, #F43F5E, #FB7185)' : 'linear-gradient(90deg, #10B981, #34D399)';
        const debtGlowClass = isDebt ? 'stat-card--glow-rose' : 'stat-card--glow-emerald';

        const rawPhone = (ledger.supplierPhone || '').replace(/[^\d+]/g, '');

        contentEl.innerHTML = `
            <!-- Top KPI Card: Bizning qarzimiz -->
            <div class="stat-card ${debtGlowClass}" style="margin-bottom:16px; text-align:center; padding: 22px 18px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: ${lineGradient};"></div>
                <div class="stat-card__label" style="text-transform:uppercase; letter-spacing:0.8px; font-size:11.5px; font-weight:700; color:var(--color-ink-dim);">${debtLabel}</div>
                <div class="stat-card__value" style="color: ${debtStyleColor}; font-size: 28px; font-weight:800; margin-top:6px; font-variant-numeric: tabular-nums;">
                    ${debtValueText}
                </div>
                ${rawPhone ? `
                    <div style="margin-top:12px; display:flex; justify-content:center;">
                        <a href="tel:${escAttr(rawPhone)}" class="action-chip" style="display:inline-flex; align-items:center; gap:7px; padding: 7px 16px; width:auto; border-radius: 12px; font-size: 13px; font-weight: 600; background:rgba(59,130,246,0.18); border:1px solid rgba(59,130,246,0.4); color:#60A5FA; text-decoration:none;">
                            ${Icons.phoneAction}
                            <span>${escHtml(ledger.supplierPhone)}</span>
                        </a>
                    </div>
                ` : ''}
            </div>

            <!-- Action Buttons: Mahsulot olish & To'lov qilish -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom: 20px;">
                <button class="btn btn--primary" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius: 14px; padding: 14px; box-shadow: 0 4px 16px rgba(37,99,235,0.3);" onclick="showAddSupplyPurchaseForm(${supplierId}, '${escJs(ledger.supplierName)}', '${escJs(ledger.category)}')">
                    ${Icons.truck}
                    <span>Mahsulot olish</span>
                </button>
                <button class="btn" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.18) 100%); color: #34D399; border: 1.5px solid rgba(16,185,129,0.45); display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius: 14px; padding: 14px; font-weight: 700; box-shadow: 0 4px 16px rgba(16,185,129,0.2);" onclick="showAddSupplyPaymentForm(${supplierId}, '${escJs(ledger.supplierName)}', ${debt}, '${escJs(ledger.category)}')">
                    ${Icons.wallet}
                    <span>To'lov qilish</span>
                </button>
            </div>

            <!-- Section Title -->
            <div class="section-title" style="margin-bottom:10px;">
                Amallar tarixi
            </div>

            <div id="supplierLedgerSectionContainer"></div>
        `;

        renderSupplierLedgerSection();

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function setSupplierLedgerDateFilter(mode) {
    if (mode === 'all') {
        currentSupplierLedgerFilterMode = 'all';
    } else if (mode === 'today') {
        currentSupplierLedgerFilterMode = 'day';
        currentSupplierLedgerSelectedDate = getLocalDateString();
    } else if (mode === 'yesterday') {
        currentSupplierLedgerFilterMode = 'day';
        const d = new Date();
        d.setDate(d.getDate() - 1);
        currentSupplierLedgerSelectedDate = getLocalDateString(d);
    }
    renderSupplierLedgerSection();
}

function onSupplierLedgerDatePicked(pickedDate) {
    if (pickedDate) {
        currentSupplierLedgerFilterMode = 'day';
        currentSupplierLedgerSelectedDate = pickedDate;
        renderSupplierLedgerSection();
    }
}

function renderSupplierLedgerSection() {
    const container = document.getElementById('supplierLedgerSectionContainer');
    if (!container || !currentSupplierLedgerData) return;

    const isOil = currentSupplierLedgerData?.category === 'YOG';
    const todayStr = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const isDayMode = currentSupplierLedgerFilterMode === 'day';
    const isToday = isDayMode && currentSupplierLedgerSelectedDate === todayStr;
    const isYesterday = isDayMode && currentSupplierLedgerSelectedDate === yesterdayStr;
    const isAll = currentSupplierLedgerFilterMode === 'all';

    const allEntries = currentSupplierLedgerData.entries ? currentSupplierLedgerData.entries.slice().reverse() : [];

    let filteredEntries = [];
    if (isDayMode) {
        filteredEntries = allEntries.filter(e => getEntryDateString(e.date) === currentSupplierLedgerSelectedDate);
    } else {
        filteredEntries = allEntries;
    }

    let totalPurchases = 0;
    let totalPayments = 0;
    filteredEntries.forEach(e => {
        if (!e.isCancelled) {
            const amt = Number(e.amount) || 0;
            if (e.type === 'KIRIM') {
                totalPurchases += amt;
            } else {
                totalPayments += amt;
            }
        }
    });

    let entriesListHtml = '';
    if (filteredEntries.length === 0) {
        entriesListHtml = `
            <div class="empty-state" style="padding:26px 16px; margin: 10px 0; background:rgba(255,255,255,0.02); border:1px dashed var(--color-line); border-radius:16px;">
                <div style="font-size:26px; margin-bottom:8px;">📦</div>
                <div style="font-weight:700; color:#FFF; font-size:15px; margin-bottom:4px;">Ushbu davrda amallar yo'q</div>
                <div style="font-size:12.5px; color:var(--color-ink-dim); margin-bottom:14px;">Kirim yoki to'lov amallari amalga oshirilmagan.</div>
                ${isDayMode ? `<button class="chip-btn" onclick="setSupplierLedgerDateFilter('all')">Barcha amallarni ko'rish</button>` : ''}
            </div>
        `;
    } else {
        entriesListHtml = filteredEntries.map(entry => renderSupplierLedgerEntryCard(entry, currentSupplierId)).join('');
    }

    container.innerHTML = `
        <!-- Filter chips bar -->
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; overflow-x:auto; padding-bottom:4px;">
            <button class="chip-btn ${isAll ? 'active' : ''}" onclick="setSupplierLedgerDateFilter('all')">
                Barchasi (${allEntries.length})
            </button>
            <button class="chip-btn ${isToday ? 'active' : ''}" onclick="setSupplierLedgerDateFilter('today')">
                Bugun
            </button>
            <button class="chip-btn ${isYesterday ? 'active' : ''}" onclick="setSupplierLedgerDateFilter('yesterday')">
                Kecha
            </button>
            <div style="position:relative; display:inline-flex; align-items:center;">
                <input type="date" 
                       value="${currentSupplierLedgerSelectedDate}" 
                       max="${todayStr}"
                       onchange="onSupplierLedgerDatePicked(this.value)"
                       style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:#F1F5F9; border-radius:999px; padding:6px 12px; font-size:12px; font-weight:600; outline:none; font-family:var(--font-body); cursor:pointer;">
            </div>
        </div>

        <!-- Davr sarhisobi -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:14px;">
            <div style="background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.22); border-radius:12px; padding:10px 12px;">
                <div style="font-size:11px; font-weight:700; color:#FDA4AF; text-transform:uppercase;">Kirim (Tovar)</div>
                <div style="font-size:15px; font-weight:800; color:#FB7185; margin-top:3px; font-variant-numeric:tabular-nums;">+${isOil ? formatDollar(totalPurchases) : formatMoney(totalPurchases)}</div>
            </div>
            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.22); border-radius:12px; padding:10px 12px;">
                <div style="font-size:11px; font-weight:700; color:#6EE7B7; text-transform:uppercase;">To'lov (Chiqim)</div>
                <div style="font-size:15px; font-weight:800; color:#34D399; margin-top:3px; font-variant-numeric:tabular-nums;">−${isOil ? formatDollar(totalPayments) : formatMoney(totalPayments)}</div>
            </div>
        </div>

        <!-- Amallar ro'yxati -->
        <div class="ledger-list">
            ${entriesListHtml}
        </div>
    `;
}

function renderSupplierLedgerEntryCard(entry, supplierId) {
    const isOil = currentSupplierLedgerData?.category === 'YOG';
    const isCancelled = Boolean(entry.isCancelled);
    const isPurchase = entry.type === 'KIRIM';
    const rowOpacity = isCancelled ? 'opacity: 0.65; background: rgba(239,68,68,0.04);' : '';
    const titleStyle = isCancelled ? 'text-decoration: line-through; color: var(--color-ink-dim);' : '';
    const amountClass = isCancelled 
        ? 'amount--muted' 
        : (isPurchase ? 'amount--debt' : 'amount--paid');
    const amountText = (isPurchase ? '+' : '−') + (isOil ? formatDollar(entry.amount) : formatMoney(entry.amount));

    let cancelBadge = '';
    if (isCancelled) {
        cancelBadge = `
            <div style="font-size:11.5px; color:#F87171; display:flex; flex-wrap:wrap; align-items:center; gap:6px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); padding:6px 10px; border-radius:8px;">
                <span style="background:rgba(239,68,68,0.25); border:1px solid rgba(239,68,68,0.4); padding:1px 5px; border-radius:4px; font-weight:700; font-size:10px;">BEKOR QILINGAN</span>
                <span>${escHtml(entry.cancelReason || '')}</span>
                <span style="opacity:0.8;">(${escHtml(entry.cancelledBy || '')})</span>
            </div>
        `;
    }

    let actionBtn = '';
    if (!isCancelled && entry.id) {
        actionBtn = `
            <button class="btn" onclick="promptCancelSupplierEntry('${entry.type}', ${entry.id}, ${supplierId}, '${escJs(entry.note || entry.productName || '')}', ${entry.amount}, '${escJs(currentSupplierLedgerData?.category || '')}')" 
                    style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); color:#F87171; padding:4px 8px; border-radius:8px; font-size:11.5px; font-weight:600; display:inline-flex; align-items:center; gap:5px; cursor:pointer;" 
                    title="Operatsiyani bekor qilish (Storno)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                <span>Bekor qilish</span>
            </button>
        `;
    }

    const typeTitle = isPurchase 
        ? `Kirim: ${escHtml(entry.productName || 'Mahsulot')}` 
        : (isOil ? `To'lov (Naqd $)` : `To'lov (${escHtml(entry.paymentMethod || 'NAQD')})`);
    const typeIcon = isPurchase ? Icons.box : Icons.wallet;
    const iconColor = isPurchase ? '#F43F5E' : '#34D399';
    const iconBg = isPurchase ? 'rgba(244,63,94,0.14)' : 'rgba(16,185,129,0.14)';

    // Kirim tafsilotlari
    let detailsHtml = '';
    if (isPurchase) {
        if (isOil || entry.boxesCount || entry.totalLiters) {
            const boxes = entry.boxesCount || Math.round(Number(entry.quantity) || 0);
            const items = entry.itemsPerBox;
            const liter = entry.litersPerItem ? Number(entry.litersPerItem) : null;
            const boxLit = (items && liter) ? (items * liter) : null;
            const totalLit = entry.totalLiters ? Number(entry.totalLiters) : (boxLit ? boxes * boxLit : null);
            const pLiter = entry.pricePerLiter ? Number(entry.pricePerLiter) : Number(entry.unitPrice || 0);

            detailsHtml = `
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:8px 11px; font-size:12.5px; font-weight:500; color:#F1F5F9; line-height:1.55; ${titleStyle}">
                    <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                        <span style="color:var(--color-ink-dim);">📦 Miqdori:</span>
                        <strong style="color:#FFF;">${boxes} karopka</strong>
                    </div>
                    ${boxLit ? `
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:12px; color:#94A3B8;">
                            <span>1 karopkada:</span>
                            <span>${items} dona × ${liter}L = <strong style="color:#E2E8F0;">${Number.isInteger(boxLit) ? boxLit : boxLit.toFixed(1)} litr</strong></span>
                        </div>
                    ` : ''}
                    ${totalLit ? `
                        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                            <span style="color:var(--color-ink-dim);">🛢️ Jami hajm:</span>
                            <strong style="color:#38BDF8;">${Number.isInteger(totalLit) ? totalLit.toLocaleString('uz-UZ') : totalLit.toFixed(1)} litr</strong>
                        </div>
                    ` : ''}
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--color-ink-dim);">💵 1 litr narxi:</span>
                        <span style="color:#34D399; font-weight:700;">$${pLiter.toFixed(2)}</span>
                    </div>
                    ${entry.note ? `
                        <div style="margin-top:4px; padding-top:4px; border-top:1px dashed rgba(255,255,255,0.08); font-size:12px; color:var(--color-ink-dim);">
                            Izoh: ${escHtml(entry.note)}
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            let unitLabel = 'qop';
            if (entry.unit === 'TONNA') unitLabel = 'tonna';
            else if (entry.unit === 'KG') unitLabel = 'kg';

            const qtyFormatted = (entry.unit === 'TONNA' || entry.unit === 'KG') 
                ? (Number.isInteger(Number(entry.quantity)) ? Number(entry.quantity) : Number(entry.quantity).toFixed(2)) 
                : Math.round(Number(entry.quantity));

            detailsHtml = `
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:8px 11px; font-size:12.5px; font-weight:500; color:#F1F5F9; line-height:1.5; ${titleStyle}">
                    <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                        <span style="color:var(--color-ink-dim);">Hajmi:</span>
                        <strong style="color:#FFF;">${qtyFormatted} ${unitLabel}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--color-ink-dim);">1 ${unitLabel} narxi:</span>
                        <span style="color:#60A5FA; font-weight:700;">${formatMoney(entry.unitPrice)}</span>
                    </div>
                    ${entry.note ? `
                        <div style="margin-top:4px; padding-top:4px; border-top:1px dashed rgba(255,255,255,0.08); font-size:12px; color:var(--color-ink-dim);">
                            Izoh: ${escHtml(entry.note)}
                        </div>
                    ` : ''}
                </div>
            `;
        }
    } else if (entry.note) {
        detailsHtml = `
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:8px 11px; font-size:12px; color:var(--color-ink-dim); ${titleStyle}">
                Izoh: ${escHtml(entry.note)}
            </div>
        `;
    }

    return `
    <div class="ledger-row" style="cursor:default; margin-bottom:10px; display:flex; flex-direction:column; align-items:stretch; gap:10px; padding:14px 15px; ${rowOpacity}">
        <!-- 1-qator: Turi va Summa -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:${iconBg}; color:${iconColor}; flex-shrink:0;">
                    ${typeIcon}
                </div>
                <span style="font-weight:700; font-size:14.5px; color:#FFFFFF; letter-spacing:-0.2px;">
                    ${typeTitle}
                </span>
            </div>
            <div class="ledger-row__amount ${amountClass}" style="font-size:14px; font-weight:800; padding:4px 12px; border-radius:999px; ${isCancelled ? 'text-decoration: line-through; opacity:0.6;' : ''}">
                ${amountText}
            </div>
        </div>

        <!-- 2-qator: Tafsilotlar -->
        ${detailsHtml}

        <!-- 3-qator: Sana & Qarz balansi -->
        <div style="display:flex; align-items:center; justify-content:space-between; font-size:12px; color:var(--color-ink-dim); flex-wrap:wrap; gap:6px;">
            <span style="display:inline-flex; align-items:center; gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${new Date(entry.date).toLocaleDateString('uz-UZ')}, ${new Date(entry.date).toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'})}
            </span>
            <span style="font-weight:600; color:#94A3B8;">
                Bizning qarz: <strong style="color:${Number(entry.balanceAfter) > 0 ? '#FB7185' : '#34D399'};">${isOil ? formatDollar(entry.balanceAfter) : formatMoney(entry.balanceAfter)}</strong>
            </span>
        </div>

        ${cancelBadge}

        <!-- 4-qator: Mas'ul xodim & Bekor qilish tugmasi -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.08); margin-top:2px;">
            <div>
                ${formatAdminBadge(entry.createdBy)}
            </div>
            <div>
                ${actionBtn}
            </div>
        </div>
    </div>
    `;
}

// ==========================================
// MAHSULOT SOTIB OLISH (KIRIM) FORMASI
// ==========================================
function showAddSupplyPurchaseForm(supplierId, supplierName, category = null) {
    const isOil = category === 'YOG' || currentSupplierLedgerData?.category === 'YOG' || currentSupplyCategory === 'YOG';
    if (isOil) {
        showAddOilPurchaseForm(supplierId, supplierName);
        return;
    }
    currentPurchaseUnit = 'QOP';
    updateHeaderMeta("Mahsulot olish", supplierName, "KIRIM");
    setBackAction(() => showSupplierDetail(supplierId), 'addSupplyPurchase');
    fabBtn.style.display = 'none';

    const today = getLocalDateString();

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(37, 99, 235, 0.15); color: #60A5FA;">
                    ${Icons.truck}
                </div>
                <div>
                    <div class="form-card__title">Mahsulot sotib olish (Kirim)</div>
                    <div class="form-card__desc">${escHtml(supplierName)} dan yuk qabul qilish</div>
                </div>
            </div>

            <!-- 1. Mahsulot nomi (Foydalanuvchi o'zi erkin yozadi, ortiqcha takliflarsiz) -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="purchaseProductNameInput">
                    <span class="label-icon">${Icons.box}</span>
                    <span>Mahsulot nomi *</span>
                </label>
                <input type="text" 
                       class="form-input" 
                       id="purchaseProductNameInput" 
                       placeholder="Mahsulot nomini kiriting (masalan: Shakar, Shakar Xorazm...)" 
                       autofocus>
            </div>

            <!-- 2. O'lchov birligi (Qop, Tonna yoki Kg) -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" style="margin-bottom:8px;">
                    <span class="label-icon">${Icons.scale}</span>
                    <span>O'lchov birligi *</span>
                </label>
                <div class="segmented-group">
                    <button type="button" class="segmented-btn active" id="unitQopBtn" onclick="setPurchaseUnit('QOP')">
                        📦 Qop
                    </button>
                    <button type="button" class="segmented-btn" id="unitTonnaBtn" onclick="setPurchaseUnit('TONNA')">
                        ⚖️ Tonna
                    </button>
                    <button type="button" class="segmented-btn" id="unitKgBtn" onclick="setPurchaseUnit('KG')">
                        ⚖️ Kg
                    </button>
                </div>
            </div>

            <!-- 3. Miqdori (Stepper + Input) -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="purchaseQuantityInput">
                    <span class="label-icon">${Icons.cart}</span>
                    <span id="purchaseQuantityLabel">Miqdori (Qop soni) *</span>
                </label>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button type="button" class="btn" onclick="adjustPurchaseQuantity(-1)" style="width:46px; height:46px; padding:0; font-size:20px; font-weight:800; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); color:#FFF; flex-shrink:0;">−</button>
                    <input type="number" 
                           class="form-input" 
                           id="purchaseQuantityInput" 
                           step="1" 
                           min="0.001" 
                           placeholder="Masalan: 100" 
                           style="text-align:center; font-size:18px; font-weight:700;"
                           oninput="updateSupplyPurchaseTotal()">
                    <button type="button" class="btn" onclick="adjustPurchaseQuantity(1)" style="width:46px; height:46px; padding:0; font-size:20px; font-weight:800; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); color:#FFF; flex-shrink:0;">+</button>
                </div>
            </div>

            <!-- 4. Birlik narxi -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="purchaseUnitPriceInput" id="purchaseUnitPriceLabel">
                    <span class="label-icon">${Icons.money}</span>
                    <span>1 ta qop narxi (so'm) *</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="text" 
                               inputmode="numeric" 
                               class="form-input money-input" 
                               id="purchaseUnitPriceInput" 
                               placeholder="Masalan: 450 000" 
                               oninput="onPurchasePriceChange(this)">
                        <span class="money-suffix">so'm</span>
                    </div>
                </div>

                <div class="quick-chips-row" id="purchasePriceChipsContainer" style="margin-top:8px;"></div>
            </div>

            <!-- 5. Kirim sanasi -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="purchaseDateInput">
                    <span class="label-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </span>
                    <span>Kirim sanasi</span>
                </label>
                <input type="date" 
                       class="form-input" 
                       id="purchaseDateInput" 
                       value="${today}" 
                       max="${today}">
            </div>

            <!-- 6. Izoh (ixtiyoriy) -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="purchaseNoteInput">
                    <span class="label-icon">${Icons.info}</span>
                    <span>Izoh (ixtiyoriy)</span>
                </label>
                <input type="text" class="form-input" id="purchaseNoteInput" placeholder="Masalan: Fura raqami, yuk xati yoki vagon...">
            </div>

            <!-- 7. Avtomatik hisoblangan umumiy summa (Professional Hisob-kitob kartasi) -->
            <div class="stat-card stat-card--glow-blue" id="purchaseTotalCard" style="margin-bottom:20px; padding:18px; text-align:center; position:relative; overflow:hidden;">
                <div style="font-size:11.5px; font-weight:700; color:#93C5FD; text-transform:uppercase; letter-spacing:0.8px;">
                    Jami hisoblangan summa
                </div>
                <div id="purchaseCalculationFormula" style="font-size:13px; color:#94A3B8; margin-top:5px; font-variant-numeric:tabular-nums;">
                    Miqdor va narx kiritilgach avtomatik hisoblanadi
                </div>
                <div id="purchaseTotalValue" style="font-size:28px; font-weight:800; color:#38BDF8; margin-top:6px; font-variant-numeric:tabular-nums;">
                    0 so'm
                </div>
                <div id="purchaseTotalWords" style="font-size:12.5px; color:#A7F3D0; font-weight:600; margin-top:3px; min-height:18px;">
                </div>
                <div style="margin-top:10px; font-size:11.5px; color:#94A3B8; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:7px 12px; display:inline-flex; align-items:center; gap:6px;">
                    <span>💳</span>
                    <span>Birjadan bizning qarzimizga qo'shiladi</span>
                </div>
            </div>

            <!-- 8. Saqlash tugmasi -->
            <div class="form-group" style="margin-top:10px;">
                <button class="btn btn--primary btn--full" id="submitSupplyPurchaseBtn" onclick="submitSupplyPurchase(${supplierId})">
                    ${Icons.check} Kirimni tasdiqlash va saqlash
                </button>
            </div>
        </div>
    `;

    renderPurchasePriceChips();
    updateSupplyPurchaseTotal();
}

function renderPurchasePriceChips() {
    const container = document.getElementById('purchasePriceChipsContainer');
    if (!container) return;

    if (currentPurchaseUnit === 'KG') {
        container.innerHTML = `
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 1000); updateSupplyPurchaseTotal();">+1 000</button>
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 5000); updateSupplyPurchaseTotal();">+5 000</button>
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 10000); updateSupplyPurchaseTotal();">+10 000</button>
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 20000); updateSupplyPurchaseTotal();">+20 000</button>
            <button type="button" class="preset-chip preset-chip--clear" onclick="clearMoneyInput('purchaseUnitPriceInput'); updateSupplyPurchaseTotal();">Tozalash</button>
        `;
    } else if (currentPurchaseUnit === 'TONNA') {
        container.innerHTML = `
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 100000); updateSupplyPurchaseTotal();">+100 ming</button>
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 500000); updateSupplyPurchaseTotal();">+500 ming</button>
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 1000000); updateSupplyPurchaseTotal();">+1 mln</button>
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 5000000); updateSupplyPurchaseTotal();">+5 mln</button>
            <button type="button" class="preset-chip preset-chip--clear" onclick="clearMoneyInput('purchaseUnitPriceInput'); updateSupplyPurchaseTotal();">Tozalash</button>
        `;
    } else {
        container.innerHTML = `
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 10000); updateSupplyPurchaseTotal();">+10 ming</button>
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 50000); updateSupplyPurchaseTotal();">+50 ming</button>
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 100000); updateSupplyPurchaseTotal();">+100 ming</button>
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 500000); updateSupplyPurchaseTotal();">+500 ming</button>
            <button type="button" class="preset-chip" onclick="addMoneyToInput('purchaseUnitPriceInput', 1000000); updateSupplyPurchaseTotal();">+1 mln</button>
            <button type="button" class="preset-chip preset-chip--clear" onclick="clearMoneyInput('purchaseUnitPriceInput'); updateSupplyPurchaseTotal();">Tozalash</button>
        `;
    }
}

function setPurchaseUnit(unit) {
    currentPurchaseUnit = unit;
    const qopBtn = document.getElementById('unitQopBtn');
    const tonnaBtn = document.getElementById('unitTonnaBtn');
    const kgBtn = document.getElementById('unitKgBtn');
    if (qopBtn) qopBtn.classList.toggle('active', unit === 'QOP');
    if (tonnaBtn) tonnaBtn.classList.toggle('active', unit === 'TONNA');
    if (kgBtn) kgBtn.classList.toggle('active', unit === 'KG');

    const priceLabel = document.getElementById('purchaseUnitPriceLabel');
    if (priceLabel) {
        let labelText = '1 ta qop narxi (so\'m) *';
        if (unit === 'TONNA') labelText = '1 tonna narxi (so\'m) *';
        else if (unit === 'KG') labelText = '1 kg narxi (so\'m) *';
        priceLabel.innerHTML = `<span class="label-icon">${Icons.money}</span><span>${labelText}</span>`;
    }

    const priceInput = document.getElementById('purchaseUnitPriceInput');
    if (priceInput) {
        if (unit === 'TONNA') priceInput.placeholder = 'Masalan: 8 500 000';
        else if (unit === 'KG') priceInput.placeholder = 'Masalan: 8 500';
        else priceInput.placeholder = 'Masalan: 450 000';
    }

    const qtyLabel = document.getElementById('purchaseQuantityLabel');
    if (qtyLabel) {
        if (unit === 'TONNA') qtyLabel.textContent = 'Miqdori (Tonna) *';
        else if (unit === 'KG') qtyLabel.textContent = 'Miqdori (Kg) *';
        else qtyLabel.textContent = 'Miqdori (Qop soni) *';
    }

    const qtyInput = document.getElementById('purchaseQuantityInput');
    if (qtyInput) {
        qtyInput.step = (unit === 'TONNA' || unit === 'KG') ? '0.01' : '1';
        if (unit === 'TONNA') qtyInput.placeholder = 'Masalan: 10.5';
        else if (unit === 'KG') qtyInput.placeholder = 'Masalan: 50';
        else qtyInput.placeholder = 'Masalan: 100';
    }

    renderPurchasePriceChips();
    updateSupplyPurchaseTotal();
}

function adjustPurchaseQuantity(delta) {
    const qtyInput = document.getElementById('purchaseQuantityInput');
    if (!qtyInput) return;
    let cur = parseFloat(qtyInput.value) || 0;
    cur = Math.max(0, cur + delta);
    if (currentPurchaseUnit === 'TONNA' || currentPurchaseUnit === 'KG') {
        qtyInput.value = cur > 0 ? (Number.isInteger(cur) ? cur : parseFloat(cur.toFixed(2))) : '';
    } else {
        qtyInput.value = cur > 0 ? Math.round(cur) : '';
    }
    updateSupplyPurchaseTotal();
}

function onPurchasePriceChange(input) {
    const pos = input.selectionStart;
    const oldLen = input.value.length;
    const num = parseMoney(input.value);

    if (num > 0) {
        input.value = formatNumberWithSpaces(num);
        const newLen = input.value.length;
        const newPos = Math.max(0, pos + (newLen - oldLen));
        try { input.setSelectionRange(newPos, newPos); } catch (e) {}
    } else if (input.value.trim() === '') {
        input.value = '';
    }

    updateSupplyPurchaseTotal();
}

function updateSupplyPurchaseTotal() {
    const qtyInput = document.getElementById('purchaseQuantityInput');
    const priceInput = document.getElementById('purchaseUnitPriceInput');
    const qty = parseFloat(qtyInput?.value) || 0;
    const price = parseMoney(priceInput?.value) || 0;
    const total = qty * price;

    const totalEl = document.getElementById('purchaseTotalValue');
    const wordsEl = document.getElementById('purchaseTotalWords');
    const formulaEl = document.getElementById('purchaseCalculationFormula');

    let unitLabel = 'qop';
    if (currentPurchaseUnit === 'TONNA') unitLabel = 'tonna';
    else if (currentPurchaseUnit === 'KG') unitLabel = 'kg';

    const qtyText = (currentPurchaseUnit === 'TONNA' || currentPurchaseUnit === 'KG') 
        ? (Number.isInteger(qty) ? qty : qty.toFixed(2)) 
        : Math.round(qty);

    if (formulaEl) {
        if (qty > 0 && price > 0) {
            formulaEl.innerHTML = `<span style="color:#FFF; font-weight:700;">${qtyText} ${unitLabel}</span> × <span style="color:#60A5FA; font-weight:700;">${formatMoney(price)}</span>`;
        } else {
            formulaEl.innerHTML = `<span style="color:var(--color-ink-dim);">Miqdor va narx kiritilgach avtomatik hisoblanadi</span>`;
        }
    }

    if (totalEl) {
        totalEl.textContent = formatMoney(total);
        totalEl.style.color = total > 0 ? '#38BDF8' : 'var(--color-ink-dim)';
    }
    if (wordsEl) {
        wordsEl.textContent = total > 0 ? formatMoneyWords(total) : '';
    }
}

async function submitSupplyPurchase(supplierId) {
    const productName = document.getElementById('purchaseProductNameInput')?.value.trim();
    const quantity = parseFloat(document.getElementById('purchaseQuantityInput')?.value);
    const unitPrice = parseMoney(document.getElementById('purchaseUnitPriceInput')?.value);
    const purchaseDate = document.getElementById('purchaseDateInput')?.value || null;
    const note = document.getElementById('purchaseNoteInput')?.value.trim() || null;
    const today = getLocalDateString();

    if (!productName) {
        showToast("Mahsulot nomini kiriting", "error");
        return;
    }

    if (!quantity || quantity <= 0) {
        showToast("Miqdori (hajmini) to'g'ri kiriting", "error");
        return;
    }

    if (!unitPrice || unitPrice <= 0) {
        showToast("Birlik narxini to'g'ri kiriting", "error");
        return;
    }

    if (purchaseDate && purchaseDate > today) {
        showToast("Kirim sanasi kelajak sanada bo'lishi mumkin emas", "error");
        return;
    }

    const btn = document.getElementById('submitSupplyPurchaseBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Kirim saqlanmoqda...';
    }

    try {
        const payload = {
            productName: productName,
            unit: currentPurchaseUnit,
            quantity: quantity,
            unitPrice: unitPrice,
            purchaseDate: purchaseDate,
            note: note,
            category: currentSupplyCategory || 'SHAKAR'
        };

        await apiPost('/suppliers/' + supplierId + '/purchases', payload);
        showToast("Mahsulot kirimi muvaffaqiyatli saqlandi!", "success");
        if (purchaseDate) {
            currentSupplierLedgerSelectedDate = purchaseDate;
            currentSupplierLedgerFilterMode = 'day';
        }
        showSupplierDetail(supplierId);
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} Kirimni tasdiqlash va saqlash`;
        }
        showToast("Xatolik: " + err.message, "error");
    }
}

// ==========================================
// YOG' SOTIB OLISH (KIRIM) MAXSUS FORMASI (USD $)
// ==========================================
function showAddOilPurchaseForm(supplierId, supplierName) {
    updateHeaderMeta("Mahsulot olish", supplierName, "KIRIM $");
    setBackAction(() => showSupplierDetail(supplierId), 'addOilPurchase');
    fabBtn.style.display = 'none';

    const today = getLocalDateString();

    contentEl.innerHTML = `
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(245, 158, 11, 0.18); color: #FBBF24;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                    <div class="form-card__title">Yog' sotib olish (Kirim - USD $)</div>
                    <div class="form-card__desc">${escHtml(supplierName)} dan yuk qabul qilish</div>
                </div>
            </div>

            <!-- 1. Mahsulot nomi -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="oilProductNameInput">
                    <span class="label-icon">${Icons.box}</span>
                    <span>Mahsulot nomi *</span>
                </label>
                <input type="text" 
                       class="form-input" 
                       id="oilProductNameInput" 
                       placeholder="Masalan: Sunny gold, Sulton, Altay, Lasko..." 
                       autofocus>
            </div>

            <!-- 2. Yog' hajmi (Litr) -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="oilLiterPerItemInput">
                    <span class="label-icon">🛢️</span>
                    <span>Yog' hajmi (1 ta butilka litri) *</span>
                </label>
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="number" 
                           step="0.1" 
                           min="0.1" 
                           class="form-input" 
                           id="oilLiterPerItemInput" 
                           placeholder="Masalan: 5" 
                           style="font-size:17px; font-weight:700;"
                           oninput="updateOilPurchaseTotal()">
                    <span style="font-size:14px; font-weight:700; color:var(--color-ink-dim); padding-right:6px;">Litr</span>
                </div>
                <div class="quick-chips-row" style="margin-top:8px;">
                    <button type="button" class="preset-chip" onclick="setOilLiterPreset(1)">1 L</button>
                    <button type="button" class="preset-chip" onclick="setOilLiterPreset(1.5)">1.5 L</button>
                    <button type="button" class="preset-chip" onclick="setOilLiterPreset(3)">3 L</button>
                    <button type="button" class="preset-chip" onclick="setOilLiterPreset(5)">5 L</button>
                </div>
            </div>

            <!-- 3. Karopka ichidagi soni (dona) -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="oilItemsPerBoxInput">
                    <span class="label-icon">📦</span>
                    <span>1 karopka ichidagi soni (dona) *</span>
                </label>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button type="button" class="btn" onclick="adjustOilItemsPerBox(-1)" style="width:46px; height:46px; padding:0; font-size:20px; font-weight:800; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); color:#FFF; flex-shrink:0;">−</button>
                    <input type="number" 
                           class="form-input" 
                           id="oilItemsPerBoxInput" 
                           step="1" 
                           min="1" 
                           placeholder="Masalan: 3" 
                           style="text-align:center; font-size:18px; font-weight:700;"
                           oninput="updateOilPurchaseTotal()">
                    <button type="button" class="btn" onclick="adjustOilItemsPerBox(1)" style="width:46px; height:46px; padding:0; font-size:20px; font-weight:800; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); color:#FFF; flex-shrink:0;">+</button>
                </div>
                <div class="quick-chips-row" style="margin-top:8px;">
                    <button type="button" class="preset-chip" onclick="setOilItemsPreset(3)">3 dona</button>
                    <button type="button" class="preset-chip" onclick="setOilItemsPreset(4)">4 dona</button>
                    <button type="button" class="preset-chip" onclick="setOilItemsPreset(6)">6 dona</button>
                    <button type="button" class="preset-chip" onclick="setOilItemsPreset(12)">12 dona</button>
                    <button type="button" class="preset-chip" onclick="setOilItemsPreset(15)">15 dona</button>
                </div>
            </div>

            <!-- 4. Karopka soni -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="oilBoxesCountInput">
                    <span class="label-icon">${Icons.cart}</span>
                    <span>Karopka soni *</span>
                </label>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button type="button" class="btn" onclick="adjustOilBoxesCount(-5)" style="width:46px; height:46px; padding:0; font-size:20px; font-weight:800; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); color:#FFF; flex-shrink:0;">−</button>
                    <input type="number" 
                           class="form-input" 
                           id="oilBoxesCountInput" 
                           step="1" 
                           min="1" 
                           placeholder="Masalan: 100" 
                           style="text-align:center; font-size:18px; font-weight:700;"
                           oninput="updateOilPurchaseTotal()">
                    <button type="button" class="btn" onclick="adjustOilBoxesCount(5)" style="width:46px; height:46px; padding:0; font-size:20px; font-weight:800; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); color:#FFF; flex-shrink:0;">+</button>
                </div>
                <div class="quick-chips-row" style="margin-top:8px;">
                    <button type="button" class="preset-chip" onclick="addOilBoxesCount(10)">+10</button>
                    <button type="button" class="preset-chip" onclick="addOilBoxesCount(50)">+50</button>
                    <button type="button" class="preset-chip" onclick="addOilBoxesCount(100)">+100</button>
                    <button type="button" class="preset-chip" onclick="addOilBoxesCount(500)">+500</button>
                    <button type="button" class="preset-chip preset-chip--clear" onclick="clearOilBoxesCount()">Tozalash</button>
                </div>
            </div>

            <!-- 5. 1 litr narxi ($) -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="oilPricePerLiterInput">
                    <span class="label-icon">${Icons.money}</span>
                    <span>1 litr narxi ($ AQSH Dollari) *</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="number" 
                               step="0.01" 
                               min="0.001" 
                               class="form-input" 
                               id="oilPricePerLiterInput" 
                               placeholder="Masalan: 1.86" 
                               style="font-size:18px; font-weight:700;"
                               oninput="updateOilPurchaseTotal()">
                        <span class="money-suffix" style="font-weight:800; color:#38BDF8;">$</span>
                    </div>
                </div>
                <div class="quick-chips-row" style="margin-top:8px;">
                    <button type="button" class="preset-chip" onclick="setOilPricePreset(1.50)">$1.50</button>
                    <button type="button" class="preset-chip" onclick="setOilPricePreset(1.60)">$1.60</button>
                    <button type="button" class="preset-chip" onclick="setOilPricePreset(1.70)">$1.70</button>
                    <button type="button" class="preset-chip" onclick="setOilPricePreset(1.75)">$1.75</button>
                    <button type="button" class="preset-chip" onclick="setOilPricePreset(1.80)">$1.80</button>
                    <button type="button" class="preset-chip" onclick="setOilPricePreset(1.85)">$1.85</button>
                    <button type="button" class="preset-chip" onclick="setOilPricePreset(1.90)">$1.90</button>
                    <button type="button" class="preset-chip" onclick="setOilPricePreset(2.00)">$2.00</button>
                    <button type="button" class="preset-chip" onclick="addOilPrice(0.01)">+$0.01</button>
                    <button type="button" class="preset-chip" onclick="addOilPrice(0.05)">+$0.05</button>
                    <button type="button" class="preset-chip preset-chip--clear" onclick="clearOilPrice()">Tozalash</button>
                </div>
            </div>

            <!-- 6. Kirim sanasi -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="oilPurchaseDateInput">
                    <span class="label-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </span>
                    <span>Kirim sanasi</span>
                </label>
                <input type="date" 
                       class="form-input" 
                       id="oilPurchaseDateInput" 
                       value="${today}" 
                       max="${today}">
            </div>

            <!-- 7. Izoh (ixtiyoriy) -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="oilPurchaseNoteInput">
                    <span class="label-icon">${Icons.info}</span>
                    <span>Izoh (ixtiyoriy)</span>
                </label>
                <input type="text" class="form-input" id="oilPurchaseNoteInput" placeholder="Masalan: Fura raqami, yuk xati yoki vagon...">
            </div>

            <!-- 8. Professional Hisob-kitob kartasi (Jonli kalkulyator) -->
            <div class="stat-card stat-card--glow-blue" style="margin-bottom:20px; padding:18px; position:relative; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="font-size:11.5px; font-weight:700; color:#93C5FD; text-transform:uppercase; letter-spacing:0.8px;">
                        🧮 Jonli hisob-kitob (USD $)
                    </div>
                    <span style="font-size:11px; background:rgba(56,189,248,0.15); color:#38BDF8; border:1px solid rgba(56,189,248,0.3); padding:2px 8px; border-radius:999px; font-weight:700;">
                        Avtomatik
                    </span>
                </div>

                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:12px 14px; margin-bottom:14px; font-size:13px; line-height:1.7;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span style="color:var(--color-ink-dim);">📦 1 karopka hajmi:</span>
                        <strong id="oilCalcBoxLiters" style="color:#FFF;">0 litr</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span style="color:var(--color-ink-dim);">🛢️ Jami qabul qilingan hajm:</span>
                        <strong id="oilCalcTotalLiters" style="color:#38BDF8;">0 litr</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--color-ink-dim);">💵 1 karopka narxi:</span>
                        <strong id="oilCalcBoxPrice" style="color:#34D399;">$0.00</strong>
                    </div>
                </div>

                <div style="text-align:center; padding: 4px 0 10px 0;">
                    <div style="font-size:12px; color:var(--color-ink-dim); text-transform:uppercase; letter-spacing:0.5px;">Jami hisoblangan summa ($):</div>
                    <div id="oilCalcTotalAmount" style="font-size:30px; font-weight:800; color:#38BDF8; margin-top:4px; font-variant-numeric:tabular-nums;">
                        $0.00
                    </div>
                </div>

                <div style="text-align:center; margin-top:4px; font-size:11.5px; color:#94A3B8; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:7px 12px; display:flex; align-items:center; justify-content:center; gap:6px;">
                    <span>💳</span>
                    <span>Zavoddan bizning qarzimizga dollarda ($) qo'shiladi</span>
                </div>
            </div>

            <!-- 9. Saqlash tugmasi -->
            <div class="form-group" style="margin-top:10px;">
                <button class="btn btn--primary btn--full" id="submitOilSupplyPurchaseBtn" onclick="submitOilSupplyPurchase(${supplierId})">
                    ${Icons.check} Kirimni tasdiqlash va saqlash
                </button>
            </div>
        </div>
    `;

    updateOilPurchaseTotal();
}

function setOilLiterPreset(liters) {
    const el = document.getElementById('oilLiterPerItemInput');
    if (el) {
        el.value = liters;
        updateOilPurchaseTotal();
    }
}

function setOilItemsPreset(items) {
    const el = document.getElementById('oilItemsPerBoxInput');
    if (el) {
        el.value = items;
        updateOilPurchaseTotal();
    }
}

function adjustOilItemsPerBox(delta) {
    const el = document.getElementById('oilItemsPerBoxInput');
    if (!el) return;
    let cur = parseInt(el.value, 10) || 0;
    cur = Math.max(1, cur + delta);
    el.value = cur;
    updateOilPurchaseTotal();
}

function adjustOilBoxesCount(delta) {
    const el = document.getElementById('oilBoxesCountInput');
    if (!el) return;
    let cur = parseInt(el.value, 10) || 0;
    cur = Math.max(1, cur + delta);
    el.value = cur;
    updateOilPurchaseTotal();
}

function addOilBoxesCount(delta) {
    const el = document.getElementById('oilBoxesCountInput');
    if (!el) return;
    let cur = parseInt(el.value, 10) || 0;
    el.value = cur + delta;
    updateOilPurchaseTotal();
}

function clearOilBoxesCount() {
    const el = document.getElementById('oilBoxesCountInput');
    if (el) {
        el.value = '';
        updateOilPurchaseTotal();
    }
}

function setOilPricePreset(price) {
    const el = document.getElementById('oilPricePerLiterInput');
    if (el) {
        el.value = Number(price).toFixed(2);
        updateOilPurchaseTotal();
    }
}

function addOilPrice(delta) {
    const el = document.getElementById('oilPricePerLiterInput');
    if (!el) return;
    let cur = parseFloat(el.value) || 0;
    el.value = (cur + delta).toFixed(2);
    updateOilPurchaseTotal();
}

function clearOilPrice() {
    const el = document.getElementById('oilPricePerLiterInput');
    if (el) {
        el.value = '';
        updateOilPurchaseTotal();
    }
}

function updateOilPurchaseTotal() {
    const literInput = document.getElementById('oilLiterPerItemInput');
    const itemsInput = document.getElementById('oilItemsPerBoxInput');
    const boxesInput = document.getElementById('oilBoxesCountInput');
    const priceInput = document.getElementById('oilPricePerLiterInput');

    const literRaw = (literInput?.value || '').toString().replace(',', '.');
    const priceRaw = (priceInput?.value || '').toString().replace(',', '.');

    const litersPerItem = parseFloat(literRaw) || 0;
    const itemsPerBox = parseInt(itemsInput?.value, 10) || 0;
    const boxesCount = parseInt(boxesInput?.value, 10) || 0;
    const pricePerLiter = parseFloat(priceRaw) || 0;

    const boxLiters = (litersPerItem > 0 && itemsPerBox > 0) ? (litersPerItem * itemsPerBox) : 0;
    const totalLiters = (boxLiters > 0 && boxesCount > 0) ? (boxesCount * boxLiters) : 0;
    const boxPrice = (boxLiters > 0 && pricePerLiter > 0) ? (boxLiters * pricePerLiter) : 0;
    const totalAmount = (totalLiters > 0 && pricePerLiter > 0) ? (totalLiters * pricePerLiter) : 0;

    const boxLitersEl = document.getElementById('oilCalcBoxLiters');
    const totalLitersEl = document.getElementById('oilCalcTotalLiters');
    const boxPriceEl = document.getElementById('oilCalcBoxPrice');
    const totalAmountEl = document.getElementById('oilCalcTotalAmount');

    if (boxLitersEl) {
        boxLitersEl.textContent = boxLiters > 0 ? `${Number.isInteger(boxLiters) ? boxLiters : boxLiters.toFixed(1)} litr (${itemsPerBox} dona × ${litersPerItem}L)` : '0 litr';
    }
    if (totalLitersEl) {
        totalLitersEl.textContent = totalLiters > 0 ? `${Number.isInteger(totalLiters) ? totalLiters.toLocaleString('uz-UZ') : totalLiters.toFixed(1)} litr` : '0 litr';
    }
    if (boxPriceEl) {
        boxPriceEl.textContent = boxPrice > 0 ? formatDollar(boxPrice) : '$0.00';
    }
    if (totalAmountEl) {
        totalAmountEl.textContent = formatDollar(totalAmount);
        totalAmountEl.style.color = totalAmount > 0 ? '#38BDF8' : 'var(--color-ink-dim)';
    }
}

async function submitOilSupplyPurchase(supplierId) {
    const productName = document.getElementById('oilProductNameInput')?.value.trim();
    const literRaw = (document.getElementById('oilLiterPerItemInput')?.value || '').toString().replace(',', '.');
    const litersPerItem = parseFloat(literRaw);
    const itemsPerBox = parseInt(document.getElementById('oilItemsPerBoxInput')?.value, 10);
    const boxesCount = parseInt(document.getElementById('oilBoxesCountInput')?.value, 10);
    const priceRaw = (document.getElementById('oilPricePerLiterInput')?.value || '').toString().replace(',', '.');
    const pricePerLiter = parseFloat(priceRaw);
    const purchaseDate = document.getElementById('oilPurchaseDateInput')?.value || null;
    const note = document.getElementById('oilPurchaseNoteInput')?.value.trim() || null;
    const today = getLocalDateString();

    if (!productName) {
        showToast("Mahsulot nomini kiriting", "error");
        return;
    }
    if (!litersPerItem || litersPerItem <= 0) {
        showToast("Yog' hajmini (1 butilka litri) kiriting", "error");
        return;
    }
    if (!itemsPerBox || itemsPerBox <= 0) {
        showToast("Karopkadagi donalar sonini kiriting", "error");
        return;
    }
    if (!boxesCount || boxesCount <= 0) {
        showToast("Karopkalar sonini kiriting", "error");
        return;
    }
    if (!pricePerLiter || pricePerLiter <= 0) {
        showToast("1 litr narxini ($) to'g'ri kiriting", "error");
        return;
    }
    if (purchaseDate && purchaseDate > today) {
        showToast("Kirim sanasi kelajak sanada bo'lishi mumkin emas", "error");
        return;
    }

    const boxLiters = litersPerItem * itemsPerBox;
    const totalLiters = boxesCount * boxLiters;

    const btn = document.getElementById('submitOilSupplyPurchaseBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Kirim saqlanmoqda...';
    }

    try {
        const payload = {
            productName: productName,
            unit: 'KAROPKA',
            quantity: boxesCount,
            unitPrice: pricePerLiter,
            purchaseDate: purchaseDate,
            note: note,
            category: 'YOG',
            litersPerItem: litersPerItem,
            itemsPerBox: itemsPerBox,
            boxesCount: boxesCount,
            pricePerLiter: pricePerLiter,
            totalLiters: totalLiters
        };

        await apiPost('/suppliers/' + supplierId + '/purchases', payload);
        showToast("Yog' kirimi muvaffaqiyatli saqlandi!", "success");
        if (purchaseDate) {
            currentSupplierLedgerSelectedDate = purchaseDate;
            currentSupplierLedgerFilterMode = 'day';
        }
        showSupplierDetail(supplierId);
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} Kirimni tasdiqlash va saqlash`;
        }
        showToast("Xatolik: " + err.message, "error");
    }
}

// ==========================================
// TA'MINOTCHIGA TO'LOV QILISH FORMASI
// ==========================================
function showAddSupplyPaymentForm(supplierId, supplierName, currentDebt = 0, category = null) {
    const isOil = category === 'YOG' || currentSupplierLedgerData?.category === 'YOG' || currentSupplyCategory === 'YOG';
    currentSupplyPaymentMethod = 'NAQD';
    updateHeaderMeta("To'lov qilish", supplierName, isOil ? "TO'LOV $" : "TO'LOV");
    setBackAction(() => showSupplierDetail(supplierId), 'addSupplyPayment');
    fabBtn.style.display = 'none';

    const today = getLocalDateString();
    const debtVal = Number(currentDebt) || 0;

    contentEl.innerHTML = `
        <!-- Joriy qarzimiz balansi -->
        <div class="stat-card stat-card--glow-rose" style="margin-bottom:14px; text-align:center; padding: 18px 16px; position:relative; overflow:hidden;">
            <div style="position: absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, #F43F5E, #FB7185);"></div>
            <div class="stat-card__label" style="text-transform:uppercase; letter-spacing:0.8px; font-size:11px; font-weight:700; color:#FDA4AF;">
                ${isOil ? 'Bizning joriy qarzimiz (AQSH Dollari $)' : 'Bizning joriy qarzimiz'}
            </div>
            <div class="stat-card__value" style="color: #FB7185; font-size: 26px; font-weight:800; margin-top:4px; font-variant-numeric: tabular-nums;">
                ${isOil ? formatDollar(debtVal) : formatMoney(debtVal)}
            </div>
        </div>

        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(16, 185, 129, 0.15); color: #34D399;">
                    ${Icons.wallet}
                </div>
                <div>
                    <div class="form-card__title">${isOil ? 'Yog\' ta\'minotchisiga to\'lov qilish ($ USD)' : 'Birjaga to\'lov qilish'}</div>
                    <div class="form-card__desc">${isOil ? `${escHtml(supplierName)} ga dollar to'lovini qayd etish` : 'To\'lov sanasi, summasi va usulini tasdiqlang'}</div>
                </div>
            </div>

            <!-- 1. To'lov sanasi -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="supplyPaymentDateInput">
                    <span class="label-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </span>
                    <span>To'lov sanasi</span>
                </label>
                <input type="date" 
                       class="form-input" 
                       id="supplyPaymentDateInput" 
                       value="${today}" 
                       max="${today}">
            </div>

            <!-- 2. To'lov summasi -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="supplyPaymentAmountInput">
                    <span class="label-icon">${Icons.money}</span>
                    <span>To'lov summasi (${isOil ? '$ USD' : 'so\'m'}) *</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="${isOil ? 'number' : 'text'}" 
                               ${isOil ? 'step="0.01" min="0.01"' : 'inputmode="numeric"'}
                               class="form-input money-input" 
                               id="supplyPaymentAmountInput" 
                               placeholder="${isOil ? 'Masalan: 1000' : '0'}" 
                               autofocus
                               oninput="${isOil ? `onSupplyPaymentDollarChange(this, ${debtVal})` : `onSupplyPaymentAmountChange(this, ${debtVal})`}">
                        <span class="money-suffix" style="font-weight:700; ${isOil ? 'color:#38BDF8;' : ''}">${isOil ? '$' : 'so\'m'}</span>
                    </div>
                </div>

                <div class="quick-chips-row" style="margin-top:8px;">
                    ${isOil ? `
                        ${debtVal > 0 ? `
                            <button type="button" class="preset-chip preset-chip--accent" onclick="setSupplyPaymentDollarPreset(${debtVal}, ${debtVal})">To'liq qarz (${formatDollar(debtVal)})</button>
                        ` : ''}
                        <button type="button" class="preset-chip" onclick="addSupplyPaymentDollarAmount(100, ${debtVal})">+$100</button>
                        <button type="button" class="preset-chip" onclick="addSupplyPaymentDollarAmount(500, ${debtVal})">+$500</button>
                        <button type="button" class="preset-chip" onclick="addSupplyPaymentDollarAmount(1000, ${debtVal})">+$1 000</button>
                        <button type="button" class="preset-chip" onclick="addSupplyPaymentDollarAmount(2000, ${debtVal})">+$2 000</button>
                        <button type="button" class="preset-chip" onclick="addSupplyPaymentDollarAmount(5000, ${debtVal})">+$5 000</button>
                        <button type="button" class="preset-chip preset-chip--clear" onclick="clearSupplyPaymentDollarAmount(${debtVal})">Tozalash</button>
                    ` : `
                        ${debtVal > 0 ? `
                            <button type="button" class="preset-chip preset-chip--accent" onclick="setSupplyPaymentPreset(${debtVal}, ${debtVal})">To'liq qarz (${formatMoney(debtVal)})</button>
                        ` : ''}
                        <button type="button" class="preset-chip" onclick="addSupplyPaymentAmount(1000000, ${debtVal})">+1 mln</button>
                        <button type="button" class="preset-chip" onclick="addSupplyPaymentAmount(5000000, ${debtVal})">+5 mln</button>
                        <button type="button" class="preset-chip" onclick="addSupplyPaymentAmount(10000000, ${debtVal})">+10 mln</button>
                        <button type="button" class="preset-chip" onclick="addSupplyPaymentAmount(50000000, ${debtVal})">+50 mln</button>
                        <button type="button" class="preset-chip preset-chip--clear" onclick="clearSupplyPaymentAmount(${debtVal})">Tozalash</button>
                    `}
                </div>
            </div>

            <!-- 3. Qarzdan chegirish va qoldiq kartasi (Live preview) -->
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 14px; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:12.5px; color:var(--color-ink-dim);">To'lovdan keyingi qarzimiz:</span>
                    <strong id="supplyPaymentRemainingDebt" style="font-size:14px; color:${debtVal > 0 ? '#FB7185' : '#34D399'}; font-variant-numeric:tabular-nums;">
                        ${isOil ? formatDollar(debtVal) : formatMoney(debtVal)}
                    </strong>
                </div>
                <div id="supplyPaymentWarning" style="display:none; margin-top:8px; font-size:11.5px; color:#F87171; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:6px 10px;">
                    ⚠️ Kiritilgan summa joriy qarzdan ortiq bo'lmasligi lozim!
                </div>
            </div>

            <!-- 4. To'lov usuli -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" style="margin-bottom:8px;">
                    <span class="label-icon">${Icons.wallet}</span>
                    <span>To'lov usuli *</span>
                </label>
                ${isOil ? `
                    <div style="display:inline-flex; align-items:center; gap:8px; padding:11px 18px; border-radius:12px; background:rgba(16,185,129,0.15); border:1.5px solid rgba(16,185,129,0.4); color:#34D399; font-weight:700; font-size:14px;">
                        <span style="font-size:18px;">💵</span>
                        <span>Naqd ($ AQSH Dollari)</span>
                    </div>
                ` : `
                    <div class="segmented-group">
                        <button type="button" class="segmented-btn segmented-btn--emerald active" id="supplyPayNaqdBtn" onclick="setSupplyPaymentType('NAQD')">
                            💵 NAQD
                        </button>
                        <button type="button" class="segmented-btn segmented-btn--sky" id="supplyPayKartaBtn" onclick="setSupplyPaymentType('KARTA')">
                            💳 KARTA
                        </button>
                        <button type="button" class="segmented-btn" id="supplyPayBankBtn" onclick="setSupplyPaymentType('BANK')">
                            🏛️ BANK
                        </button>
                    </div>
                `}
            </div>

            <!-- 5. Izoh -->
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="supplyPaymentNoteInput">
                    <span class="label-icon">${Icons.info}</span>
                    <span>Izoh (ixtiyoriy)</span>
                </label>
                <input type="text" class="form-input" id="supplyPaymentNoteInput" placeholder="Masalan: Kvitansiya raqami yoki eslatma...">
            </div>

            <!-- 6. Saqlash tugmasi -->
            <div class="form-group" style="margin-top: 22px;">
                <button class="btn btn--full" id="submitSupplyPaymentBtn" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); border: 1px solid rgba(52, 211, 153, 0.4); color: #FFFFFF; font-size:15px; font-weight: 800; padding: 15px; border-radius: 14px; box-shadow: 0 4px 18px rgba(16, 185, 129, 0.35);" onclick="submitSupplyPayment(${supplierId}, ${debtVal}, '${isOil ? 'YOG' : 'SHAKAR'}')">
                    ${Icons.check} To'lovni tasdiqlash va saqlash
                </button>
            </div>
        </div>
    `;
}

function onSupplyPaymentDollarChange(input, currentDebt) {
    const raw = (input.value || '').toString().replace(',', '.');
    const val = parseFloat(raw) || 0;
    const remaining = Math.max(0, currentDebt - val);
    const remEl = document.getElementById('supplyPaymentRemainingDebt');
    const warnEl = document.getElementById('supplyPaymentWarning');
    if (remEl) {
        remEl.textContent = formatDollar(remaining);
        remEl.style.color = remaining > 0 ? '#FB7185' : '#34D399';
    }
    if (warnEl) {
        warnEl.style.display = (currentDebt > 0 && val > currentDebt) ? 'block' : 'none';
    }
}

function setSupplyPaymentDollarPreset(amount, currentDebt) {
    const input = document.getElementById('supplyPaymentAmountInput');
    if (input) {
        input.value = amount > 0 ? (Number.isInteger(amount) ? amount : amount.toFixed(2)) : '';
        onSupplyPaymentDollarChange(input, currentDebt);
    }
}

function addSupplyPaymentDollarAmount(delta, currentDebt) {
    const input = document.getElementById('supplyPaymentAmountInput');
    if (input) {
        const cur = parseFloat(input.value) || 0;
        input.value = (cur + delta).toFixed(2);
        onSupplyPaymentDollarChange(input, currentDebt);
    }
}

function clearSupplyPaymentDollarAmount(currentDebt) {
    const input = document.getElementById('supplyPaymentAmountInput');
    if (input) {
        input.value = '';
        onSupplyPaymentDollarChange(input, currentDebt);
    }
}

function setSupplyPaymentType(method) {
    currentSupplyPaymentMethod = method;
    document.getElementById('supplyPayNaqdBtn')?.classList.toggle('active', method === 'NAQD');
    document.getElementById('supplyPayKartaBtn')?.classList.toggle('active', method === 'KARTA');
    document.getElementById('supplyPayBankBtn')?.classList.toggle('active', method === 'BANK');
}

function onSupplyPaymentAmountChange(input, currentDebt) {
    const pos = input.selectionStart;
    const oldLen = input.value.length;
    const num = parseMoney(input.value);

    if (num > 0) {
        input.value = formatNumberWithSpaces(num);
        const newLen = input.value.length;
        const newPos = Math.max(0, pos + (newLen - oldLen));
        try { input.setSelectionRange(newPos, newPos); } catch (e) {}
    } else if (input.value.trim() === '') {
        input.value = '';
    }

    updateSupplyPaymentRemainingDebt(currentDebt);
}

function updateSupplyPaymentRemainingDebt(currentDebt) {
    const amount = parseMoney(document.getElementById('supplyPaymentAmountInput')?.value) || 0;
    const remaining = Math.max(0, currentDebt - amount);
    const remEl = document.getElementById('supplyPaymentRemainingDebt');
    const warnEl = document.getElementById('supplyPaymentWarning');

    if (remEl) {
        remEl.textContent = formatMoney(remaining);
        remEl.style.color = remaining > 0 ? '#FB7185' : '#34D399';
    }

    if (warnEl) {
        if (currentDebt > 0 && amount > currentDebt) {
            warnEl.style.display = 'block';
        } else {
            warnEl.style.display = 'none';
        }
    }
}

function setSupplyPaymentPreset(amount, currentDebt) {
    const input = document.getElementById('supplyPaymentAmountInput');
    if (input) {
        input.value = formatNumberWithSpaces(amount);
        updateSupplyPaymentRemainingDebt(currentDebt);
    }
}

function addSupplyPaymentAmount(delta, currentDebt) {
    const input = document.getElementById('supplyPaymentAmountInput');
    if (input) {
        const cur = parseMoney(input.value) || 0;
        input.value = formatNumberWithSpaces(cur + delta);
        updateSupplyPaymentRemainingDebt(currentDebt);
    }
}

function clearSupplyPaymentAmount(currentDebt) {
    const input = document.getElementById('supplyPaymentAmountInput');
    if (input) {
        input.value = '';
        updateSupplyPaymentRemainingDebt(currentDebt);
    }
}

async function submitSupplyPayment(supplierId, currentDebt = 0, category = 'SHAKAR') {
    const isOil = category === 'YOG' || currentSupplierLedgerData?.category === 'YOG' || currentSupplyCategory === 'YOG';
    const paymentDate = document.getElementById('supplyPaymentDateInput')?.value || null;
    const rawVal = (document.getElementById('supplyPaymentAmountInput')?.value || '').toString().replace(',', '.');
    const amount = isOil 
        ? parseFloat(rawVal) 
        : parseMoney(rawVal);
    const note = document.getElementById('supplyPaymentNoteInput')?.value.trim() || null;
    const today = getLocalDateString();

    if (!amount || amount <= 0) {
        showToast("To'g'ri to'lov summasini kiriting", "error");
        return;
    }

    if (currentDebt <= 0) {
        showToast("Ta'minotchida qarzdorlik mavjud emas!", "warning");
        return;
    }

    if (currentDebt > 0 && amount > currentDebt) {
        const amtText = isOil ? formatDollar(amount) : formatMoney(amount);
        const debtText = isOil ? formatDollar(currentDebt) : formatMoney(currentDebt);
        showToast(`To'lov summasi (${amtText}) joriy qarzdan (${debtText}) oshib ketmasligi lozim!`, "error");
        return;
    }

    if (paymentDate && paymentDate > today) {
        showToast("To'lov sanasi kelajak sanada bo'lishi mumkin emas", "error");
        return;
    }

    const btn = document.getElementById('submitSupplyPaymentBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'To\'lov saqlanmoqda...';
    }

    try {
        const payload = {
            amount: amount,
            paymentMethod: isOil ? 'NAQD' : (currentSupplyPaymentMethod || 'NAQD'),
            paymentDate: paymentDate,
            note: note
        };

        await apiPost('/suppliers/' + supplierId + '/payments', payload);
        showToast("To'lov muvaffaqiyatli saqlandi!", "success");
        if (paymentDate) {
            currentSupplierLedgerSelectedDate = paymentDate;
            currentSupplierLedgerFilterMode = 'day';
        }
        showSupplierDetail(supplierId);
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} To'lovni tasdiqlash va saqlash`;
        }
        showToast("Xatolik: " + err.message, "error");
    }
}

// ==========================================
// OPERATSIYANI BEKOR QILISH (STORNO)
// ==========================================
function promptCancelSupplierEntry(type, id, supplierId, description, amount, category = 'SHAKAR') {
    const isPurchase = type === 'KIRIM';
    const isOil = category === 'YOG' || currentSupplierLedgerData?.category === 'YOG' || currentSupplyCategory === 'YOG';
    const amountText = isOil ? formatDollar(amount) : formatMoney(amount);
    
    showBottomSheet(`
        <div style="text-align:left;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
                <div style="width:42px; height:42px; border-radius:12px; background:rgba(239,68,68,0.15); color:#F87171; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                </div>
                <div>
                    <div style="font-size:16px; font-weight:800; color:#FFF;">Operatsiyani bekor qilish (Storno)</div>
                    <div style="font-size:12.5px; color:var(--color-ink-dim);">Ushbu amal birja qarz balansini avtomatik to'g'irlaydi</div>
                </div>
            </div>

            <div style="background:var(--color-paper-dim); border:1px solid var(--color-line); border-radius:12px; padding:12px 14px; margin-bottom:14px; font-size:13px; line-height:1.6;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--color-ink-dim);">Amal turi:</span>
                    <strong style="color:#FFF;">${isPurchase ? 'Kirim #' + id : 'To\'lov #' + id}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--color-ink-dim);">Summa:</span>
                    <strong style="color:#60A5FA;">${amountText}</strong>
                </div>
                ${description ? `
                    <div style="color:var(--color-ink-dim); font-size:12px; margin-top:4px; padding-top:4px; border-top:1px dashed var(--color-line);">
                        ${escHtml(description)}
                    </div>
                ` : ''}
            </div>

            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" for="cancelSupplierReasonInput">
                    <span class="label-icon">${Icons.alertTriangle}</span>
                    <span>Bekor qilish sababi *</span>
                </label>
                <input type="text" class="form-input" id="cancelSupplierReasonInput" placeholder="Masalan: Adashib kiritilgan yoki qaytarilgan..." autofocus>
            </div>

            <div style="display:flex; gap:10px;">
                <button type="button" class="btn" style="flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#FFF;" onclick="closeBottomSheet()">
                    Bekor qilmaslik
                </button>
                <button type="button" class="btn btn--danger" id="confirmCancelSupplierBtn" style="flex:1; background:linear-gradient(135deg, #EF4444, #DC2626); color:#FFF; font-weight:700;" onclick="executeCancelSupplierEntry('${type}', ${id}, ${supplierId})">
                    Ha, bekor qilish
                </button>
            </div>
        </div>
    `);
}

async function executeCancelSupplierEntry(type, id, supplierId) {
    const reasonInput = document.getElementById('cancelSupplierReasonInput');
    const reason = reasonInput ? reasonInput.value.trim() : '';

    if (!reason) {
        showToast("Iltimos, bekor qilish sababini yozing", "error");
        return;
    }

    const btn = document.getElementById('confirmCancelSupplierBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Bekor qilinmoqda...';
    }

    try {
        await apiPost('/suppliers/' + supplierId + '/cancel-entry', {
            type: type,
            entryId: id,
            reason: reason,
            cancelReason: reason
        });
        closeBottomSheet();
        showToast("Operatsiya bekor qilindi (qarz to'g'irlandi)", "success");
        showSupplierDetail(supplierId);
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Ha, bekor qilish';
        }
        showToast("Xatolik: " + err.message, "error");
    }
}

