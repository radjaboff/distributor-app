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
                <button class="btn" style="background:rgba(255,255,255,0.06); border:1px solid var(--color-line); color:#FFF; justify-content:flex-start; padding:13px 15px; font-size:14px; border-radius:14px; display:flex; align-items:center; gap:12px;" onclick="location.reload(true)">
                    <span style="color:#60A5FA; display:flex;">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    </span>
                    <div style="text-align:left;">
                        <div style="font-weight:600; font-size:14px;">Ilovani yangilash (Refresh)</div>
                        <div style="font-size:12px; color:var(--color-ink-dim);">Keshni tozalab ma'lumotlarni qayta yuklash</div>
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

// Toifalar (Bozorlar) ro'yxatini ko'rsatish
async function showMarketGroups() {
    updateHeaderMeta('Bozorlar', "Do'konlar va savdo nuqtalari", 'PRO');
    setRootScreen('bozorlar');
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
    <div class="ledger-row" onclick="showShops(${group.id}, '${escJs(group.name)}')">
        <div class="ledger-row__main" style="display:flex; flex-direction:row; align-items:center; gap:12px;">
            <div class="ledger-avatar ledger-avatar--market">
                ${Icons.market}
            </div>
            <div>
                <div class="ledger-row__title">${escHtml(group.name)}</div>
                <div class="ledger-row__subtitle">Do'konlarni ko'rish</div>
            </div>
        </div>
        <div class="ledger-row__right">
            <button class="icon-btn" onclick="event.stopPropagation(); showEditMarketGroupForm(${group.id}, '${escJs(group.name)}')" title="Tahrirlash">${Icons.edit}</button>
            <button class="icon-btn icon-btn--danger" onclick="event.stopPropagation(); deleteMarketGroup(${group.id}, '${escJs(group.name)}')" title="O'chirish">${Icons.trash}</button>
            <span class="chevron">${Icons.chevronRight}</span>
        </div>
    </div>
`).join('');

    } catch (err) {
        contentEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
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
        let debtBadgeHtml = '';
        if (debt > 0) {
            debtBadgeHtml = `<div class="ledger-row__amount amount--debt">${formatMoney(debt)}</div>`;
        } else if (debt < 0) {
            debtBadgeHtml = `<div class="ledger-row__amount amount--credit">Haqdorlik: ${formatMoney(Math.abs(debt))}</div>`;
        } else {
            debtBadgeHtml = `<div class="ledger-row__amount amount--paid">Toza ${Icons.check}</div>`;
        }

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
                        ${debtBadgeHtml}
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
                    </div>
                    <div class="shop-card__action-group">
                        <button class="icon-btn" onclick="showEditShopForm(${shop.id}, '${escJs(shop.name)}', '${escJs(shop.ownerName || '')}', '${escJs(shop.phone || '')}')" title="Tahrirlash">${Icons.edit}</button>
                        <button class="icon-btn icon-btn--danger" onclick="deleteShop(${shop.id}, '${escJs(shop.name)}', ${debt})" title="O'chirish">${Icons.trash}</button>
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
                ${Number(entry.balanceAfter) < 0 ? 'Avans: ' + formatMoney(Math.abs(entry.balanceAfter)) : 'Qoldiq: ' + formatMoney(entry.balanceAfter)}
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
        } else if (debt < 0) {
            debtLabel = "Do'kon haqi (Ortiqcha to'lov / Avans)";
            debtValueText = formatMoney(Math.abs(debt));
            debtStyleColor = '#38BDF8';
            lineGradient = 'linear-gradient(90deg, #38BDF8, #0284C7)';
        } else {
            debtLabel = 'Hisob toza (Qarzdorlik yo\'q)';
            debtValueText = '0 so\'m';
            debtStyleColor = 'var(--color-paid)';
            lineGradient = 'linear-gradient(90deg, #10B981, #34D399)';
        }

        contentEl.innerHTML = `
            <div class="stat-card" style="margin-bottom:16px; text-align:center; padding: 22px 18px; background: linear-gradient(135deg, #131B2E 0%, #0F172A 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); position: relative; overflow: hidden;">
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
                    <div style="font-size:12.5px; color:var(--color-ink-dim);">Ushbu amal ombor va do'kon qarzini avtomatik qaytaradi</div>
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
                        ? 'Sotuv bekor qilinganda sotilgan tovarlar omborga qaytariladi va do\'kon qarzi mos ravishda kamaytiriladi.' 
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
                    <select class="form-select" id="productSelect">
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
                    <div class="quantity-input-box">
                        <input type="number" inputmode="numeric" class="form-input" id="packageCountInput" placeholder="Masalan: 10" min="1" oninput="updateItemLineTotalPreview()">
                    </div>
                    <div class="quick-chips-row">
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

                <div id="itemLineTotalBox" style="display:none; margin: 12px 0 16px 0; padding: 12px 14px; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13px; color: #93C5FD; font-weight: 600;">Jami tovar summasi:</span>
                    <span id="itemLineTotalVal" style="font-size: 16px; color: #60A5FA; font-weight: 800; font-variant-numeric: tabular-nums;">0 so'm</span>
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
        <div style="background:var(--color-paper); border:1px solid var(--color-line); border-radius:var(--radius); padding:14px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:12px; color:var(--color-ink-dim); font-weight:600; text-transform:uppercase;">Tanlangan mahsulotlar:</span>
                <span style="font-size:15px; font-weight:800; color:var(--color-accent); font-variant-numeric:tabular-nums;">${formatMoney(total)}</span>
            </div>
            ${saleItems.map((item, index) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--color-line);">
                    <div>
                        <div style="font-weight:700; color:#FFF; font-size:14.5px;">${escHtml(item.productName)}</div>
                        <div style="font-size:12.5px; color:var(--color-ink-dim);">${item.packageCount} ta × ${formatMoney(item.price)}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-variant-numeric: tabular-nums; font-weight:700; color:var(--color-ink); font-size:14px;">${formatMoney(item.packageCount * item.price)}</span>
                        <button onclick="removeSaleItem(${index})" style="background:rgba(244,63,94,0.15); border:none; color:var(--color-debt); width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer;" title="O'chirish">×</button>
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
        <div class="form-card">
            <div class="form-card__header">
                <div class="form-card__icon" style="background: rgba(16, 185, 129, 0.15); color: #34D399;">
                    ${Icons.wallet}
                </div>
                <div>
                    <div class="form-card__title">To'lov qabul qilish</div>
                    <div class="form-card__desc">${currentDebt > 0 ? `Joriy qarz: <strong style="color:var(--color-debt); font-variant-numeric:tabular-nums;">${formatMoney(currentDebt)}</strong>` : (currentDebt < 0 ? `Do'kon avansi: <strong style="color:#38BDF8; font-variant-numeric:tabular-nums;">${formatMoney(Math.abs(currentDebt))}</strong>` : 'Qarzdorlik yo\'q')}</div>
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
                <button class="btn btn--primary btn--full" id="submitPaymentBtn" onclick="submitPayment(${shopId}, ${currentDebt})">
                    ${Icons.check} To'lovni saqlash
                </button>
            </div>
        </div>
    `;
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

    // 1. Agar qarz bo'lsa va to'lov summasi qarzdan ko'p bo'lsa (Avans):
    if (debtVal > 0 && amount > debtVal) {
        const overpayment = amount - debtVal;
        showConfirmDialog({
            title: "Ortiqcha to'lov (Avans)",
            message: `Kiritilgan to'lov (${formatMoney(amount)}) joriy qarzdan (${formatMoney(debtVal)}) ortiq. Ortiqcha ${formatMoney(overpayment)} do'kon hisobiga avans (haqqi bor) sifatida yoziladi. Davom etasizmi?`,
            itemName: `Do'kon avansi: +${formatMoney(overpayment)}`,
            confirmText: "Ha, avans qabul qilish",
            cancelText: "Tahrirlash",
            onConfirm: () => {
                closeConfirmDialog();
                executePayment(shopId, amount, method);
            }
        });
        return;
    }

    // 2. Agar do'konda qarz bo'lmasa (0 yoki manfiy) va yana to'lov kiritilsa:
    if (debtVal <= 0) {
        showConfirmDialog({
            title: "Avans to'lovi",
            message: `Do'konda hozirda qarzdorlik yo'q. Ushbu ${formatMoney(amount)} do'konning oldindan to'lovi (avansi) sifatida qabul qilinadi. Davom etasizmi?`,
            itemName: `Yangi avans: ${formatMoney(amount)}`,
            confirmText: "Ha, avans qabul qilish",
            cancelText: "Bekor qilish",
            onConfirm: () => {
                closeConfirmDialog();
                executePayment(shopId, amount, method);
            }
        });
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

        contentEl.innerHTML = `
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

    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state">Mahsulot topilmadi.</div>';
        return;
    }

    container.innerHTML = products.map(p => {
        const isOil = p.name.toLowerCase().includes('yog');
        const unitText = p.unit ? escHtml(p.unit) : '';
        return `
            <div class="ledger-row" onclick="showEditProductForm(${p.id})">
                <div class="ledger-row__main" style="display:flex; flex-direction:row; align-items:center; gap:12px;">
                    <div class="ledger-avatar ${isOil ? 'ledger-avatar--oil' : 'ledger-avatar--product'}">
                        ${isOil ? Icons.oil : Icons.box}
                    </div>
                    <div>
                        <div class="ledger-row__title">${escHtml(p.name)}</div>
                        ${unitText ? `<div class="ledger-row__subtitle">${unitText}</div>` : ''}
                    </div>
                </div>
                <div class="ledger-row__right">
                    <button class="icon-btn" onclick="event.stopPropagation(); showEditProductForm(${p.id})" title="Tahrirlash">${Icons.edit}</button>
                    <button class="icon-btn icon-btn--danger" onclick="event.stopPropagation(); deleteProduct(${p.id}, '${escJs(p.name)}')" title="O'chirish">${Icons.trash}</button>
                    <span class="chevron">${Icons.chevronRight}</span>
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

// Zaxira to'ldirish (Kirim) formasi
function showAddStockInForm(productId, productName) {
    updateHeaderMeta(`Kirim: ${productName}`, 'Omborga yangi tovar kirimi', 'KIRIM');
    setBackAction(showProducts, 'addStockIn');
    fabBtn.style.display = 'none';

    const prod = allProductsList.find(p => p.id === productId) || {};
    const pkgName = prod.packageName || 'paket';
    const defaultUnitPrice = prod.purchasePrice || 0;

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
                    <span>Necha ${escHtml(pkgName)} olindi</span>
                </label>
                <div class="quantity-input-box">
                    <input type="number" inputmode="numeric" class="form-input" id="stockPackageCountInput" placeholder="Masalan: 40" autofocus min="1" oninput="onStockInInputChange('qty')">
                </div>
                <div class="quick-chips-row">
                    <button type="button" class="preset-chip" onclick="addQtyToStockInInput(5)">+5</button>
                    <button type="button" class="preset-chip" onclick="addQtyToStockInInput(10)">+10</button>
                    <button type="button" class="preset-chip" onclick="addQtyToStockInInput(20)">+20</button>
                    <button type="button" class="preset-chip" onclick="addQtyToStockInInput(50)">+50</button>
                    <button type="button" class="preset-chip" onclick="addQtyToStockInInput(100)">+100</button>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="stockUnitPriceInput">
                    <span class="label-icon">${Icons.money}</span>
                    <span>1 ${escHtml(pkgName)} tannarxi (olingan narxi)</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="text" 
                               inputmode="numeric" 
                               class="form-input money-input" 
                               id="stockUnitPriceInput" 
                               value="${defaultUnitPrice ? formatNumberWithSpaces(defaultUnitPrice) : ''}" 
                               placeholder="${defaultUnitPrice ? formatMoney(defaultUnitPrice) : '0'}" 
                               oninput="onMoneyInputChange(this, 'stockUnitPriceLive'); onStockInInputChange('unit')">
                        <span class="money-suffix">so'm</span>
                    </div>
                    <div class="money-live-container" id="stockUnitPriceLive" style="display:none;"></div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="stockTotalCostInput">
                    <span class="label-icon">${Icons.wallet}</span>
                    <span>Jami to'langan summa</span>
                </label>
                <div class="money-field-wrap">
                    <div class="money-input-box">
                        <input type="text" 
                               inputmode="numeric" 
                               class="form-input money-input" 
                               id="stockTotalCostInput" 
                               placeholder="0" 
                               oninput="onMoneyInputChange(this, 'stockTotalCostLive'); onStockInInputChange('total')">
                        <span class="money-suffix">so'm</span>
                    </div>
                    <div class="money-live-container" id="stockTotalCostLive" style="display:none;"></div>
                </div>
                <div id="stockInLiveSummary" style="font-size:13px; font-weight:600; color:#38BDF8; margin-top:8px; display:none; background:rgba(56,189,248,0.1); padding:8px 12px; border-radius:8px; border:1px solid rgba(56,189,248,0.2);"></div>
            </div>

            <div class="form-group" style="margin-top: 22px;">
                <button class="btn btn--primary btn--full" id="submitStockInBtn" onclick="submitStockIn(${productId})">
                    ${Icons.check} Kirimni saqlash
                </button>
            </div>
        </div>
    `;

    if (defaultUnitPrice) {
        updateMoneyLivePreview('stockUnitPriceLive', defaultUnitPrice);
    }
}

function addQtyToStockInInput(delta) {
    const input = document.getElementById('stockPackageCountInput');
    if (!input) return;
    const current = parseInt(input.value) || 0;
    input.value = current + delta;
    onStockInInputChange('qty');
}

function onStockInInputChange(source) {
    const qtyInput = document.getElementById('stockPackageCountInput');
    const unitInput = document.getElementById('stockUnitPriceInput');
    const totalInput = document.getElementById('stockTotalCostInput');
    const summaryEl = document.getElementById('stockInLiveSummary');

    if (!qtyInput || !unitInput || !totalInput) return;

    const qty = parseInt(qtyInput.value) || 0;
    const unitPrice = parseMoney(unitInput.value) || 0;
    const totalCost = parseMoney(totalInput.value) || 0;

    if (source === 'qty' || source === 'unit') {
        if (qty > 0 && unitPrice > 0) {
            const calculatedTotal = qty * unitPrice;
            totalInput.value = formatNumberWithSpaces(calculatedTotal);
            updateMoneyLivePreview('stockTotalCostLive', calculatedTotal);
        }
    } else if (source === 'total') {
        if (qty > 0 && totalCost > 0) {
            const calculatedUnit = Math.round(totalCost / qty);
            unitInput.value = formatNumberWithSpaces(calculatedUnit);
            updateMoneyLivePreview('stockUnitPriceLive', calculatedUnit);
        }
    }

    const finalQty = parseInt(qtyInput.value) || 0;
    const finalUnit = parseMoney(unitInput.value) || 0;
    const finalTotal = parseMoney(totalInput.value) || 0;

    if (summaryEl) {
        if (finalQty > 0 && finalTotal > 0 && finalUnit > 0) {
            summaryEl.style.display = 'block';
            summaryEl.innerHTML = `💡 Hisob: <b>${finalQty}</b> dona × <b>${formatMoney(finalUnit)}</b> = <b>${formatMoney(finalTotal)}</b>`;
        } else {
            summaryEl.style.display = 'none';
        }
    }
}

async function submitStockIn(productId) {
    const packageCount = parseInt(document.getElementById('stockPackageCountInput').value);
    const totalCost = parseMoney(document.getElementById('stockTotalCostInput').value);

    if (!packageCount || !totalCost) {
        showToast('Barcha maydonlarni to\'ldiring', 'error');
        return;
    }

    const btn = document.getElementById('submitStockInBtn');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerHTML = 'Kirim qilinmoqda...';
    }

    try {
        await apiPost('/stock-in', { productId, packageCount, totalCost });
        showToast('Kirim muvaffaqiyatli saqlandi!', 'success');
        showProducts();
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${Icons.check} Kirimni saqlash`;
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
      <div class="section-title">${Icons.alertTriangle} Kam qolgan mahsulotlar</div>
      ${summary.lowStockProducts.map(p => `
        <div class="ledger-row" style="cursor:default;">
          <div class="ledger-row__main"><div class="ledger-row__title">${escHtml(p.productName)}</div></div>
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
            <div class="ledger-row__title">${escHtml(s.shopName)}</div>
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
        resultEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function renderDailyReportHtml(report) {
    const revenue = report.revenueByType || {};
    const totalSalesForDay = report.sales.reduce((sum, s) => sum + s.amount, 0);

    const salesHtml = report.sales.length ? report.sales.map(s => `
    <div class="ledger-row" style="cursor:default;">
      <div class="ledger-row__main">
        <div class="ledger-row__title" style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
          <span>${escHtml(s.shopName)}</span>
          ${formatAdminBadge(s.createdBy)}
        </div>
        <div class="ledger-row__subtitle">${s.paymentType}</div>
      </div>
      <div class="ledger-row__amount amount--debt">${formatMoney(s.amount)}</div>
    </div>
  `).join('') : '<div class="empty-state">Bu kuni sotuv bo\'lmagan</div>';

    const paymentsHtml = report.payments.length ? report.payments.map(p => `
    <div class="ledger-row" style="cursor:default;">
      <div class="ledger-row__main">
        <div class="ledger-row__title" style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
          <span>${escHtml(p.shopName)}</span>
          ${formatAdminBadge(p.createdBy)}
        </div>
        <div class="ledger-row__subtitle">To'lov qabul qilindi</div>
      </div>
      <div class="ledger-row__amount amount--paid">${formatMoney(p.amount)}</div>
    </div>
  `).join('') : '<div class="empty-state">Bu kuni to\'lov bo\'lmagan</div>';

    return `
    <div class="form-group">
      <button class="btn btn--primary btn--full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;" onclick="downloadDailyExcel()">${Icons.download} Excel'ga yuklab olish</button>
    </div>

    <div class="stat-card" style="margin-bottom:12px;">
      <div class="stat-card__label">Kunlik savdo</div>
      <div class="stat-card__value" style="font-size:24px; font-weight:800; color:#60A5FA; margin-top:4px;">${formatMoney(totalSalesForDay)}</div>
    </div>

    <div class="stat-card" style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div class="stat-card__label" style="font-weight:700; color:var(--color-paid);">Kassaga tushgan to'lovlar</div>
        <span style="font-size:14px; font-weight:700; color:var(--color-paid);">${formatMoney((Number(revenue.NAQD) || 0) + (Number(revenue.KARTA) || 0))}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--color-line); font-size:13px;">
        <span>Naqd to'lov:</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.NAQD || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:13px;">
        <span>Karta orqali:</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.KARTA || 0)}</span>
      </div>
    </div>

    <div class="stat-card" style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="stat-card__label" style="color:var(--color-debt); font-weight:700;">Nasiyaga berilgan savdo</div>
        <span style="font-size:14px; font-weight:700; color:var(--color-debt);">${formatMoney(revenue.NASIYA || 0)}</span>
      </div>
    </div>

    <div class="section-title">${Icons.box} Kimga sotildi</div>
    ${salesHtml}

    <div class="section-title">${Icons.money} Kimdan olindi</div>
    ${paymentsHtml}
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
        resultEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function renderMonthlyReportHtml(report) {
    const revenue = report.revenueByType || {};

    const productVolHtml = report.productSalesVolume.length ? report.productSalesVolume.map(p => `
    <div class="ledger-row" style="cursor:default;">
      <div class="ledger-row__main"><div class="ledger-row__title">${escHtml(p.productName)}</div></div>
      <div class="ledger-row__amount amount--neutral">${p.totalPackagesSold} ta</div>
    </div>
  `).join('') : '<div class="empty-state">Ma\'lumot yo\'q</div>';

    return `
    <div class="form-group">
      <button class="btn btn--primary btn--full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;" onclick="downloadMonthlyExcel()">${Icons.download} Excel'ga yuklab olish</button>
    </div>

    <div class="stat-card" style="margin-bottom:12px;">
      <div class="stat-card__label">Oylik savdo</div>
      <div class="stat-card__value" style="font-size:24px; font-weight:800; color:#60A5FA; margin-top:4px;">${formatMoney(report.totalSalesAmount)}</div>
    </div>
    
    <div class="stat-card" style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div class="stat-card__label" style="font-weight:700; color:var(--color-paid);">Kassaga tushgan to'lovlar</div>
        <span style="font-size:14px; font-weight:700; color:var(--color-paid);">${formatMoney((Number(revenue.NAQD) || 0) + (Number(revenue.KARTA) || 0))}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--color-line); font-size:13px;">
        <span>Naqd to'lov:</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.NAQD || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:13px;">
        <span>Karta orqali:</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.KARTA || 0)}</span>
      </div>
    </div>

    <div class="stat-card" style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="stat-card__label" style="color:var(--color-debt); font-weight:700;">Nasiyaga berilgan savdo</div>
        <span style="font-size:14px; font-weight:700; color:var(--color-debt);">${formatMoney(revenue.NASIYA || 0)}</span>
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
        resultEl.innerHTML = `<div class="empty-state">Xatolik: ${escHtml(err.message)}</div>`;
    }
}

function renderRangeReportHtml(report) {
    const revenue = report.revenueByType || {};


    const stockInVolHtml = report.stockInVolume && report.stockInVolume.length ? report.stockInVolume.map(s => `
  <div class="ledger-row" style="cursor:default;">
    <div class="ledger-row__main"><div class="ledger-row__title">${escHtml(s.productName)}</div></div>
    <div class="ledger-row__amount amount--debt">${s.totalPackagesReceived} ta</div>
  </div>
`).join('') : '<div class="empty-state">Ma\'lumot yo\'q</div>';



    const productVolHtml = report.productSalesVolume.length ? report.productSalesVolume.map(p => `
    <div class="ledger-row" style="cursor:default;">
      <div class="ledger-row__main"><div class="ledger-row__title">${escHtml(p.productName)}</div></div>
      <div class="ledger-row__amount amount--neutral">${p.totalPackagesSold} ta</div>
    </div>
  `).join('') : '<div class="empty-state">Ma\'lumot yo\'q</div>';

    return `
    <div class="form-group">
      <button class="btn btn--primary btn--full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;" onclick="downloadRangeExcel()">${Icons.download} Excel'ga yuklab olish</button>
    </div>

    <div class="stat-card" style="margin-bottom:12px;">
      <div class="stat-card__label">Umumiy savdo</div>
      <div class="stat-card__value" style="font-size:24px; font-weight:800; color:#60A5FA; margin-top:4px;">${formatMoney(report.totalSalesAmount)}</div>
    </div>

    <div class="stat-card" style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div class="stat-card__label" style="font-weight:700; color:var(--color-paid);">Kassaga tushgan to'lovlar</div>
        <span style="font-size:14px; font-weight:700; color:var(--color-paid);">${formatMoney((Number(revenue.NAQD) || 0) + (Number(revenue.KARTA) || 0))}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--color-line); font-size:13px;">
        <span>Naqd to'lov:</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.NAQD || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:13px;">
        <span>Karta orqali:</span><span style="font-variant-numeric:tabular-nums; font-weight:600;">${formatMoney(revenue.KARTA || 0)}</span>
      </div>
    </div>

    <div class="stat-card" style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="stat-card__label" style="color:var(--color-debt); font-weight:700;">Nasiyaga berilgan savdo</div>
        <span style="font-size:14px; font-weight:700; color:var(--color-debt);">${formatMoney(revenue.NASIYA || 0)}</span>
      </div>
    </div>

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

        contentEl.innerHTML = debtors.map(shop => {
            const debt = Number(shop.currentDebt) || 0;
            return `
                <div class="shop-card" onclick="currentGroupId=${shop.marketGroupId}; currentGroupName='${escJs(shop.marketGroupName)}'; showShopDetail(${shop.id})">
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

