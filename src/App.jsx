import { useState, useEffect, useCallback, useRef } from 'react';

/* ──────────────────────────────────────────────
   雲管家  YPURE Cloud Butler
   React + Vite — App.jsx (v4 Full Features)
   ────────────────────────────────────────────── */

const API = 'https://laundry-backend-production-efa4.up.railway.app';
const LIFF_ID = '2009552592-xkDKSJ1Y';

// ─── 洗衣模式設定 ───
const MODES = [
  { id: 'standard', name: '洗脫烘-標準', price: 160, minutes: 65, color: '#FF9500', desc: '日常衣物' },
  { id: 'small',    name: '洗脫烘-少量', price: 130, minutes: 50, color: '#FFBF60', desc: '少量省錢' },
  { id: 'washonly', name: '只要洗衣',     price: 80,  minutes: 35, color: '#5AC8FA', desc: '純洗不烘' },
  { id: 'soft',     name: '洗脫烘-輕柔', price: 160, minutes: 65, color: '#C7A640', desc: '呵護細緻' },
  { id: 'strong',   name: '洗脫烘-強勁', price: 180, minutes: 75, color: '#FF6B2B', desc: '深層去污' },
  { id: 'dryonly',  name: '只要烘乾',     price: 60,  minutes: 40, color: '#FF3B30', desc: '快速烘乾' },
];

// ─── 店家資料 ───
const STORES = [
  { id: 's1', name: '悠洗自助洗衣',           addr: '嘉義市東區文雅街181號',       machines: 6, dryers: 2 },
  { id: 's2', name: '吼你洗自助洗衣(玉清店)', addr: '苗栗縣苗栗市玉清路51號',      machines: 6, dryers: 2 },
  { id: 's3', name: '吼你洗自助洗衣(農會店)', addr: '苗栗縣苗栗市為公路290號',     machines: 6, dryers: 2 },
  { id: 's4', name: '熊愛洗自助洗衣',         addr: '台中市西屯區福聯街22巷2號',    machines: 6, dryers: 2 },
  { id: 's5', name: '上好洗自助洗衣',         addr: '高雄市鳳山區北平路214號',      machines: 6, dryers: 2 },
];

// ─── 預設優惠券 ───
const DEFAULT_COUPONS = [
  { id: 'c1', name: '新會員折扣', discount: 20, type: 'fixed', minSpend: 100, expiry: '2026-06-30', used: false, category: 'coupon' },
  { id: 'c2', name: '烘乾免費券', discount: 60, type: 'fixed', minSpend: 0, expiry: '2026-05-15', used: false, modeOnly: 'dryonly', category: 'coupon' },
  { id: 'c3', name: '洗衣9折', discount: 10, type: 'percent', minSpend: 130, expiry: '2026-04-30', used: false, category: 'coupon' },
  { id: 'c4', name: '包月洗衣卡', discount: 50, type: 'fixed', minSpend: 0, expiry: '2026-12-31', used: false, category: 'monthly', desc: '每月可用4次，每次折$50' },
  { id: 'c5', name: '春季節慶優惠', discount: 15, type: 'percent', minSpend: 100, expiry: '2026-04-30', used: false, category: 'festival', desc: '春季限定85折' },
];

// ─── 儲值方案 ───
const TOPUP_OPTIONS = [
  { id: 'tp1', amount: 100, bonus: 0, label: '$100' },
  { id: 'tp2', amount: 300, bonus: 10, label: '$300', tag: '送10點' },
  { id: 'tp3', amount: 500, bonus: 50, label: '$500', tag: '送50點', popular: true },
  { id: 'tp4', amount: 1000, bonus: 150, label: '$1,000', tag: '送150點' },
];

// ─── 優惠中心商品 ───
const STORE_COUPONS = {
  gift: [
    { id: 'sc1', name: '衣鳴驚人', discount: '25%OFF', price: 675, originalPrice: 900, type: '滿減卷',
      desc: '當實付點數達到70點，可使用該卷抵扣90點', timeSlot: '全時段可用', device: '限烘乾機使用，共可用11次',
      validity: '自購買起90日內有效', stores: '雲管家洗衣【全台直營門市】',
      usage: '於會員系統中使用『店內付款』功能，選擇該優惠卷，系統將自動扣抵點數', purchaseLimit: '不限制購買次數' },
    { id: 'sc2', name: '衣見鍾情', discount: '30%OFF', price: 1750, originalPrice: 2500, type: '滿減卷',
      desc: '當實付點數達到160點，可使用該卷抵扣250點', timeSlot: '全時段可用', device: '限一體機(L)使用，共可用11次',
      validity: '自購買起90日內有效', stores: '雲管家洗衣【全台直營門市】',
      usage: '於會員系統中使用『店內付款』功能，選擇該優惠卷，系統將自動扣抵點數', purchaseLimit: '不限制購買次數' },
    { id: 'sc3', name: '煥然衣新', discount: '21%OFF', price: 999, originalPrice: 1260, type: '滿減卷',
      desc: '當實付點數達到120點，可使用該卷抵扣210點', timeSlot: '全時段可用', device: '限一體機(M)使用，共可用6次',
      validity: '自購買起31日內有效', stores: '雲管家洗衣【全台直營門市】',
      usage: '於會員系統中使用『店內付款』功能，選擇該優惠卷，系統將自動扣抵點數', purchaseLimit: '不限制購買次數' },
  ],
  monthly: [
    { id: 'sc4', name: '夜猫計畫 (半年)', discount: '37%OFF', price: 3800, originalPrice: 6000, type: '折扣券',
      desc: '該卷將全額抵扣應付點數', timeSlot: '僅在01:00 - 07:00時段可用', device: '限一體機(M/L)使用，共可用24次',
      validity: '自購買起183日內有效', stores: '雲管家洗衣【全台直營門市】',
      usage: '於會員系統中使用『店內付款』功能，選擇該優惠卷，系統將自動扣抵點數', purchaseLimit: '不限制購買次數',
      canCombine: '不可與其他優惠活動併用' },
    { id: 'sc5', name: '夜猫計畫 (一年)', discount: '74%OFF', price: 5500, originalPrice: 21000, type: '折扣券',
      desc: '該卷將全額抵扣應付點數', timeSlot: '僅在01:00 - 07:00時段可用', device: '限一體機(M/L)使用，共可用84次',
      validity: '自購買起365日內有效', stores: '雲管家洗衣【全台直營門市】',
      usage: '於會員系統中使用『店內付款』功能，選擇該優惠卷，系統將自動扣抵點數', purchaseLimit: '不限制購買次數',
      canCombine: '不可與其他優惠活動併用' },
    { id: 'sc6', name: '夜猫計畫 (單月)', discount: '45%OFF', price: 580, originalPrice: 1050, type: '折扣券',
      desc: '該卷將全額抵扣應付點數', timeSlot: '僅在01:00 - 07:00時段可用', device: '限一體機(M)使用，共可用5次',
      validity: '自購買起31日內有效', stores: '雲管家洗衣【全台直營門市】',
      usage: '於會員系統中使用『店內付款』功能，選擇該優惠卷，系統將自動扣抵點數', purchaseLimit: '不限制購買次數',
      canCombine: '不可與其他優惠活動併用' },
  ],
  festival: [],
};

// ─── 預設最新消息 ───
const NEWS_ITEMS = [
  { id: 'n1', title: '我們一直都在', date: '2026-03-20', tag: '原創', author: '雲管家洗衣',
    desc: '在生活節奏越來越快的都市中，自助洗衣已成為許多人生活中不可或缺的一環...',
    content: '在生活節奏越來越快的都市中，自助洗衣已成為許多人生活中不可或缺的一環。雲管家深知，對顧客來說「乾淨」從來不只是衣服的狀態，更是整體洗衣體驗的基礎。\n\n為了提供最安心、舒適的自助洗衣空間，我們雲管家洗衣團隊每週都會到店巡檢，默默守護大家的洗衣時光。我們定期補充洗衣用品、清潔環境、維護設備、檢查濾網、確認洗衣機運作狀況，只為了讓每位來洗衣的你都能感受到一種被照顧的安心。\n\n我們相信，洗衣不是把衣服丟進機器就好，而是日常中一種「讓生活更有秩序」的儀式感。我們會繼續努力，成為你生活裡最可靠的洗衣夥伴。' },
  { id: 'n2', title: '升級會員洗衣更輕鬆', date: '2026-03-18', tag: '系統',  author: '雲管家洗衣',
    desc: '雲管家全面升級會員系統，打造更智慧、便利的洗衣體驗...',
    content: '雲管家全面升級會員系統，打造更智慧、便利的洗衣體驗！新系統支援點數儲值、優惠券管理、機器狀態即時查詢等功能，讓你的洗衣生活更加輕鬆便利。\n\n透過LINE官方帳號即可快速註冊，享受專屬會員福利。' },
  { id: 'n3', title: '專屬你的洗衣錢包', date: '2026-03-15', tag: '功能', author: '雲管家洗衣',
    desc: '雲管家全新線上會員功能來囉！會員可透過LINE官方帳號管理點數...',
    content: '雲管家全新線上會員功能來囉！會員可透過LINE官方帳號管理點數、查看交易紀錄、領取優惠券。\n\n首次加入會員即贈50元洗衣折扣券，立即加入享受專屬優惠！' },
  { id: 'n4', title: '夜猫洗衣全年最划算', date: '2026-03-10', tag: '優惠', author: '雲管家洗衣',
    desc: '你也是「夜猫洗衣族」嗎？深夜洗衣機台不用排隊，空間獨享...',
    content: '你也是「夜猫洗衣族」嗎？深夜洗衣機台不用排隊，空間獨享更自在！\n\n夜猫計畫提供01:00-07:00時段專屬優惠，年卡方案每次洗衣只要65點，是一般價格的31折！立即購買夜猫計畫，享受最划算的深夜洗衣體驗。' },
];

// ─── CSS Styles ───
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;900&display=swap');

:root {
  --primary: #C8A84E;
  --primary-dark: #0A0A0A;
  --primary-mid: #1A1A1A;
  --accent: #C8A84E;
  --accent-light: #E0C868;
  --bg: #080808;
  --bg-elevated: #111111;
  --bg-surface: #181818;
  --card: rgba(255,255,255,0.06);
  --card-solid: #1C1C1E;
  --card-border: rgba(255,255,255,0.10);
  --card-hover: rgba(255,255,255,0.10);
  --glass: rgba(255,255,255,0.04);
  --glass-border: rgba(255,255,255,0.08);
  --text: #FFFFFF;
  --text-sub: #AAAAAA;
  --text-hint: #666666;
  --success: #34C759;
  --warning: #FF9500;
  --danger: #FF3B30;
  --running: #FF6B2B;
  --radius: 16px;
  --radius-sm: 12px;
  --shadow: 0 2px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.6);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  font-size: 19px;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
}

#root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 100% 60% at 50% -5%, rgba(200,168,78,0.07) 0%, transparent 50%),
    radial-gradient(ellipse 80% 40% at 20% 10%, rgba(60,60,60,0.15) 0%, transparent 50%),
    radial-gradient(ellipse 70% 50% at 80% 15%, rgba(40,40,40,0.12) 0%, transparent 50%),
    radial-gradient(ellipse 90% 30% at 50% 50%, rgba(20,20,20,0.3) 0%, transparent 60%),
    linear-gradient(180deg, #0E0E0E 0%, #080808 30%, #050505 100%);
  background-attachment: fixed;
}

/* ═══ Loading Screen ═══ */
.loading-screen {
  position: fixed; inset: 0; z-index: 9999;
  background: linear-gradient(160deg, #000000 0%, #0A0A0A 35%, #111111 70%, #1A1A1A 100%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 36px;
}
.loading-logo-wrap {
  background: #ffffff;
  border-radius: 28px;
  padding: 24px 44px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
  animation: logoFloat 2.5s ease-in-out infinite;
}
.loading-logo {
  width: 200px; height: auto; display: block;
}
@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.loading-text {
  color: rgba(255,255,255,0.92);
  font-size: 22px; font-weight: 600;
  letter-spacing: 5px;
}
.loading-dots { display: flex; gap: 10px; }
.loading-dots span {
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--accent);
  animation: dotBounce 1.4s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.5); opacity: 0.35; }
  40% { transform: scale(1); opacity: 1; }
}
.loading-fade-out { animation: fadeOut 0.5s ease forwards; }
@keyframes fadeOut { to { opacity: 0; pointer-events: none; } }

/* ═══ App Shell ═══ */
.app-shell {
  min-height: 100vh;
  animation: slideUp 0.5s ease;
  padding-bottom: 80px;
}
.app-shell.has-pay-bar { padding-bottom: 180px; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ═══ Dark Header ═══ */
.dark-header {
  background:
    radial-gradient(ellipse 120% 80% at 50% -20%, rgba(200,168,78,0.08) 0%, transparent 60%),
    linear-gradient(180deg, #111 0%, #0A0A0A 100%);
  padding: 0 20px;
  padding-top: env(safe-area-inset-top, 12px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: relative;
  overflow: hidden;
}
.dark-header::after {
  content: '';
  position: absolute; bottom: -1px; left: 0; right: 0;
  height: 20px;
  background: linear-gradient(180deg, transparent, var(--bg));
  pointer-events: none;
}
.dark-header-inner {
  max-width: 520px; margin: 0 auto;
  padding: 18px 0 20px;
}
.dark-header-top {
  display: flex; align-items: center; gap: 14px;
}
.dark-header-logo-wrap {
  background: #ffffff;
  border-radius: 12px;
  padding: 6px 14px;
  display: flex; align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.dark-header-logo {
  height: 28px; width: auto; display: block;
}
.dark-header-brand {
  color: rgba(255,255,255,0.95); font-size: 22px; font-weight: 700;
  letter-spacing: 1.5px;
}
.dark-header-user {
  display: flex; align-items: center; gap: 12px;
  margin-top: 16px; padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.dark-header-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  border: 2.5px solid var(--accent); object-fit: cover;
  flex-shrink: 0;
}
.dark-header-avatar-text {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--accent); display: flex;
  align-items: center; justify-content: center;
  font-size: 22px; color: white; font-weight: 700;
  flex-shrink: 0;
}
.dark-header-welcome {
  color: rgba(255,255,255,0.8); font-size: 20px;
}
.dark-header-welcome strong {
  color: var(--accent-light); font-weight: 600;
}

/* ═══ Content Area ═══ */
.content-area {
  max-width: 520px; margin: 0 auto;
  padding: 0 18px 20px;
}

/* ═══ Section Divider (NIKKO style) ═══ */
.section-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 28px 0 18px;
}
.section-divider::before,
.section-divider::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,168,78,0.3), transparent);
}
.section-divider-text {
  font-size: 22px; font-weight: 700;
  color: var(--accent);
  white-space: nowrap;
}

/* ═══ Section Title ═══ */
.sec-title {
  font-size: 24px; font-weight: 800;
  color: #FFFFFF;
  margin: 24px 0 16px;
  display: flex; align-items: center; gap: 8px;
}
.sec-title::before {
  content: ''; width: 5px; height: 26px;
  background: var(--accent); border-radius: 2px;
}

/* ═══ Back Button ═══ */
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none;
  color: var(--accent); font-size: 18px; font-weight: 600;
  cursor: pointer; padding: 12px 0 4px;
  font-family: inherit;
}
.back-btn:active { opacity: 0.5; }

/* ═══ Store Cards (NIKKO horizontal style) ═══ */
.store-scroll {
  display: flex; gap: 12px;
  overflow-x: auto; scroll-snap-type: x mandatory;
  padding: 4px 0 12px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.store-scroll::-webkit-scrollbar { display: none; }
.store-card {
  flex: 0 0 calc(50% - 6px);
  min-width: 200px;
  scroll-snap-align: start;
  background: var(--card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius);
  padding: 22px 18px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--card-border);
  position: relative;
}
.store-card:active { transform: scale(0.97); }
.store-card.selected { border-color: var(--accent); background: rgba(200,168,78,0.08); }
.store-card .s-name {
  font-size: 21px; font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 10px;
  line-height: 1.3;
}
.store-card .s-addr {
  font-size: 15px; color: var(--text-sub);
  line-height: 1.5; margin-bottom: 14px;
}
.store-select-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: 2px solid var(--accent);
  background: transparent; color: var(--accent);
  padding: 10px 22px; border-radius: 24px;
  font-size: 17px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.store-select-btn:active { background: var(--accent); color: #000; }

/* ═══ Machine List (NIKKO horizontal row style) ═══ */
.machine-list { display: flex; flex-direction: column; gap: 0; }
.machine-row {
  display: flex; align-items: center; gap: 16px;
  padding: 20px 20px;
  background: var(--card);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: background 0.15s;
}
.machine-row:first-child { border-radius: var(--radius) var(--radius) 0 0; }
.machine-row:last-child { border-radius: 0 0 var(--radius) var(--radius); border-bottom: none; }
.machine-row:only-child { border-radius: var(--radius); }
.machine-row:active { background: rgba(255,255,255,0.08); }
.machine-icon-box {
  width: 60px; height: 60px; flex-shrink: 0;
  border-radius: 14px; background: rgba(255,255,255,0.04);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px;
}
.machine-info { flex: 1; min-width: 0; }
.machine-name {
  font-size: 22px; font-weight: 700; color: var(--text);
}
.machine-timer {
  display: flex; align-items: center; gap: 5px;
  font-size: 17px; color: var(--text-sub); margin-top: 4px;
}
.machine-timer svg { flex-shrink: 0; }
.machine-actions { display: flex; gap: 8px; flex-shrink: 0; }
.m-btn {
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 18px; font-weight: 700;
  border: none; cursor: pointer;
  font-family: inherit;
  transition: transform 0.1s;
  line-height: 1.2;
}
.m-btn:active { transform: scale(0.93); }
.m-btn-use { background: var(--success); color: white; }
.m-btn-running { background: #3A3A3A; color: #AAA; cursor: pointer; }
.m-btn-extend { background: var(--warning); color: white; font-size: 16px; line-height: 1.3; }
.m-btn-offline { background: #2A2A2A; color: #555; cursor: not-allowed; }

/* ═══ Mode Grid (NIKKO 2x3 style) ═══ */
.mode-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.mode-cell {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 22px 10px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  backdrop-filter: blur(10px);
}
.mode-cell:active { transform: scale(0.95); }
.mode-cell.selected {
  border-color: var(--accent);
  background: rgba(200,168,78,0.12);
  box-shadow: 0 0 0 1px var(--accent), 0 4px 16px rgba(200,168,78,0.1);
}
.mode-dot {
  width: 24px; height: 24px;
  border-radius: 50%; margin: 0 auto 12px;
}
.mode-cell-name {
  font-size: 18px; font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}
.mode-cell-price {
  font-size: 16px; color: var(--text-sub);
  margin-top: 6px; font-weight: 600;
}

/* ═══ Dryer Temp (NIKKO style) ═══ */
.temp-row {
  display: flex; align-items: center; gap: 10px;
  margin-top: 16px;
  background: var(--card);
  border-radius: var(--radius-sm);
  padding: 16px 18px;
}
.temp-label { font-size: 18px; font-weight: 600; color: var(--text); margin-right: auto; }
.temp-btn {
  padding: 11px 22px;
  border-radius: 10px;
  font-size: 16px; font-weight: 600;
  border: 1px solid var(--card-border);
  background: var(--card); color: var(--text);
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.temp-btn.active {
  background: #FFF; border-color: #FFF;
  color: #000;
  font-weight: 800;
}
.temp-btn:active { transform: scale(0.95); }

/* ═══ Bottom Pay Bar (NIKKO style) ═══ */
.pay-bar {
  position: fixed; bottom: 72px; left: 0; right: 0;
  z-index: 200;
}
.pay-bar-inner {
  max-width: 520px; margin: 0 auto;
  background: linear-gradient(180deg, #1A1A1A 0%, #111 100%);
  border-radius: 20px 20px 0 0;
  padding: 20px 24px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.6);
  border-top: 1px solid rgba(255,255,255,0.08);
}
.pay-bar-price { flex: 1; }
.pay-bar-label {
  font-size: 15px; color: rgba(255,255,255,0.6);
}
.pay-bar-amount {
  font-size: 34px; font-weight: 900; color: white;
  line-height: 1.1;
}
.pay-bar-amount span { font-size: 20px; font-weight: 600; }
.pay-bar-btn {
  padding: 18px 34px;
  border-radius: 14px;
  border: none; cursor: pointer;
  font-size: 20px; font-weight: 700;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}
.pay-bar-btn.ready {
  background: linear-gradient(135deg, #00C755 0%, #00B040 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(0,180,64,0.35);
}
.pay-bar-btn.ready:active { transform: scale(0.96); }
.pay-bar-btn.disabled {
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.4);
  cursor: not-allowed;
}

/* ═══ Running Detail Panel ═══ */
.running-panel {
  background: var(--card);
  border-radius: var(--radius);
  padding: 32px 24px;
  margin-top: 16px;
  box-shadow: var(--shadow-lg);
  text-align: center;
}
.running-panel h3 {
  font-size: 24px; font-weight: 800;
  color: var(--running); margin-bottom: 8px;
}
.running-panel p { font-size: 18px; color: var(--text-sub); }

/* ═══ Timer Ring ═══ */
.timer-ring {
  width: 200px; height: 200px;
  margin: 28px auto; position: relative;
}
.timer-ring svg { transform: rotate(-90deg); width: 200px; height: 200px; }
.timer-ring-bg { fill: none; stroke: #F0F0F4; stroke-width: 12; }
.timer-ring-progress {
  fill: none; stroke: var(--running); stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}
.timer-ring-text {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.timer-ring-time {
  font-size: 42px; font-weight: 900;
  color: var(--running);
  font-variant-numeric: tabular-nums;
}
.timer-ring-label {
  font-size: 16px; color: var(--text-sub);
  margin-top: 2px; font-weight: 500;
}

/* ═══ Confirm Modal ═══ */
.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: flex-end; justify-content: center;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } }
.modal-sheet {
  background: linear-gradient(180deg, #1E1E1E 0%, #141414 100%);
  width: 100%; max-width: 520px;
  border-radius: 24px 24px 0 0;
  padding: 32px 24px;
  padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px));
  animation: sheetUp 0.3s ease;
}
@keyframes sheetUp { from { transform: translateY(100%); } }
.modal-title {
  font-size: 24px; font-weight: 800;
  color: #FFFFFF; margin-bottom: 24px;
  text-align: center;
}
.modal-row {
  display: flex; justify-content: space-between;
  padding: 13px 0;
  font-size: 18px; color: var(--text);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.modal-row .label { color: var(--text-sub); }
.modal-row .value { font-weight: 600; }
.modal-row.total { border-bottom: none; margin-top: 10px; }
.modal-row.total .value {
  font-size: 30px; font-weight: 900;
  color: var(--primary);
}
.modal-actions { display: flex; gap: 12px; margin-top: 28px; }
.modal-actions button {
  flex: 1; padding: 18px; border-radius: 14px;
  font-size: 19px; font-weight: 700;
  border: none; cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.modal-cancel { background: rgba(255,255,255,0.08); color: var(--text-sub); }
.modal-confirm {
  background: linear-gradient(135deg, #00C755, #00B040);
  color: white;
}
.modal-confirm:active { transform: scale(0.97); }

/* ═══ Toast ═══ */
.toast {
  position: fixed; top: 80px; left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: #000; padding: 16px 30px;
  border-radius: 14px;
  font-size: 18px; font-weight: 600;
  box-shadow: var(--shadow-lg);
  z-index: 9999;
  animation: toastIn 0.3s ease, toastOut 0.3s ease 2.7s forwards;
}
@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } }
@keyframes toastOut { to { opacity: 0; transform: translateX(-50%) translateY(-20px); } }

/* ═══ Result Screen ═══ */
.result-container {
  text-align: center; padding: 48px 20px;
}
.result-icon { font-size: 80px; margin-bottom: 20px; }
.result-title { font-size: 26px; font-weight: 800; margin-bottom: 10px; }
.result-desc { font-size: 18px; color: var(--text-sub); line-height: 1.6; }
.result-btn {
  margin-top: 28px; padding: 18px 48px;
  border: none; border-radius: 14px;
  background: var(--accent);
  color: #000; font-size: 19px;
  font-weight: 700; cursor: pointer;
  font-family: inherit;
}
.result-btn:active { transform: scale(0.97); }

/* ═══ Bottom Tab Bar ═══ */
.tab-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 300;
  background: linear-gradient(180deg, rgba(10,10,10,0.95) 0%, #000 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.tab-bar-inner {
  max-width: 520px; margin: 0 auto;
  display: flex; justify-content: space-around;
  padding: 8px 0 6px;
}
.tab-item {
  display: flex; flex-direction: column;
  align-items: center; gap: 3px;
  background: none; border: none;
  cursor: pointer; font-family: inherit;
  padding: 4px 12px;
  transition: all 0.15s;
  min-width: 60px;
}
.tab-item svg { width: 26px; height: 26px; }
.tab-item-label {
  font-size: 12px; font-weight: 600;
  color: var(--text-hint);
}
.tab-item.active svg { color: var(--accent); }
.tab-item.active .tab-item-label {
  color: var(--accent); font-weight: 700;
}

/* ═══ Home Dashboard ═══ */
.home-wallet {
  background: linear-gradient(145deg, #B89A3E 0%, #D4B85C 30%, #C8A84E 60%, #9A7A2E 100%);
  border-radius: 20px;
  padding: 28px 24px;
  color: #1A1A1A;
  box-shadow: 0 8px 32px rgba(200,168,78,0.2), var(--shadow-lg);
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.home-wallet::before {
  content: '';
  position: absolute; top: -50%; right: -30%;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.home-wallet-title {
  font-size: 15px; color: rgba(0,0,0,0.6);
  margin-bottom: 6px;
}
.home-wallet-points {
  font-size: 42px; font-weight: 900;
  line-height: 1.1; margin-bottom: 4px;
}
.home-wallet-points span { font-size: 18px; font-weight: 600; margin-left: 4px; }
.home-wallet-actions {
  display: flex; gap: 10px; margin-top: 18px;
}
.home-wallet-btn {
  flex: 1; padding: 14px;
  border-radius: 12px; border: none;
  font-size: 17px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: transform 0.1s;
  text-align: center;
}
.home-wallet-btn:active { transform: scale(0.96); }
.home-wallet-btn.topup {
  background: #FFFFFF; color: #1A1A1A;
}
.home-wallet-btn.history {
  background: rgba(0,0,0,0.2); color: #1A1A1A;
}

/* Section Title */
.section-title-row {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 14px; margin-top: 4px;
}
.section-title-bar {
  width: 4px; height: 20px; border-radius: 2px;
  background: var(--accent, #C8A84E);
}
.section-title-text {
  font-size: 18px; font-weight: 800; color: var(--text);
  letter-spacing: 0.5px;
}

.home-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px; margin-bottom: 12px;
}
.home-grid-card {
  background: var(--card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-sm);
  padding: 18px 16px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: transform 0.1s;
  border: 1px solid var(--card-border);
  display: flex; flex-direction: column; justify-content: center;
}
.home-grid-card:active { transform: scale(0.97); }
.home-grid-card-large {
  align-items: center; text-align: center;
  justify-content: center;
}
.home-grid-card-horizontal {
  flex-direction: row; justify-content: space-between; align-items: center;
}
.home-grid-icon { margin-bottom: 10px; text-align: center; }
.home-grid-label {
  font-size: 16px; font-weight: 700; color: var(--text);
}
.home-grid-sub {
  font-size: 12px; color: var(--text-sub); margin-top: 3px;
}

.news-card {
  background: var(--card);
  border-radius: var(--radius-sm);
  padding: 18px 20px;
  box-shadow: var(--shadow);
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform 0.1s;
}
.news-card:active { transform: scale(0.97); }
.news-title {
  font-size: 17px; font-weight: 700; color: var(--text);
  margin-bottom: 4px;
}
.news-date {
  font-size: 14px; color: var(--text-hint);
}

/* ═══ Coupon Card ═══ */
.coupon-card {
  background: var(--card);
  border-radius: var(--radius-sm);
  padding: 20px;
  box-shadow: var(--shadow);
  margin-bottom: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  border-left: 5px solid var(--accent);
  display: flex; align-items: center; gap: 16px;
  cursor: pointer;
  transition: transform 0.1s;
}
.coupon-card.used {
  opacity: 0.4;
  border-left-color: #444;
  cursor: default;
}
.coupon-card.selected-coupon {
  border-left-color: var(--success);
  background: #0A1A0A;
}
.coupon-card:active:not(.used) { transform: scale(0.98); }
.coupon-info { flex: 1; }
.coupon-name { font-size: 18px; font-weight: 700; color: var(--text); }
.coupon-detail { font-size: 14px; color: var(--text-sub); margin-top: 4px; }
.coupon-discount {
  font-size: 28px; font-weight: 900; color: var(--accent);
  white-space: nowrap;
}
.coupon-discount.used-label { color: #555; font-size: 16px; }

/* ═══ History List ═══ */
.history-card {
  background: var(--card);
  border-radius: var(--radius-sm);
  padding: 18px 20px;
  box-shadow: var(--shadow);
  margin-bottom: 10px;
}
.history-top {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
}
.history-store { font-size: 17px; font-weight: 700; color: var(--text); }
.history-amount { font-size: 20px; font-weight: 900; color: var(--primary); }
.history-detail { font-size: 14px; color: var(--text-sub); line-height: 1.6; }

/* ═══ Pay Method Toggle ═══ */
.pay-toggle {
  display: flex; gap: 0;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 3px;
  margin: 16px 0;
  border: 1px solid rgba(255,255,255,0.08);
}
.pay-toggle-btn {
  flex: 1; padding: 12px;
  border: none; border-radius: 10px;
  font-size: 16px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  background: transparent; color: var(--text-sub);
  transition: all 0.2s;
}
.pay-toggle-btn.active {
  background: #FFF; color: #000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  font-weight: 800;
}

/* ═══ Coupon Select Row ═══ */
.coupon-select-row {
  background: var(--card);
  border-radius: var(--radius-sm);
  padding: 16px 18px;
  margin-top: 12px;
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer;
  transition: transform 0.1s;
}
.coupon-select-row:active { transform: scale(0.98); }
.coupon-select-label { font-size: 17px; font-weight: 600; color: var(--text); }
.coupon-select-value { font-size: 16px; color: var(--accent); font-weight: 700; }

/* ═══ Door Alert Modal ═══ */
.door-alert-overlay {
  position: fixed; inset: 0; z-index: 600;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.2s ease;
}
.door-alert-box {
  background: linear-gradient(180deg, #1E1E1E 0%, #141414 100%);
  width: 90%; max-width: 380px;
  border-radius: 24px;
  padding: 36px 28px 28px;
  text-align: center;
  animation: scaleIn 0.3s ease;
}
@keyframes scaleIn {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.door-alert-icon { font-size: 64px; margin-bottom: 16px; }
.door-alert-title {
  font-size: 22px; font-weight: 800;
  color: var(--danger); margin-bottom: 10px;
}
.door-alert-desc {
  font-size: 17px; color: var(--text-sub); line-height: 1.6;
  margin-bottom: 24px;
}
.door-alert-actions { display: flex; gap: 12px; }
.door-alert-actions button {
  flex: 1; padding: 16px; border-radius: 14px;
  font-size: 18px; font-weight: 700;
  border: none; cursor: pointer; font-family: inherit;
}
.door-alert-cancel { background: rgba(255,255,255,0.08); color: var(--text-sub); }
.door-alert-confirm { background: #FFF; color: #000; font-weight: 800; }
.door-alert-confirm:active { transform: scale(0.97); }

/* ═══ Coupon Modal ═══ */
.coupon-modal-list {
  max-height: 50vh; overflow-y: auto;
  padding: 4px 0;
}

/* ═══ Empty State ═══ */
.empty-state {
  text-align: center; padding: 48px 20px;
  color: var(--text-hint);
}
.empty-state-icon { font-size: 56px; margin-bottom: 12px; }
.empty-state-text { font-size: 18px; font-weight: 600; }

/* ═══ Transaction History (Home) ═══ */
.home-tx-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.home-tx-row:last-child { border-bottom: none; }
.home-tx-name { font-size: 16px; font-weight: 600; color: var(--text); }
.home-tx-date { font-size: 13px; color: var(--text-hint); margin-top: 2px; }
.home-tx-amount { font-size: 18px; font-weight: 800; }
.home-tx-amount.negative { color: var(--danger); }
.home-tx-amount.positive { color: var(--success); }

/* ═══ Coupon Modal Tabs ═══ */
.coupon-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 16px; }
.coupon-tab {
  flex: 1; padding: 14px 8px; text-align: center;
  font-size: 16px; font-weight: 600; color: var(--text-hint);
  border: none; background: none; cursor: pointer;
  font-family: inherit; position: relative; transition: color 0.2s;
}
.coupon-tab.active { color: var(--accent); }
.coupon-tab.active::after {
  content: ''; position: absolute; bottom: -2px; left: 20%; right: 20%;
  height: 3px; background: var(--accent); border-radius: 2px;
}
.coupon-tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--danger); color: white; font-size: 11px; font-weight: 700;
  width: 18px; height: 18px; border-radius: 50%; margin-left: 4px;
  vertical-align: top;
}
.redeem-row {
  display: flex; gap: 10px; padding: 16px 0 8px;
  border-top: 1px solid rgba(255,255,255,0.06); margin-top: 12px;
}
.redeem-input {
  flex: 1; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; font-size: 16px; font-family: inherit;
  outline: none; transition: border-color 0.2s;
  background: rgba(255,255,255,0.04); color: #FFF;
}
.redeem-input:focus { border-color: var(--accent); }
.redeem-input::placeholder { color: var(--text-hint); }
.redeem-btn {
  padding: 14px 24px; border-radius: 12px; border: none;
  background: var(--primary-dark); color: white;
  font-size: 16px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: transform 0.1s; white-space: nowrap;
}
.redeem-btn:active { transform: scale(0.95); }

/* ═══ Topup Modal ═══ */
.topup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.topup-card {
  background: var(--card); border: 1px solid var(--card-border);
  border-radius: var(--radius-sm); padding: 22px 16px;
  text-align: center; cursor: pointer; transition: all 0.15s;
  position: relative; overflow: hidden;
}
.topup-card:active { transform: scale(0.96); }
.topup-card.selected { border-color: var(--accent); background: rgba(200,168,78,0.12); }
.topup-card.popular::before {
  content: '熱門'; position: absolute; top: 8px; right: -22px;
  background: var(--danger); color: white; font-size: 11px; font-weight: 700;
  padding: 3px 28px; transform: rotate(45deg);
}
.topup-amount { font-size: 28px; font-weight: 900; color: #FFF; }
.topup-bonus {
  font-size: 14px; font-weight: 700; color: var(--accent);
  margin-top: 6px; min-height: 20px;
}
.topup-confirm-btn {
  width: 100%; padding: 18px; border-radius: 14px; border: none;
  font-size: 19px; font-weight: 700; cursor: pointer;
  font-family: inherit; margin-top: 20px; transition: all 0.15s;
}
.topup-confirm-btn.ready {
  background: linear-gradient(135deg, var(--accent) 0%, #D4A030 100%);
  color: var(--primary-dark);
}
.topup-confirm-btn.disabled {
  background: rgba(255,255,255,0.06); color: var(--text-hint); cursor: not-allowed;
}

/* ═══ Home Store Status ═══ */
.home-store-scroll {
  display: flex; gap: 12px; overflow-x: auto;
  padding: 4px 0 12px; scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.home-store-scroll::-webkit-scrollbar { display: none; }
.home-store-card {
  flex: 0 0 200px; background: var(--card);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-sm); padding: 18px 16px;
  box-shadow: var(--shadow); cursor: pointer;
  transition: transform 0.1s; border: 1px solid rgba(255,255,255,0.08);
}
.home-store-card:active { transform: scale(0.97); }
.home-store-name { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.home-store-status { display: flex; gap: 6px; flex-wrap: wrap; }
.home-store-dot {
  width: 10px; height: 10px; border-radius: 50%;
}

/* ═══ Expandable News ═══ */
.news-content {
  margin-top: 10px; padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 15px; color: var(--text-sub); line-height: 1.6;
  animation: expandIn 0.2s ease;
}
@keyframes expandIn {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 200px; }
}
.news-arrow {
  float: right; font-size: 14px; color: var(--text-hint);
  transition: transform 0.2s;
}
.news-arrow.open { transform: rotate(180deg); }

/* ═══ Two-step Door Alert ═══ */
.door-alert-step {
  font-size: 14px; color: var(--text-hint);
  margin-bottom: 12px; font-weight: 600;
}
.door-alert-icon-wrap {
  width: 100px; height: 100px; margin: 0 auto 16px;
  display: flex; align-items: center; justify-content: center;
}
.door-alert-icon-wrap svg {
  width: 80px; height: 80px;
}

/* ═══ Points Reminder Banner ═══ */
.points-banner {
  background: linear-gradient(135deg, #1A1500 0%, #2A2000 100%);
  border-radius: var(--radius-sm);
  padding: 14px 18px; margin-top: 12px;
  display: flex; align-items: center; gap: 10px;
  border: 1px solid #4A3A10;
}
.points-banner-icon { font-size: 24px; flex-shrink: 0; }
.points-banner-text { font-size: 14px; color: var(--accent); font-weight: 600; line-height: 1.4; }
.points-banner-btn {
  padding: 8px 16px; border-radius: 8px; border: none;
  background: var(--accent); color: var(--primary-dark);
  font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: inherit; white-space: nowrap; flex-shrink: 0;
}

/* ═══ Home Quick Actions Row ═══ */
.home-quick-row {
  display: flex; justify-content: space-around;
  background: var(--card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 18px 12px 14px; margin-bottom: 16px; box-shadow: var(--shadow);
}
.home-quick-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: none; border: none; cursor: pointer; font-family: inherit;
  padding: 4px 8px; transition: transform 0.1s;
  min-width: 64px;
}
.home-quick-item:active { transform: scale(0.93); }
.home-quick-icon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
}
.home-quick-label { font-size: 13px; font-weight: 600; color: var(--text-sub); white-space: nowrap; }

/* ═══ Wash Addons ═══ */
.addon-row {
  display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;
}
.addon-chip {
  padding: 10px 16px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.12); background: var(--card);
  font-size: 15px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all 0.15s;
  color: var(--text);
}
.addon-chip.active {
  border-color: #FFF; background: #FFF;
  color: #000; font-weight: 800;
}
.addon-chip:active { transform: scale(0.95); }

/* ═══ Dryer Extend Dropdown ═══ */
.extend-row {
  background: var(--card); border-radius: var(--radius-sm);
  padding: 16px 18px; margin-top: 12px;
  display: flex; align-items: center; justify-content: space-between;
}
.extend-label { font-size: 18px; font-weight: 600; color: var(--text); }
.extend-select {
  padding: 10px 16px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.12); font-size: 16px;
  font-weight: 600; font-family: inherit;
  background: var(--card); color: var(--text); cursor: pointer;
  appearance: auto;
}

/* ═══ History Filter Tabs ═══ */
.history-tabs { display: flex; gap: 0; margin-bottom: 16px; }
.history-tab {
  flex: 1; padding: 12px 4px; text-align: center;
  font-size: 15px; font-weight: 600; color: var(--text-hint);
  border: none; background: none; cursor: pointer;
  font-family: inherit; border-bottom: 2px solid transparent;
  transition: all 0.2s; white-space: nowrap;
}
.history-tab.active {
  color: var(--accent); border-bottom-color: var(--accent);
}

/* ═══ Topup Custom Amount ═══ */
.topup-custom {
  margin-top: 12px; display: flex; align-items: center; gap: 10px;
  background: #111; border-radius: 12px; padding: 14px 16px;
}
.topup-custom-input {
  flex: 1; padding: 12px 14px; border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; font-size: 20px; font-weight: 700;
  font-family: inherit; outline: none; text-align: center;
  transition: border-color 0.2s; background: rgba(255,255,255,0.04); color: #FFF;
}
.topup-custom-input:focus { border-color: var(--accent); }
.topup-custom-input::placeholder { color: var(--text-hint); font-weight: 500; }
.topup-custom-label { font-size: 18px; font-weight: 700; color: var(--text-sub); }

/* ═══ Payment Method Grid ═══ */
.pay-method-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px;
}
.pay-method-card {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.10); background: var(--card);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.pay-method-card.active {
  border-color: var(--accent); background: rgba(200,168,78,0.12);
}
.pay-method-card:active { transform: scale(0.97); }
.pay-method-icon { font-size: 20px; flex-shrink: 0; }
.pay-method-name { font-size: 15px; font-weight: 600; color: var(--text); }

/* ═══ Store Search ═══ */
.store-search {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10);
  border-radius: var(--radius-sm); padding: 12px 16px;
  margin-bottom: 14px;
}
.store-search-icon { font-size: 18px; color: var(--text-hint); flex-shrink: 0; }
.store-search-input {
  flex: 1; border: none; background: none; outline: none;
  font-size: 16px; font-family: inherit; color: var(--text);
}
.store-search-input::placeholder { color: var(--text-hint); }

/* ═══ Store Dropdown ═══ */
.store-dropdown {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 12px;
}
.store-dropdown-selected {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; cursor: pointer;
  transition: background 0.15s;
}
.store-dropdown-selected:active { background: rgba(255,255,255,0.06); }
.store-dropdown-name { font-size: 18px; font-weight: 700; color: var(--text); }
.store-dropdown-addr { font-size: 13px; color: var(--text-sub); margin-top: 3px; }
.store-dropdown-arrow {
  font-size: 14px; color: var(--text-hint);
  transition: transform 0.2s; flex-shrink: 0;
}
.store-dropdown-arrow.open { transform: rotate(180deg); }
.store-dropdown-list {
  border-top: 1px solid rgba(255,255,255,0.06);
  max-height: 300px; overflow-y: auto;
}
.store-dropdown-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.15s;
}
.store-dropdown-item:last-child { border-bottom: none; }
.store-dropdown-item:active { background: rgba(255,255,255,0.06); }
.store-dropdown-item.active { background: rgba(200,168,78,0.08); }
.store-dropdown-item .sdi-name { font-size: 16px; font-weight: 600; color: var(--text); }
.store-dropdown-item .sdi-addr { font-size: 12px; color: var(--text-sub); margin-top: 2px; }
.store-dropdown-item .sdi-check {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 14px;
}
.store-dropdown-item.active .sdi-check {
  background: var(--accent); border-color: var(--accent); color: #000;
}

/* ═══ Running Machine Banner ═══ */
.running-banner {
  background: linear-gradient(135deg, #1A0A00 0%, #2A1500 100%);
  border: 1px solid #4A2A00;
  border-radius: var(--radius-sm); padding: 16px 18px;
  margin-bottom: 16px; cursor: pointer;
  transition: transform 0.1s;
}
.running-banner:active { transform: scale(0.98); }
.running-banner-title {
  font-size: 16px; font-weight: 700; color: var(--running);
  margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
}
.running-banner-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0; font-size: 15px; color: var(--text-sub);
}
.running-banner-time {
  font-size: 18px; font-weight: 900; color: var(--running);
  font-variant-numeric: tabular-nums;
}

/* Settings Page */
.settings-overlay {
  position: fixed; inset: 0; z-index: 700;
  background: #000; overflow-y: auto;
  animation: fadeIn 0.2s ease;
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
.settings-header {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 20px;
  padding-top: calc(env(safe-area-inset-top, 12px) + 16px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.settings-back {
  background: none; border: none; cursor: pointer;
  color: #FFF; font-size: 22px; padding: 4px;
}
.settings-brand {
  font-size: 20px; font-weight: 700; color: #FFF;
  letter-spacing: 1px;
}
.settings-content {
  max-width: 520px; margin: 0 auto; padding: 20px;
}
.settings-card {
  background: #2A2A2A; border-radius: 16px;
  overflow: hidden; margin-bottom: 16px;
}
.settings-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.settings-row:last-child { border-bottom: none; }
.settings-row-left {
  display: flex; align-items: center; gap: 12px;
}
.settings-row-icon {
  width: 28px; height: 28px; display: flex;
  align-items: center; justify-content: center;
  opacity: 0.7;
}
.settings-row-label {
  font-size: 17px; font-weight: 600; color: rgba(255,255,255,0.85);
}
.settings-row-value {
  font-size: 15px; color: rgba(255,255,255,0.5);
  font-weight: 500;
}
.settings-row-arrow {
  font-size: 18px; color: rgba(255,255,255,0.3);
}
.toggle-switch {
  width: 52px; height: 30px; border-radius: 15px;
  background: #3A3A3A; position: relative;
  cursor: pointer; transition: background 0.3s;
  flex-shrink: 0;
}
.toggle-switch.on { background: var(--accent); }
.toggle-switch::after {
  content: ''; position: absolute;
  width: 26px; height: 26px; border-radius: 50%;
  background: #FFF; top: 2px; left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.toggle-switch.on::after { transform: translateX(22px); }

/* Not Available Modal */
.not-available-overlay {
  position: fixed; inset: 0; z-index: 800;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.2s ease;
}
.not-available-box {
  background: #FFF; width: 85%; max-width: 340px;
  border-radius: 24px; padding: 40px 28px 28px;
  text-align: center; animation: scaleIn 0.3s ease;
}
.not-available-icon {
  width: 80px; height: 80px; margin: 0 auto 20px;
}
.not-available-text {
  font-size: 20px; font-weight: 700; color: #333;
  margin-bottom: 24px;
}
.not-available-btn {
  width: 100%; padding: 16px; border-radius: 14px;
  border: none; background: #000; color: #FFF;
  font-size: 18px; font-weight: 700; cursor: pointer;
  font-family: inherit;
}
.not-available-btn:active { opacity: 0.8; }

/* NIKKO Header Icons */
.header-actions {
  display: flex; align-items: center; gap: 12px;
  margin-left: auto;
}
.header-icon-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s;
}
.header-icon-btn:active { transform: scale(0.9); background: rgba(255,255,255,0.15); }

/* NIKKO Greeting */
.nikko-greeting {
  padding: 8px 0 4px;
}
.nikko-greeting h1 {
  font-size: 32px; font-weight: 900; color: #FFF;
  line-height: 1.2; margin-bottom: 4px;
}
.nikko-greeting p {
  font-size: 17px; color: rgba(255,255,255,0.5);
  font-weight: 500;
}

/* Wallet card bottom links */
.wallet-bottom-links {
  display: flex; margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(0,0,0,0.1);
}
.wallet-bottom-link {
  flex: 1; display: flex; align-items: center;
  justify-content: center; gap: 8px;
  background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: 15px; font-weight: 700;
  color: rgba(0,0,0,0.7); padding: 4px 0;
}
.wallet-bottom-link:first-child {
  border-right: 1px solid rgba(0,0,0,0.12);
}
.wallet-bottom-link:active { opacity: 0.6; }
.wallet-link-arrow {
  font-size: 14px; letter-spacing: -2px;
}

/* ═══ Full-page overlay (NIKKO style) ═══ */
.fullpage-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: #000; z-index: 1100;
  display: flex; flex-direction: column;
  animation: slideUpPage 0.3s ease;
}
@keyframes slideUpPage {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.fullpage-header {
  background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
  padding: 16px 20px 0; flex-shrink: 0;
}
.fullpage-header-top {
  display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
}
.fullpage-back {
  background: none; border: none; cursor: pointer; padding: 4px;
  display: flex; align-items: center;
}
.fullpage-title {
  font-size: 18px; font-weight: 700; color: #FFF;
}
.fullpage-tabs {
  display: flex; gap: 0;
}
.fullpage-tab {
  flex: 1; padding: 12px 0; text-align: center;
  font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.4);
  border: none; background: none; cursor: pointer;
  font-family: inherit; border-bottom: 2px solid transparent;
  transition: all 0.2s; white-space: nowrap;
}
.fullpage-tab.active {
  color: #FFF; border-bottom-color: #4A90D9;
}
.fullpage-body {
  flex: 1; overflow-y: auto; padding: 20px;
  -webkit-overflow-scrolling: touch;
}

/* ═══ Ticket-style coupon cards ═══ */
.ticket-card {
  display: flex; border-radius: 14px; overflow: hidden;
  margin-bottom: 14px; position: relative;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}
.ticket-left {
  flex: 1; background: #1A1A1A; padding: 18px 16px;
  position: relative;
}
.ticket-right {
  width: 140px; background: #0D0D0D; padding: 18px 14px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative;
}
.ticket-left::after, .ticket-right::before {
  content: ''; position: absolute; top: 50%; right: -8px; transform: translateY(-50%);
  width: 16px; height: 16px; border-radius: 50%; background: #000;
}
.ticket-right::before {
  left: -8px; right: auto;
}
.ticket-divider {
  position: absolute; top: 15%; bottom: 15%; right: 0;
  border-right: 2px dashed rgba(255,255,255,0.12);
}
.ticket-badge {
  display: inline-block; background: #E74C3C; color: #FFF;
  font-size: 12px; font-weight: 700; padding: 3px 10px;
  border-radius: 4px; margin-bottom: 8px;
}
.ticket-name {
  font-size: 20px; font-weight: 900; color: #FFF; margin-bottom: 8px;
}
.ticket-desc {
  font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.7;
}
.ticket-price {
  font-size: 32px; font-weight: 900; color: #FFF;
}
.ticket-price-unit {
  font-size: 16px; font-weight: 700; color: var(--accent);
}
.ticket-original {
  font-size: 13px; color: rgba(255,255,255,0.35);
  text-decoration: line-through; margin-top: 2px;
}
.ticket-buy-btn {
  margin-top: 10px; padding: 8px 20px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.3); background: transparent;
  color: #FFF; font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.ticket-buy-btn:active { background: rgba(255,255,255,0.1); transform: scale(0.96); }

/* ═══ Coupon Payment Page ═══ */
.cpay-price-bar {
  background: #E8E8E8; border-radius: 12px; padding: 20px 22px;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
}
.cpay-price-label { font-size: 16px; font-weight: 600; color: #333; }
.cpay-price-value { font-size: 42px; font-weight: 900; color: #1A1A1A; }
.cpay-price-unit { font-size: 18px; font-weight: 700; color: #666; margin-left: 4px; }
.cpay-info-card {
  background: #FFF; border-radius: 14px; padding: 20px 22px; margin-bottom: 14px;
}
.cpay-info-row {
  display: flex; justify-content: space-between; padding: 10px 0;
  border-bottom: 1px solid #F0F0F0; font-size: 15px;
}
.cpay-info-row:last-child { border-bottom: none; }
.cpay-info-label { color: #666; font-weight: 500; }
.cpay-info-value { color: #1A1A1A; font-weight: 700; text-align: right; max-width: 60%; }
.cpay-detail-card {
  background: #FFF; border-radius: 14px; padding: 22px; margin-bottom: 14px;
}
.cpay-detail-title {
  font-size: 17px; font-weight: 700; color: #1A1A1A; margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
}
.cpay-detail-row {
  display: flex; gap: 12px; margin-bottom: 12px; font-size: 14px; line-height: 1.6;
}
.cpay-detail-label { color: #888; font-weight: 600; white-space: nowrap; min-width: 72px; }
.cpay-detail-value { color: #333; font-weight: 500; }
.cpay-warning-card {
  background: #FFF; border-radius: 14px; padding: 22px; margin-bottom: 14px;
}
.cpay-warning-title {
  font-size: 17px; font-weight: 700; color: #1A1A1A; margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px;
}
.cpay-warning-item {
  font-size: 14px; color: #444; line-height: 1.8; margin-bottom: 4px;
}
.cpay-bottom-bar {
  flex-shrink: 0; padding: 16px 20px;
  background: #000; border-top: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; gap: 14px;
}
.cpay-confirm-btn {
  flex: 1; padding: 16px; border-radius: 14px; border: none;
  background: #1A1A1A; color: #FFF; font-size: 17px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.cpay-confirm-btn:active { opacity: 0.8; }

/* Topup Full Page */
.topup-fullpage {
  position: fixed; inset: 0; z-index: 800;
  background: #000; display: flex; flex-direction: column;
  animation: fadeIn 0.2s ease;
}
.topup-fullpage-body {
  flex: 1; overflow-y: auto; padding: 0 20px 120px;
}
.topup-input-card {
  background: #FFF; border-radius: 16px; padding: 20px;
  margin-bottom: 24px;
}
.topup-input-title {
  font-size: 16px; font-weight: 600; color: #1A1A1A; margin-bottom: 16px;
}
.topup-input-row {
  display: flex; align-items: baseline; justify-content: center; gap: 8px;
  padding: 20px 0;
}
.topup-input-field {
  font-size: 36px; font-weight: 800; color: #C8A84E;
  background: none; border: none; outline: none;
  text-align: center; width: 100%;
  font-family: inherit;
  caret-color: #C8A84E;
}
.topup-input-field::placeholder {
  color: #D0D0D0; font-weight: 600;
}
.topup-input-unit {
  font-size: 18px; font-weight: 700; color: #888; flex-shrink: 0;
}
.topup-pay-title {
  font-size: 18px; font-weight: 700; color: #FFF; margin-bottom: 14px;
}
.topup-pay-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  margin-bottom: 20px;
}
.topup-pay-item {
  display: flex; align-items: center; gap: 12px;
  padding: 18px 16px; background: #1A1A1A;
  border-radius: 14px; border: 1.5px solid rgba(255,255,255,0.08);
  cursor: pointer; transition: all 0.15s;
}
.topup-pay-item.active {
  border-color: #C8A84E; background: rgba(200,168,78,0.08);
}
.topup-pay-item:active { transform: scale(0.97); }
.topup-pay-logo {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; color: #FFF; flex-shrink: 0;
}
.topup-pay-name {
  font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.85);
  flex: 1;
}
.topup-pay-radio {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.topup-pay-item.active .topup-pay-radio {
  border-color: #C8A84E;
}
.topup-pay-item.active .topup-pay-radio::after {
  content: ''; width: 12px; height: 12px; border-radius: 50%;
  background: #C8A84E;
}
.topup-bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 16px 20px; padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 16px);
  background: #000; border-top: 1px solid rgba(255,255,255,0.08);
  z-index: 810;
}
.topup-confirm-fullbtn {
  width: 100%; padding: 18px; border-radius: 14px; border: none;
  background: #1A1A1A; color: #FFF; font-size: 17px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.topup-confirm-fullbtn.ready {
  background: #C8A84E; color: #000;
}
.topup-confirm-fullbtn:active { opacity: 0.8; }

/* Points Info Full Page */
.points-info-fullpage {
  position: fixed; inset: 0; z-index: 800;
  background: #000; display: flex; flex-direction: column;
  animation: fadeIn 0.2s ease;
}
.points-info-body {
  flex: 1; overflow-y: auto; padding: 0 16px 40px;
}
.points-info-section-title {
  font-size: 16px; font-weight: 700; color: #FFF;
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 12px; padding: 0 4px;
}
.points-info-card {
  background: #FFF; border-radius: 16px; padding: 24px 20px;
  margin-bottom: 16px;
}
.points-info-card-title {
  font-size: 17px; font-weight: 700; color: #1A1A1A;
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px;
}
.points-info-item {
  font-size: 15px; color: #333; line-height: 2;
  padding-left: 4px;
}
.points-info-item strong {
  color: #1A1A1A; font-weight: 700;
}

/* Confirm dialog */
.confirm-dialog-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 1200;
  display: flex; align-items: center; justify-content: center;
  padding: 30px;
}
.confirm-dialog {
  background: #FFF; border-radius: 20px; padding: 40px 30px 30px;
  text-align: center; width: 100%; max-width: 340px;
}
.confirm-dialog-icon { font-size: 64px; margin-bottom: 16px; }
.confirm-dialog-text { font-size: 18px; font-weight: 700; color: #1A1A1A; margin-bottom: 28px; }
.confirm-dialog-actions { display: flex; gap: 12px; }
.confirm-dialog-btn {
  flex: 1; padding: 16px; border-radius: 12px; border: 1px solid #E0E0E0;
  font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.confirm-dialog-btn.primary {
  background: #1A1A1A; color: #FFF; border-color: #1A1A1A;
}
.confirm-dialog-btn:active { transform: scale(0.96); }

/* VIP banner */
.store-vip-banner {
  background: linear-gradient(135deg, rgba(100,130,180,0.4) 0%, rgba(80,100,150,0.3) 100%);
  border-radius: 16px; padding: 24px 20px; margin-bottom: 20px;
  position: relative; overflow: hidden;
}
.store-vip-title { font-size: 28px; font-weight: 900; color: #FFF; margin-bottom: 4px; }
.store-vip-sub { font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 12px; }
.store-vip-price { font-size: 36px; font-weight: 900; color: #FFF; }
.store-vip-original { font-size: 14px; color: rgba(255,255,255,0.4); text-decoration: line-through; margin-left: 8px; }
`;

// ──── Helper: Format seconds to MM:SS ────
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Clock SVG icon
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.6 }}>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Washer SVG icon
function ModeIcon({ mode, size = 28 }) {
  const s = size;
  if (mode === 'washonly') {
    return <svg width={s} height={s} viewBox="0 0 28 28"><circle cx="14" cy="14" r="10" fill="#5AC8FA"/></svg>;
  }
  if (mode === 'dryonly') {
    return <svg width={s} height={s} viewBox="0 0 28 28"><circle cx="14" cy="14" r="10" fill="#FF3B30"/></svg>;
  }
  // Washer drum icon for wash+dry modes
  const colors = {
    standard: ['#E8943A', '#4A9FE5'],
    small: ['#FFBF60', '#4A9FE5'],
    soft: ['#C7A640', '#4A9FE5'],
    strong: ['#FF6B2B', '#4A9FE5'],
  };
  const [top, bottom] = colors[mode] || ['#E8943A', '#4A9FE5'];
  return (
    <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
      <clipPath id={`m-${mode}-${s}`}><circle cx="14" cy="14" r="10" /></clipPath>
      <g clipPath={`url(#m-${mode}-${s})`}>
        <rect x="4" y="4" width="20" height="20" fill={top} />
        <path d="M4 16 C8 13, 12 18, 14 15 S20 13, 24 16 L24 24 L4 24 Z" fill={bottom} />
      </g>
      <circle cx="14" cy="14" r="10" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
    </svg>
  );
}
function WasherIcon({ running, size = 36 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="2" width="40" height="44" rx="5" stroke="#333" strokeWidth="2.5" fill="#FFF" />
      <circle cx="13" cy="10" r="2" fill="#333" />
      <circle cx="19" cy="10" r="2" fill="#333" />
      <rect x="27" y="7.5" width="10" height="5" rx="2.5" stroke="#333" strokeWidth="2" fill="none" />
      <circle cx="40" cy="10" r="1.8" fill="#333" />
      <line x1="4" y1="16" x2="44" y2="16" stroke="#333" strokeWidth="1.5" />
      <circle cx="24" cy="30" r="12" stroke="#333" strokeWidth="2.5" fill="none" />
      {/* Orange top half, Blue bottom half with wave split */}
      <clipPath id={`drum-${s}`}><circle cx="24" cy="30" r="11.5" /></clipPath>
      <g clipPath={`url(#drum-${s})`}>
        <rect x="12" y="18" width="24" height="24" fill="#E8943A" />
        <path d="M12 32 C16 28, 20 34, 24 30 S32 28, 36 32 L36 42 L12 42 Z" fill="#4A9FE5" />
      </g>
      {running && <circle cx="24" cy="30" r="6" fill="rgba(255,255,255,0.3)">
        <animateTransform attributeName="transform" type="rotate" from="0 24 30" to="360 24 30" dur="2s" repeatCount="indefinite" />
      </circle>}
    </svg>
  );
}
function StoreWasherIcon({ size = 48 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 56 56" fill="none">
      <rect x="4" y="4" width="40" height="48" rx="4" stroke="#333" strokeWidth="3" fill="#FFF" />
      <circle cx="14" cy="14" r="3.5" stroke="#333" strokeWidth="2.5" fill="none" />
      <circle cx="24" cy="14" r="3.5" stroke="#333" strokeWidth="2.5" fill="none" />
      <line x1="31" y1="11" x2="38" y2="11" stroke="#333" strokeWidth="2" />
      <line x1="31" y1="14" x2="38" y2="14" stroke="#333" strokeWidth="2" />
      <line x1="31" y1="17" x2="38" y2="17" stroke="#333" strokeWidth="2" />
      <line x1="4" y1="22" x2="44" y2="22" stroke="#333" strokeWidth="2" />
      <circle cx="24" cy="36" r="11" stroke="#333" strokeWidth="3" fill="none" />
      <circle cx="24" cy="36" r="7" stroke="#333" strokeWidth="2" fill="none" />
      <path d="M20 33 Q24 30 28 33" stroke="#333" strokeWidth="1.5" fill="none" />
      {/* Small towel hanging out */}
      <rect x="40" y="38" width="12" height="10" rx="2" stroke="#333" strokeWidth="2.5" fill="#FFF" />
      <circle cx="7" cy="48" r="1.2" fill="#333" />
      <circle cx="11" cy="48" r="1.2" fill="#333" />
    </svg>
  );
}
function VendingIcon({ size = 36 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="2" width="36" height="44" rx="4" stroke="#333" strokeWidth="2.5" fill="#FFF" />
      <line x1="6" y1="12" x2="42" y2="12" stroke="#333" strokeWidth="1.5" />
      <rect x="12" y="16" width="10" height="8" rx="2" stroke="#333" strokeWidth="1.5" fill="none" />
      <rect x="26" y="16" width="10" height="8" rx="2" stroke="#333" strokeWidth="1.5" fill="none" />
      <rect x="12" y="28" width="10" height="8" rx="2" stroke="#333" strokeWidth="1.5" fill="none" />
      <rect x="26" y="28" width="10" height="8" rx="2" stroke="#333" strokeWidth="1.5" fill="none" />
      <circle cx="14" cy="7" r="2" fill="#333" />
      <circle cx="20" cy="7" r="2" fill="#333" />
      <line x1="28" y1="5" x2="36" y2="5" stroke="#333" strokeWidth="2" />
      <line x1="28" y1="9" x2="36" y2="9" stroke="#333" strokeWidth="2" />
      <rect x="14" y="40" width="20" height="4" rx="1" stroke="#333" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function DryerIcon({ size = 36 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="2" width="40" height="44" rx="5" stroke="#333" strokeWidth="2.5" fill="#FFF" />
      <circle cx="13" cy="10" r="2" fill="#333" />
      <circle cx="19" cy="10" r="2" fill="#333" />
      <rect x="27" y="7.5" width="10" height="5" rx="2.5" stroke="#333" strokeWidth="2" fill="none" />
      <circle cx="40" cy="10" r="1.8" fill="#333" />
      <line x1="4" y1="16" x2="44" y2="16" stroke="#333" strokeWidth="1.5" />
      {/* Filled orange circle with white steam waves */}
      <circle cx="24" cy="30" r="12" stroke="#333" strokeWidth="2.5" fill="#E8943A" />
      <path d="M17 25c1.5-2.5 3 0 4.5-2.5s3 0 4.5-2.5 3 0 4.5-2.5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M17 31c1.5-2.5 3 0 4.5-2.5s3 0 4.5-2.5 3 0 4.5-2.5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M17 37c1.5-2.5 3 0 4.5-2.5s3 0 4.5-2.5 3 0 4.5-2.5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Tab Bar Icons
function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 26 26" fill="none" stroke={active ? '#C8A84E' : '#666666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L13 3l10 7.5V22a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" />
      <path d="M10 23V14h6v9" />
    </svg>
  );
}
function WashTabIcon({ active }) {
  return (
    <svg viewBox="0 0 26 26" fill="none" stroke={active ? '#C8A84E' : '#666666'} strokeWidth="2">
      <rect x="3" y="2" width="20" height="22" rx="3" />
      <circle cx="13" cy="14" r="6" />
      {active && <circle cx="13" cy="14" r="3" fill="#3A3A8C" opacity="0.2" />}
      <circle cx="7" cy="5.5" r="1" fill={active ? '#C8A84E' : '#666666'} />
      <circle cx="10" cy="5.5" r="1" fill={active ? '#C8A84E' : '#666666'} />
    </svg>
  );
}
function HistoryIcon({ active }) {
  return (
    <svg viewBox="0 0 26 26" fill="none" stroke={active ? '#C8A84E' : '#666666'} strokeWidth="2" strokeLinecap="round">
      <circle cx="13" cy="13" r="10" />
      <path d="M13 7v6l4 2" />
    </svg>
  );
}
function ProfileIcon({ active }) {
  return (
    <svg viewBox="0 0 26 26" fill="none" stroke={active ? '#C8A84E' : '#666666'} strokeWidth="2" strokeLinecap="round">
      <circle cx="13" cy="9" r="4" />
      <path d="M5 22c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}


// ─── NIKKO-style SVG Icons ───
function IconWasher({ size = 32, color = '#C8A84E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="30" height="34" rx="4" />
      <circle cx="20" cy="22" r="9" />
      <circle cx="20" cy="22" r="4" strokeDasharray="3 2" />
      <circle cx="11" cy="9" r="1.5" fill={color} stroke="none" />
      <circle cx="16" cy="9" r="1.5" fill={color} stroke="none" />
      <rect x="24" y="7" width="7" height="4" rx="2" />
    </svg>
  );
}
function IconCoupon({ size = 32, color = '#C8A84E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M5 12h30v4a4 4 0 010 8v4H5v-4a4 4 0 010-8V12z" />
      <line x1="15" y1="12" x2="15" y2="28" strokeDasharray="3 2" />
      <circle cx="25" cy="18" r="1.5" fill={color} stroke="none" />
      <circle cx="25" cy="22" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}
function IconHistory({ size = 32, color = '#C8A84E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="20" cy="20" r="15" />
      <path d="M20 10v10l6 4" />
      <path d="M8 8l-3-3M8 8l3-3" strokeWidth="1.5" />
    </svg>
  );
}
function IconTopup({ size = 32, color = '#C8A84E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="20" cy="22" r="12" />
      <path d="M20 16v12M14 22h12" strokeWidth="2.5" />
      <path d="M16 10h8" strokeWidth="1.5" />
      <path d="M18 6h4" strokeWidth="1.5" />
    </svg>
  );
}
function IconStore({ size = 32, color = '#C8A84E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18v16h28V18" />
      <path d="M3 18l4-12h26l4 12" />
      <path d="M3 18c0 2.5 2 4 4 4s4-1.5 4-4c0 2.5 2 4 4.5 4s4.5-1.5 4.5-4c0 2.5 2 4 4.5 4s4.5-1.5 4.5-4c0 2.5 2 4 4 4s4-1.5 4-4" />
      <rect x="15" y="26" width="10" height="8" />
    </svg>
  );
}
function IconShirt({ size = 32, color = '#C8A84E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 6l-10 6 4 4 6-3v21h12V13l6 3 4-4-10-6" />
      <path d="M14 6c0 3 2.5 5 6 5s6-2 6-5" />
    </svg>
  );
}
function IconNews({ size = 32, color = '#C8A84E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <rect x="5" y="8" width="30" height="24" rx="3" />
      <line x1="10" y1="15" x2="30" y2="15" />
      <line x1="10" y1="21" x2="25" y2="21" />
      <line x1="10" y1="27" x2="20" y2="27" />
    </svg>
  );
}
function IconMachine({ size = 32, color = '#C8A84E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <rect x="5" y="3" width="30" height="34" rx="4" />
      <circle cx="20" cy="22" r="9" />
      <path d="M15 19c2-2 6-2 8 0" strokeWidth="1.5" />
      <path d="M14 24c3 3 9 3 12 0" strokeWidth="1.5" />
      <circle cx="11" cy="9" r="1.5" fill={color} stroke="none" />
      <circle cx="16" cy="9" r="1.5" fill={color} stroke="none" />
      <rect x="24" y="7" width="7" height="4" rx="2" />
    </svg>
  );
}
function IconDryer({ size = 32, color = '#FF9500' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <rect x="5" y="3" width="30" height="34" rx="4" />
      <circle cx="20" cy="22" r="9" />
      <path d="M16 19s2 3 4 0 4 3 4 3" strokeWidth="2" />
      <circle cx="11" cy="9" r="1.5" fill={color} stroke="none" />
      <circle cx="16" cy="9" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

// ═══════════════════════════════════════
//  Main App Component
// ═══════════════════════════════════════
export default function App() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [user, setUser] = useState(null);

  // Tab navigation
  const [tab, setTab] = useState('home');

  // Wash flow screens
  const [screen, setScreen] = useState('stores');
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [machineStates, setMachineStates] = useState({});
  const [toast, setToast] = useState(null);
  const [payResult, setPayResult] = useState(null);
  const [dryTemp, setDryTemp] = useState('high');
  const timerIntervalRef = useRef(null);

  // New features
  const [points, setPoints] = useState(0);
  const [payMethod, setPayMethod] = useState('linepay');
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponTab, setCouponTab] = useState('coupon');
  const [redeemCode, setRedeemCode] = useState('');
  const [showDoorAlert, setShowDoorAlert] = useState(false);
  const [doorStep, setDoorStep] = useState(1);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedTopup, setSelectedTopup] = useState(null);
  const [customTopupAmount, setCustomTopupAmount] = useState('');
  const [topupPayMethod, setTopupPayMethod] = useState('linepay');
  const [expandedNews, setExpandedNews] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [addons, setAddons] = useState({ detergent: true, softener: true, degreaser: false, antibacterial: false });
  const [showSettings, setShowSettings] = useState(false);
  const [notifCoupon, setNotifCoupon] = useState(false);
  const [notifLaundry, setNotifLaundry] = useState(false);
  const [showNotAvailable, setShowNotAvailable] = useState(false);
  const [showNewsPage, setShowNewsPage] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [machineModalTab, setMachineModalTab] = useState('washer');
  const [pointsHidden, setPointsHidden] = useState(false);
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const [showTransactionPage, setShowTransactionPage] = useState(false);
  const [txFilter, setTxFilter] = useState('all');
  const [showMyCouponsPage, setShowMyCouponsPage] = useState(false);
  const [myCouponTab, setMyCouponTab] = useState('active');
  const [showCouponStore, setShowCouponStore] = useState(false);
  const [couponStoreTab, setCouponStoreTab] = useState('gift');
  const [selectedStoreCoupon, setSelectedStoreCoupon] = useState(null);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [dryExtend, setDryExtend] = useState(0);
  const [usageHistory, setUsageHistory] = useState([
    { id: 'h1', date: '2026-03-20 14:30', store: '悠洗自助洗衣', machine: '洗脫烘2號', mode: '洗脫烘-標準', amount: 160, status: 'completed' },
    { id: 'h2', date: '2026-03-18 09:15', store: '熊愛洗自助洗衣', machine: '洗脫烘1號', mode: '只要洗衣', amount: 80, status: 'completed' },
    { id: 'h3', date: '2026-03-15 18:00', store: '上好洗自助洗衣', machine: '洗脫烘4號', mode: '洗脫烘-強勁', amount: 180, status: 'completed' },
  ]);
  const [transactions, setTransactions] = useState([
    { id: 't1', name: '儲值', date: '2026-03-20', amount: 500, type: 'topup' },
    { id: 't2', name: '悠洗自助洗衣', date: '2026-03-20', amount: -160, type: 'payment' },
    { id: 't3', name: '熊愛洗自助洗衣', date: '2026-03-18', amount: -80, type: 'payment' },
  ]);

  // ─── Inject CSS ───
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ─── LIFF Init ───
  useEffect(() => {
    const initLiff = async () => {
      try {
        if (window.liff) {
          // Add timeout to prevent hanging in non-LINE environments
          const liffInitPromise = window.liff.init({ liffId: LIFF_ID });
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('LIFF init timeout')), 3000));
          await Promise.race([liffInitPromise, timeoutPromise]);
          if (window.liff.isInClient() || window.liff.isLoggedIn()) {
            if (!window.liff.isLoggedIn()) { window.liff.login(); return; }
            const profile = await window.liff.getProfile();
            setUser({
              name: profile.displayName,
              picture: profile.pictureUrl,
              userId: profile.userId,
            });
          } else {
            // Not in LINE app — use dev mode
            setUser({ name: '柏宏', picture: '', userId: 'dev-user' });
          }
        } else {
          setUser({ name: '柏宏', picture: '', userId: 'dev-user' });
        }
      } catch (err) {
        console.error('LIFF init error:', err);
        setUser({ name: '柏宏', picture: '', userId: 'dev-user' });
      }
      setPoints(260);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setLoading(false), 500);
      }, 1800);
    };
    initLiff();
  }, []);

  // ─── Payment callback ───
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paymentResult') === 'success') {
      const transactionId = params.get('transactionId');
      const orderId = params.get('orderId');
      if (transactionId && orderId) confirmPayment(transactionId, orderId);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('paymentResult') === 'cancel') {
      setPayResult('cancel');
      setScreen('result');
      setTab('wash');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // ─── Fetch machine states ───
  const fetchMachineStates = useCallback(async (storeId) => {
    try {
      const res = await fetch(`${API}/api/machines/${storeId}`);
      if (res.ok) {
        const data = await res.json();
        const states = {};
        data.forEach(m => {
          states[m.machine_id] = {
            status: m.status || 'idle',
            remaining: m.remaining_seconds || 0,
            mode: m.current_mode || null,
          };
        });
        setMachineStates(states);
      } else {
        setDefaultStates(storeId);
      }
    } catch {
      setDefaultStates(storeId);
    }
  }, []);

  const setDefaultStates = (storeId) => {
    const states = {};
    for (let i = 1; i <= 6; i++) {
      states[`${storeId}-m${i}`] = { status: 'idle', remaining: 0, mode: null };
    }
    setMachineStates(states);
  };

  // ─── Timer countdown ───
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const hasRunning = Object.values(machineStates).some(s => s.status === 'running' && s.remaining > 0);
    if (!hasRunning) return;
    timerIntervalRef.current = setInterval(() => {
      setMachineStates(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(key => {
          if (next[key].status === 'running' && next[key].remaining > 0) {
            changed = true;
            const r = next[key].remaining - 1;
            next[key] = { ...next[key], remaining: r, status: r <= 0 ? 'idle' : 'running', mode: r <= 0 ? null : next[key].mode };
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timerIntervalRef.current);
  }, [Object.values(machineStates).some(s => s.status === 'running' && s.remaining > 0)]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const switchTab = (t) => { setTab(t); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const [storeSearch, setStoreSearch] = useState('');
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(true);

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setSelectedMachine(null);
    setSelectedMode(null);
    setSelectedCoupon(null);
    fetchMachineStates(store.id);
    setScreen('machines');
  };

  const handleMachineSelect = (machineId) => {
    const state = machineStates[machineId];
    if (state?.status === 'running') { setSelectedMachine(machineId); setScreen('running'); return; }
    if (state?.status === 'offline') { showToast('此機器暫時無法使用'); return; }
    setSelectedMachine(machineId);
    setSelectedMode(null);
    setSelectedCoupon(null);
    setScreen('modes');
  };

  const getFinalPrice = () => {
    if (!selectedMode) return 0;
    const extendCost = dryExtend === 10 ? 20 : dryExtend === 20 ? 35 : dryExtend === 30 ? 50 : 0;
    let price = selectedMode.price + extendCost;
    if (selectedCoupon) {
      if (selectedCoupon.type === 'fixed') {
        price = Math.max(0, price - selectedCoupon.discount);
      } else if (selectedCoupon.type === 'percent') {
        price = Math.round(price * (100 - selectedCoupon.discount) / 100);
      }
    }
    return price;
  };

  const handlePay = () => {
    if (!selectedMode) { showToast('請先選擇洗衣模式'); return; }
    setDoorStep(1);
    setShowDoorAlert(true);
  };

  const handleDoorStep = () => {
    if (doorStep === 1) {
      setDoorStep(2);
    } else {
      setShowDoorAlert(false);
      setScreen('confirm');
    }
  };

  const startPayment = async () => {
    const finalPrice = getFinalPrice();

    if (payMethod === 'wallet') {
      if (points < finalPrice) {
        showToast('點數不足，請先儲值或改用 LINE Pay');
        return;
      }
      setPoints(prev => prev - finalPrice);
      const newHistory = {
        id: `h${Date.now()}`,
        date: new Date().toLocaleString('zh-TW'),
        store: selectedStore?.name,
        machine: `洗脫烘${selectedMachine?.split('-m')[1]}號`,
        mode: selectedMode?.name,
        amount: finalPrice,
        status: 'completed',
      };
      setUsageHistory(prev => [newHistory, ...prev]);
      setTransactions(prev => [{ id: `t${Date.now()}`, name: selectedStore?.name, date: new Date().toISOString().split('T')[0], amount: -finalPrice, type: 'payment' }, ...prev]);
      if (selectedCoupon) {
        setCoupons(prev => prev.map(c => c.id === selectedCoupon.id ? { ...c, used: true } : c));
        setSelectedCoupon(null);
      }
      if (selectedMachine) {
        setMachineStates(prev => ({
          ...prev,
          [selectedMachine]: { status: 'running', remaining: (selectedMode?.minutes || 65) * 60, mode: selectedMode?.id },
        }));
      }
      setPayResult('success');
      setScreen('result');
      return;
    }

    setScreen('paying');
    try {
      const machineNum = selectedMachine?.split('-m')[1] || '1';
      const res = await fetch(`${API}/api/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.userId,
          storeId: selectedStore?.id,
          machineId: selectedMachine,
          machineNum,
          mode: selectedMode?.id,
          amount: finalPrice,
          minutes: selectedMode?.minutes,
          dryTemp,
          couponId: selectedCoupon?.id || null,
        }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        showToast('付款連結建立失敗');
        setScreen('confirm');
      }
    } catch {
      showToast('付款請求失敗，請重試');
      setScreen('confirm');
    }
  };

  const confirmPayment = async (transactionId, orderId) => {
    try {
      const res = await fetch(`${API}/api/payment/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setPayResult('success');
        setScreen('result');
        setTab('wash');
        if (data.storeId && data.machineId) {
          setMachineStates(prev => ({
            ...prev,
            [data.machineId]: { status: 'running', remaining: (data.minutes || 65) * 60, mode: data.mode },
          }));
        }
        const newHistory = {
          id: `h${Date.now()}`,
          date: new Date().toLocaleString('zh-TW'),
          store: data.storeName || '洗衣店',
          machine: `洗脫烘${data.machineNum || '1'}號`,
          mode: MODES.find(m => m.id === data.mode)?.name || '洗脫烘-標準',
          amount: data.amount || 160,
          status: 'completed',
        };
        setUsageHistory(prev => [newHistory, ...prev]);
        if (selectedCoupon) {
          setCoupons(prev => prev.map(c => c.id === selectedCoupon.id ? { ...c, used: true } : c));
          setSelectedCoupon(null);
        }
      } else { setPayResult('cancel'); setScreen('result'); }
    } catch { setPayResult('cancel'); setScreen('result'); }
  };

  const goBack = () => {
    if (screen === 'machines') { setScreen('stores'); setSelectedStore(null); }
    else if (screen === 'modes') { setScreen('machines'); setSelectedMachine(null); setSelectedCoupon(null); }
    else if (screen === 'confirm') { setScreen('modes'); }
    else if (screen === 'running') { setScreen('machines'); setSelectedMachine(null); }
    else if (screen === 'result') { setScreen('stores'); setSelectedStore(null); setSelectedMachine(null); setSelectedMode(null); setSelectedCoupon(null); }
  };

  const getMachineState = (machineId) => machineStates[machineId] || { status: 'idle', remaining: 0 };

  const renderTimerRing = () => {
    const state = getMachineState(selectedMachine);
    const modeInfo = MODES.find(m => m.id === state.mode);
    const totalSec = (modeInfo?.minutes || 65) * 60;
    const remaining = state.remaining || 0;
    const progress = totalSec > 0 ? remaining / totalSec : 0;
    const r = 80;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - progress);
    return (
      <div className="timer-ring">
        <svg viewBox="0 0 200 200">
          <circle className="timer-ring-bg" cx="100" cy="100" r={r} />
          <circle className="timer-ring-progress" cx="100" cy="100" r={r}
            strokeDasharray={c} strokeDashoffset={offset} />
        </svg>
        <div className="timer-ring-text">
          <div className="timer-ring-time">{formatTime(remaining)}</div>
          <div className="timer-ring-label">剩餘時間</div>
        </div>
      </div>
    );
  };

  const getApplicableCoupons = () => {
    if (!selectedMode) return [];
    return coupons.filter(c => {
      if (c.used) return false;
      if (c.minSpend > selectedMode.price) return false;
      if (c.modeOnly && c.modeOnly !== selectedMode.id) return false;
      if (new Date(c.expiry) < new Date()) return false;
      return true;
    });
  };

  const handleTopup = () => {
    setSelectedTopup(null);
    setShowTopupModal(true);
  };

  const confirmTopup = () => {
    let amount = 0;
    let bonus = 0;
    if (selectedTopup) {
      amount = selectedTopup.amount;
      bonus = selectedTopup.bonus;
    } else if (customTopupAmount) {
      amount = parseInt(customTopupAmount) || 0;
      if (amount < 50) { showToast('最低儲值金額為 $50'); return; }
    } else {
      showToast('請選擇儲值方案或輸入金額'); return;
    }
    const total = amount + bonus;
    setPoints(prev => prev + total);
    setTransactions(prev => [{ id: `t${Date.now()}`, name: '儲值', date: new Date().toISOString().split('T')[0], amount: total, type: 'topup' }, ...prev]);
    setShowTopupModal(false);
    setCustomTopupAmount('');
    showToast(`儲值成功！+${total} 點${bonus > 0 ? `（含贈送 ${bonus} 點）` : ''}`);
  };

  const handleRedeemCode = () => {
    if (!redeemCode.trim()) { showToast('請輸入兌換碼'); return; }
    const newCoupon = {
      id: `c${Date.now()}`,
      name: `兌換券-${redeemCode.toUpperCase()}`,
      discount: 30,
      type: 'fixed',
      minSpend: 0,
      expiry: '2026-12-31',
      used: false,
      category: 'coupon',
    };
    setCoupons(prev => [newCoupon, ...prev]);
    setRedeemCode('');
    showToast('兌換成功！已獲得新優惠券');
  };

  // ═══ LOADING ═══
  if (loading) {
    return (
      <div className={`loading-screen ${fadeOut ? 'loading-fade-out' : ''}`}>
        <div className="loading-logo-wrap">
          <img src="/ypure-logo.png" alt="YPURE" className="loading-logo" />
        </div>
        <div className="loading-text">雲管家</div>
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    );
  }

  // ═══ MAIN RENDER ═══
  return (
    <>
      {toast && <div className="toast">{toast}</div>}

      <div className={`app-shell ${tab === 'wash' && screen === 'modes' ? 'has-pay-bar' : ''}`}>
        {/* ═══ Dark Header ═══ */}
        <div className="dark-header">
          <div className="dark-header-inner">
            <div className="dark-header-top">
              <div className="dark-header-logo-wrap">
                <img src="/ypure-logo.png" alt="YPURE" className="dark-header-logo" onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <div className="dark-header-brand">雲管家</div>
              <div className="header-actions">
                <button className="header-icon-btn" onClick={() => window.open('https://line.me/R/ti/p/@ypure', '_blank')} title="LINE 官方帳號">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#06C755">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </button>
                <button className="header-icon-btn" onClick={() => setShowSettings(true)} title="設定">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                </button>
              </div>
            </div>
            {user && (
              <div className="nikko-greeting">
                <h1>Hello，{user.name}！</h1>
                <p>比乾淨多一點的，是專屬感。</p>
              </div>
            )}
          </div>
        </div>

        <div className="content-area">

          {/* ══════════════════════════════════════
              TAB: 首頁 (Home)
              ══════════════════════════════════════ */}
          {tab === 'home' && (
            <>
              <div style={{ marginTop: 20 }}>
                <div className="home-wallet">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div className="home-wallet-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0 }}>
                      點數餘額
                      <button onClick={() => setPointsHidden(!pointsHidden)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                        {pointsHidden ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    <button onClick={() => setShowPointsInfo(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div className="home-wallet-points" style={{ marginBottom: 0 }}>
                      {pointsHidden ? (
                        <span style={{ fontSize: 36, letterSpacing: 6 }}>✱ ✱ ✱ ✱</span>
                      ) : (
                        <>{points}<span>點</span></>
                      )}
                    </div>
                    <button className="home-wallet-btn topup" onClick={handleTopup} style={{ flex: 'none', padding: '10px 24px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
                      儲值
                    </button>
                  </div>
                  <div className="wallet-bottom-links">
                    <button className="wallet-bottom-link" onClick={() => { setTxFilter('all'); setShowTransactionPage(true); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2 2"/></svg>
                      交易記錄
                      <span className="wallet-link-arrow">···→</span>
                    </button>
                    <button className="wallet-bottom-link" onClick={() => { setMyCouponTab('active'); setShowMyCouponsPage(true); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
                      我的優惠
                      <span className="wallet-link-arrow">···→</span>
                    </button>
                  </div>
                </div>
                {points < 100 && (
                  <div className="points-banner">
                    <div className="points-banner-icon">💡</div>
                    <div className="points-banner-text">點數不足 100 點，建議先儲值再使用錢包付款</div>
                    <button className="points-banner-btn" onClick={handleTopup}>儲值</button>
                  </div>
                )}
              </div>

              {/* Running machines banner */}
              {(() => {
                const runningMachines = Object.entries(machineStates)
                  .filter(([, v]) => v.status === 'running' && v.remaining > 0)
                  .map(([k, v]) => {
                    const store = STORES.find(s => k.startsWith(s.id + '-'));
                    const num = k.split('-m')[1];
                    return { id: k, store: store?.name || '', num, remaining: v.remaining };
                  });
                if (runningMachines.length === 0) return null;
                return (
                  <div className="running-banner" onClick={() => switchTab('wash')}>
                    <div className="running-banner-title"><IconDryer size={20} color="#FF6B2B" /> 運轉中的機器 ({runningMachines.length})</div>
                    {runningMachines.map(m => (
                      <div key={m.id} className="running-banner-item">
                        <span>{m.store} — {m.num}號機</span>
                        <span className="running-banner-time">{formatTime(m.remaining)}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ── 功能總覽 ── */}
              <div className="section-title-row">
                <span className="section-title-bar"></span>
                <span className="section-title-text">功能總覽</span>
              </div>

              <div className="home-grid">
                <div className="home-grid-card home-grid-card-large" onClick={() => { setShowCouponStore(true); }} style={{ gridRow: 'span 2' }}>
                  <div className="home-grid-icon"><IconCoupon size={48} color="#888" /></div>
                  <div className="home-grid-label">優惠中心</div>
                  <div className="home-grid-sub">洗衣天天享折扣</div>
                </div>
                <div className="home-grid-card home-grid-card-horizontal" onClick={() => switchTab('wash')}>
                  <div>
                    <div className="home-grid-label">機器狀態</div>
                    <div className="home-grid-sub">查詢狀態最即時</div>
                  </div>
                  <IconMachine size={28} color="#888" />
                </div>
                <div className="home-grid-card home-grid-card-horizontal" onClick={() => setShowNewsPage(true)}>
                  <div>
                    <div className="home-grid-label">最新消息</div>
                    <div className="home-grid-sub">活動訊息不漏接</div>
                  </div>
                  <IconNews size={28} color="#888" />
                </div>
              </div>

              <div className="home-quick-row">
                <button className="home-quick-item" onClick={() => switchTab('wash')}>
                  <div className="home-quick-icon"><IconWasher size={24} color="#AAA" /></div>
                  <div className="home-quick-label">店內消費</div>
                </button>
                <button className="home-quick-item" onClick={handleTopup}>
                  <div className="home-quick-icon"><IconTopup size={24} color="#AAA" /></div>
                  <div className="home-quick-label">線上儲值</div>
                </button>
                <button className="home-quick-item" onClick={() => switchTab('wash')}>
                  <div className="home-quick-icon"><IconStore size={24} color="#AAA" /></div>
                  <div className="home-quick-label">日光門市</div>
                </button>
                <button className="home-quick-item" onClick={() => setShowNotAvailable(true)}>
                  <div className="home-quick-icon"><IconShirt size={24} color="#AAA" /></div>
                  <div className="home-quick-label">代洗烘折</div>
                </button>
              </div>

              <div className="section-divider">
                <span className="section-divider-text">門市機器狀態</span>
              </div>
              <div className="home-store-scroll">
                {STORES.map(store => {
                  const storeStates = Object.entries(machineStates)
                    .filter(([k]) => k.startsWith(store.id + '-'))
                    .map(([, v]) => v);
                  const idleCount = storeStates.filter(s => s.status === 'idle').length;
                  const runCount = storeStates.filter(s => s.status === 'running').length;
                  return (
                    <div key={store.id} className="home-store-card" onClick={() => { switchTab('wash'); handleStoreSelect(store); }}>
                      <div className="home-store-name">{store.name}</div>
                      <div className="home-store-status">
                        {Array.from({ length: store.machines }, (_, i) => {
                          const mid = `${store.id}-m${i + 1}`;
                          const ms = machineStates[mid];
                          const color = ms?.status === 'running' ? 'var(--running)' : ms?.status === 'offline' ? '#D8D8DC' : 'var(--success)';
                          return <div key={i} className="home-store-dot" style={{ background: color }} />;
                        })}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 8 }}>
                        {storeStates.length > 0 ? `${idleCount} 台閒置 / ${runCount} 台運轉` : `${store.machines} 台可用`}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="section-divider">
                <span className="section-divider-text">最近交易</span>
              </div>
              <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-sm)', padding: '4px 20px', boxShadow: 'var(--shadow)' }}>
                {transactions.slice(0, 3).map(tx => (
                  <div key={tx.id} className="home-tx-row">
                    <div>
                      <div className="home-tx-name">{tx.type === 'topup' ? '$ ' : ''}{tx.name}</div>
                      <div className="home-tx-date">{tx.date}</div>
                    </div>
                    <div className={`home-tx-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount}
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-hint)', fontSize: 16 }}>
                    暫無交易紀錄
                  </div>
                )}
              </div>

              <div className="section-divider">
                <span className="section-divider-text">最新消息</span>
              </div>
              {NEWS_ITEMS.map(news => (
                <div key={news.id} className="news-card" onClick={() => setExpandedNews(expandedNews === news.id ? null : news.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="news-title">{news.title}</div>
                      <div className="news-date">{news.date}</div>
                    </div>
                    <span className={`news-arrow ${expandedNews === news.id ? 'open' : ''}`}>▼</span>
                  </div>
                  {expandedNews === news.id && (
                    <div className="news-content">{news.content}</div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ══════════════════════════════════════
              TAB: 洗衣 (Wash)
              ══════════════════════════════════════ */}
          {tab === 'wash' && (
            <>
              {screen === 'stores' && (
                <>
                  <div className="sec-title">選擇店家</div>
                  <div className="store-dropdown">
                    <div className="store-dropdown-selected" onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <IconWasher size={32} color="#888" />
                          <div>
                            <div className="store-dropdown-name">雲管家自助洗衣</div>
                            <div className="store-dropdown-addr">請選擇門市</div>
                          </div>
                        </div>
                      </div>
                      <span className={`store-dropdown-arrow ${storeDropdownOpen ? 'open' : ''}`}>▼</span>
                    </div>
                    {storeDropdownOpen && (
                      <div className="store-dropdown-list">
                        {STORES.map(store => (
                          <div key={store.id}
                            className={`store-dropdown-item ${selectedStore?.id === store.id ? 'active' : ''}`}
                            onClick={() => handleStoreSelect(store)}>
                            <div>
                              <div className="sdi-name">{store.name}</div>
                              <div className="sdi-addr" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="6" r="3" stroke="#C8A84E" strokeWidth="1.5"/><path d="M7 1C4.2 1 2 3.5 2 6.2 2 9.5 7 13 7 13s5-3.5 5-6.8C12 3.5 9.8 1 7 1z" stroke="#C8A84E" strokeWidth="1.5"/></svg>
                                {store.addr}
                              </div>
                            </div>
                            <div className="sdi-check">{selectedStore?.id === store.id ? '✓' : ''}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {screen === 'machines' && selectedStore && (
                <>
                  {/* Search bar */}
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>請輸入門市</span>
                  </div>

                  {/* Store cards */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                    {STORES.map(store => (
                      <div key={store.id} onClick={() => handleStoreSelect(store)}
                        style={{
                          minWidth: 160, borderRadius: 14, padding: '16px 14px',
                          background: selectedStore?.id === store.id ? '#FFF' : '#1A1A1A',
                          color: selectedStore?.id === store.id ? '#1A1A1A' : '#FFF',
                          border: selectedStore?.id === store.id ? '2px solid #C8A84E' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10
                        }}>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{store.name.replace('自助洗衣','').replace('(','').replace(')','')}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <button style={{
                            padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            background: selectedStore?.id === store.id ? '#1A1A1A' : 'transparent',
                            color: selectedStore?.id === store.id ? '#FFF' : 'rgba(255,255,255,0.6)',
                            border: selectedStore?.id === store.id ? 'none' : '1px solid rgba(255,255,255,0.2)',
                            fontFamily: 'inherit'
                          }}>
                            {selectedStore?.id === store.id ? '選擇 ✓' : '選擇'}
                          </button>
                          <StoreWasherIcon size={48} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Washer-dryer machines */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Array.from({ length: selectedStore.machines }, (_, i) => {
                      const mid = `${selectedStore.id}-m${i + 1}`;
                      const state = getMachineState(mid);
                      const isRunning = state.status === 'running';
                      const isOffline = state.status === 'offline';
                      return (
                        <div key={mid} style={{
                          background: '#FFF', borderRadius: 14, padding: '16px 18px',
                          display: 'flex', alignItems: 'center', gap: 14
                        }} onClick={() => !isRunning && !isOffline && handleMachineSelect(mid)}>
                          <WasherIcon running={isRunning} size={44} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>洗脫烘{i + 1}號(大型)</div>
                            {isRunning && state.remaining > 0 && (
                              <div style={{ fontSize: 13, color: '#888', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                {formatTime(state.remaining)}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {isRunning ? (
                              <>
                                <button className="m-btn m-btn-running">運轉</button>
                                <button className="m-btn m-btn-extend" onClick={e => { e.stopPropagation(); handleMachineSelect(mid); }}>烘乾<br/>延長</button>
                              </>
                            ) : isOffline ? (
                              <button className="m-btn m-btn-offline">維修</button>
                            ) : (
                              <button className="m-btn m-btn-use">使用</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dryer section divider */}
                  <div className="section-divider" style={{ margin: '20px 0 12px' }}>
                    <span className="section-divider-text">烘乾機</span>
                  </div>

                  {/* Dryer machines */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {Array.from({ length: selectedStore.dryers || 2 }, (_, i) => {
                      const dryerNum = selectedStore.machines + i + 1;
                      const did = `${selectedStore.id}-d${i + 1}`;
                      const state = getMachineState(did);
                      const isRunning = state.status === 'running';
                      return (
                        <div key={did} style={{
                          background: '#FFF', borderRadius: 14, padding: '16px 18px',
                          display: 'flex', alignItems: 'center', gap: 14
                        }} onClick={() => !isRunning && handleMachineSelect(did)}>
                          <DryerIcon size={44} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>烘乾{String(dryerNum).padStart(2,'0')}號({i === 0 ? '上' : '下'})</div>
                            {isRunning && state.remaining > 0 && (
                              <div style={{ fontSize: 13, color: '#888', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                {formatTime(state.remaining)}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {isRunning ? (
                              <button className="m-btn m-btn-running">運轉</button>
                            ) : (
                              <button className="m-btn m-btn-use">使用</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {screen === 'running' && selectedMachine && (
                <>
                  <button className="back-btn" onClick={goBack}>← 返回機器列表</button>
                  <div className="running-panel">
                    <h3>🔄 機器運轉中</h3>
                    <p>{selectedStore?.name} — 洗脫烘{selectedMachine.split('-m')[1]}號</p>
                    {renderTimerRing()}
                    <p style={{ marginTop: 14, fontSize: 16, color: 'var(--text-hint)' }}>
                      運轉完成後會自動更新狀態
                    </p>
                  </div>
                </>
              )}

              {screen === 'modes' && selectedMachine && (
                <div style={{ paddingBottom: 100 }}>
                  <div className="section-title-row" style={{ marginTop: 0 }}>
                    <span className="section-title-bar"></span>
                    <span className="section-title-text">門市選擇</span>
                  </div>

                  {/* Store card */}
                  <div style={{ background: '#FFF', borderRadius: 16, padding: '18px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => setShowStoreModal(true)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <StoreWasherIcon size={44} />
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1A1A' }}>雲管家自助洗衣</div>
                        <div style={{ fontSize: 14, color: '#666', marginTop: 2 }}>{selectedStore?.name}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 18, color: '#AAA' }}>▼</span>
                  </div>

                  {/* Payment toggle */}
                  <div className="pay-toggle">
                    <button className={`pay-toggle-btn ${payMethod === 'linepay' ? 'active' : ''}`}
                      onClick={() => setPayMethod('linepay')}>錢包付款</button>
                    <button className={`pay-toggle-btn ${payMethod === 'wallet' ? 'active' : ''}`}
                      onClick={() => setPayMethod('wallet')}>單次付款</button>
                  </div>

                  {/* Machine selector */}
                  <div style={{ background: '#FFF', borderRadius: 14, padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => setShowMachineModal(true)}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>機器選擇</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {selectedMachine.includes('-v') ? <VendingIcon size={28} /> : selectedMachine.includes('-d') ? <DryerIcon size={28} /> : <WasherIcon running={false} size={28} />}
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>
                        {selectedMachine.includes('-v') ? '販賣機' : selectedMachine.includes('-d') ? `烘乾${String(parseInt(selectedMachine.split('-d')[1]) + (selectedStore?.machines || 6)).padStart(2,'0')}號` : `洗脫烘${selectedMachine.split('-m')[1]}號(大型)`}
                      </span>
                      <span style={{ color: '#AAA' }}>▼</span>
                    </div>
                  </div>

                  {/* Vending machine form */}
                  {selectedMachine.includes('-v') && (
                    <>
                      <div style={{ background: '#FFF', borderRadius: 14, padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>投入金額</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {[10, 30].map(amt => (
                            <button key={amt} onClick={() => setSelectedMode({ id: `vend${amt}`, name: `販賣機$${amt}`, price: amt, minutes: 0 })}
                              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                background: selectedMode?.id === `vend${amt}` ? '#1A1A1A' : '#F0F0F0',
                                color: selectedMode?.id === `vend${amt}` ? '#FFF' : '#333' }}>
                              $ {amt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="coupon-select-row">
                        <div className="coupon-select-label">使用優惠</div>
                        <div className="coupon-select-value">
                          <span style={{ color: 'var(--text-hint)' }}>無可用優惠券 ▼</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Wash modes grid */}
                  {!selectedMachine.includes('-v') && (
                    <div className="mode-grid">
                      {MODES.map(mode => (
                        <div key={mode.id}
                          className={`mode-cell ${selectedMode?.id === mode.id ? 'selected' : ''}`}
                          onClick={() => { setSelectedMode(mode); setSelectedCoupon(null); }}>
                          <ModeIcon mode={mode.id} size={28} />
                          <div className="mode-cell-name">{mode.name}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Detergent options */}
                  {!selectedMachine.includes('-v') && selectedMode && selectedMode.id !== 'dryonly' && (
                    <div className="addon-row" style={{ marginTop: 10 }}>
                      {[
                        { key: 'detergent', label: '洗衣精' },
                        { key: 'softener', label: '柔軟精' },
                        { key: 'degreaser', label: '脫脂酵素' },
                        { key: 'antibacterial', label: '除菌酵素' },
                      ].map(a => (
                        <button key={a.key} className={`addon-chip ${addons[a.key] ? 'active' : ''}`}
                          onClick={() => setAddons(prev => ({ ...prev, [a.key]: !prev[a.key] }))}>
                          {addons[a.key] ? '✓ ' : ''}{a.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Dryer extend */}
                  {!selectedMachine.includes('-v') && selectedMode && selectedMode.id !== 'washonly' && (
                    <div className="extend-row">
                      <div className="extend-label">烘乾延長</div>
                      <select className="extend-select" value={dryExtend} onChange={e => setDryExtend(Number(e.target.value))}>
                        <option value={0}>0min</option>
                        <option value={4}>4min</option>
                        <option value={10}>10min</option>
                        <option value={20}>20min</option>
                        <option value={30}>30min</option>
                      </select>
                    </div>
                  )}

                  {/* Temperature */}
                  {!selectedMachine.includes('-v') && selectedMode && selectedMode.id !== 'washonly' && (
                    <div className="temp-row">
                      <div className="temp-label">烘衣溫度</div>
                      {['low', 'mid', 'high'].map(t => (
                        <button key={t} className={`temp-btn ${dryTemp === t ? 'active' : ''}`}
                          onClick={() => setDryTemp(t)}>
                          {t === 'low' ? '低溫' : t === 'mid' ? '中溫' : '高溫'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Coupon select */}
                  {!selectedMachine.includes('-v') && selectedMode && (
                    <div className="coupon-select-row" onClick={() => { if (payMethod !== 'wallet' && !dryExtend) { setCouponTab('coupon'); setShowCouponModal(true); } }}>
                      <div className="coupon-select-label">使用優惠</div>
                      <div className="coupon-select-value">
                        {payMethod === 'wallet'
                          ? <span style={{ color: '#E57373', fontSize: 13, background: 'rgba(229,115,115,0.12)', padding: '4px 10px', borderRadius: 6 }}>單次付款無法使用優惠</span>
                          : selectedCoupon
                            ? `${selectedCoupon.name} (-$${selectedCoupon.type === 'fixed' ? selectedCoupon.discount : Math.round(selectedMode.price * selectedCoupon.discount / 100)})`
                            : dryExtend > 0
                              ? <span style={{ color: '#E57373', fontSize: 13, background: 'rgba(229,115,115,0.12)', padding: '4px 10px', borderRadius: 6 }}>延長使用無法使用優惠</span>
                              : getApplicableCoupons().length > 0
                                ? <span style={{ color: 'var(--text-hint)' }}>請選擇優惠券 ▼</span>
                                : <span style={{ color: 'var(--text-hint)' }}>暫無可用優惠</span>
                        }
                      </div>
                    </div>
                  )}

                  {payMethod === 'wallet' && selectedMode && points < getFinalPrice() && (
                    <div className="points-banner">
                      <div className="points-banner-icon">⚠️</div>
                      <div className="points-banner-text">餘額不足！需要 {getFinalPrice()} 點，目前只有 {points} 點</div>
                      <button className="points-banner-btn" onClick={handleTopup}>儲值</button>
                    </div>
                  )}

                  {/* Bottom payment bar */}
                  {selectedMode && (
                    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1A1A1A', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 200, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: 18, color: '#FFF' }}>
                        付款金額 <span style={{ fontSize: 28, fontWeight: 900 }}>$ {getFinalPrice()}</span>
                      </div>
                      <button style={{ background: '#FFF', color: '#1A1A1A', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={() => setScreen('confirm')}>確認付款</button>
                    </div>
                  )}
                </div>
              )}

              {screen === 'result' && (
                <div className="result-container">
                  {payResult === 'success' ? (
                    <>
                      <div className="result-icon">✅</div>
                      <div className="result-title" style={{ color: 'var(--success)' }}>付款成功！</div>
                      <div className="result-desc">機器啟動指令已發送<br />請至機器前等候啟動</div>
                    </>
                  ) : (
                    <>
                      <div className="result-icon">❌</div>
                      <div className="result-title" style={{ color: 'var(--danger)' }}>付款已取消</div>
                      <div className="result-desc">您已取消本次付款<br />歡迎重新選擇</div>
                    </>
                  )}
                  <button className="result-btn" onClick={() => { setScreen('stores'); setSelectedStore(null); setSelectedMachine(null); setSelectedMode(null); setSelectedCoupon(null); setTab('home'); }}>返回首頁</button>
                </div>
              )}

              {screen === 'paying' && (
                <div className="result-container">
                  <div className="result-icon">⏳</div>
                  <div className="result-title">正在導向 LINE Pay...</div>
                  <div className="loading-dots" style={{ justifyContent: 'center', marginTop: 28 }}>
                    <span /><span /><span />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════
              TAB: 紀錄 (History)
              ══════════════════════════════════════ */}
          {tab === 'history' && (
            <>
              <div className="sec-title">交易紀錄</div>
              <div className="history-tabs">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'topup', label: '儲值記錄' },
                  { key: 'payment', label: '店內付款' },
                  { key: 'coupon', label: '優惠券' },
                ].map(t => (
                  <button key={t.key} className={`history-tab ${historyFilter === t.key ? 'active' : ''}`}
                    onClick={() => setHistoryFilter(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>
              {(() => {
                const allRecords = [
                  ...transactions.map(tx => ({ ...tx, recordType: tx.type })),
                ];
                // Add coupon usage records
                coupons.filter(c => c.used).forEach(c => {
                  allRecords.push({
                    id: `cr-${c.id}`, name: `使用優惠券：${c.name}`, date: '', amount: 0, recordType: 'coupon'
                  });
                });
                const filtered = historyFilter === 'all' ? allRecords
                  : allRecords.filter(r => r.recordType === historyFilter);

                if (filtered.length === 0) return (
                  <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <div className="empty-state-text">暫無{historyFilter === 'topup' ? '儲值' : historyFilter === 'payment' ? '付款' : historyFilter === 'coupon' ? '優惠券' : ''}紀錄</div>
                  </div>
                );

                // Show transaction records for topup/payment/all
                const displayRecords = historyFilter === 'all'
                  ? filtered.filter(r => r.recordType !== 'coupon')
                  : filtered;
                return displayRecords.map(r => (
                  <div key={r.id} className="history-card">
                    <div className="history-top">
                      <div className="history-store">
                        {r.recordType === 'topup' ? '$ ' : r.recordType === 'coupon' ? '券 ' : ''}{r.name}
                      </div>
                      {r.amount !== 0 && (
                        <div className="history-amount" style={{ color: r.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {r.amount > 0 ? '+' : ''}{r.amount}
                        </div>
                      )}
                    </div>
                    <div className="history-detail">
                      {r.date && `📅 ${r.date}`}
                      {r.recordType === 'payment' && usageHistory.find(h => h.amount === Math.abs(r.amount)) && (
                        <><br />🔧 {usageHistory.find(h => h.amount === Math.abs(r.amount))?.machine} ・ {usageHistory.find(h => h.amount === Math.abs(r.amount))?.mode}</>
                      )}
                      {r.recordType === 'coupon' && <span> 已使用</span>}
                    </div>
                  </div>
                ));
              })()}
            </>
          )}

          {/* ══════════════════════════════════════
              TAB: 我的 (Profile) — Coupons
              ══════════════════════════════════════ */}
          {tab === 'profile' && (
            <>
              {/* User info card */}
              <div style={{ marginTop: 20, background: 'var(--card)', borderRadius: 'var(--radius)', padding: '24px 20px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                {user?.picture ? (
                  <img src={user.picture} style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--accent)', objectFit: 'cover' }} alt="" />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white', fontWeight: 700 }}>{user?.name?.[0] || '?'}</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-sub)', marginTop: 2 }}>點數餘額：<strong style={{ color: 'var(--primary)' }}>{points} 點</strong></div>
                </div>
                <button className="points-banner-btn" onClick={handleTopup}>儲值</button>
              </div>

              <div className="sec-title">我的優惠券</div>
              <div className="coupon-tabs" style={{ marginBottom: 16 }}>
                {[
                  { key: 'coupon', label: '優惠券', count: coupons.filter(c => !c.used && (c.category || 'coupon') === 'coupon').length },
                  { key: 'monthly', label: '包月卡', count: coupons.filter(c => !c.used && c.category === 'monthly').length },
                  { key: 'festival', label: '節慶', count: coupons.filter(c => !c.used && c.category === 'festival').length },
                ].map(t => (
                  <button key={t.key} className={`coupon-tab ${couponTab === t.key ? 'active' : ''}`} onClick={() => setCouponTab(t.key)}>
                    {t.label}
                    {t.count > 0 && <span className="coupon-tab-badge">{t.count}</span>}
                  </button>
                ))}
              </div>
              {(() => {
                const filtered = coupons.filter(c => !c.used && (c.category || 'coupon') === couponTab);
                if (filtered.length === 0) return (
                  <div className="empty-state">
                    <div className="empty-state-icon">🎫</div>
                    <div className="empty-state-text">目前沒有可用{couponTab === 'coupon' ? '優惠券' : couponTab === 'monthly' ? '包月卡' : '節慶優惠'}</div>
                  </div>
                );
                return filtered.map(c => (
                  <div key={c.id} className="coupon-card">
                    <div className="coupon-info">
                      <div className="coupon-name">{c.name}</div>
                      <div className="coupon-detail">
                        {c.desc || (c.minSpend > 0 ? `消費滿 $${c.minSpend} 可用` : '無最低消費')}
                        {c.modeOnly ? ` ・ 限${MODES.find(m => m.id === c.modeOnly)?.name}` : ''}
                        <br />有效期限：{c.expiry}
                      </div>
                    </div>
                    <div className="coupon-discount">
                      {c.type === 'fixed' ? `-$${c.discount}` : `${100 - c.discount}折`}
                    </div>
                  </div>
                ));
              })()}

              {/* Redeem code section */}
              <div style={{ marginTop: 20, background: 'var(--card)', borderRadius: 'var(--radius-sm)', padding: '18px 20px', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>兌換優惠碼</div>
                <div className="redeem-row" style={{ margin: 0, border: 'none', padding: 0 }}>
                  <input className="redeem-input" placeholder="請輸入兌換碼" value={redeemCode}
                    onChange={e => setRedeemCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRedeemCode()} />
                  <button className="redeem-btn" onClick={handleRedeemCode}>兌換</button>
                </div>
              </div>

              {coupons.filter(c => c.used).length > 0 && (
                <>
                  <div className="section-divider">
                    <span className="section-divider-text">已使用</span>
                  </div>
                  {coupons.filter(c => c.used).map(c => (
                    <div key={c.id} className="coupon-card used">
                      <div className="coupon-info">
                        <div className="coupon-name">{c.name}</div>
                        <div className="coupon-detail">已使用</div>
                      </div>
                      <div className="coupon-discount used-label">已使用</div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

        </div>
      </div>

      {/* ═══ Bottom Pay Bar ═══ */}
      {tab === 'wash' && screen === 'modes' && (
        <div className="pay-bar">
          <div className="pay-bar-inner">
            <div className="pay-bar-price">
              <div className="pay-bar-label">
                付款金額
                {selectedCoupon && <span style={{ color: 'var(--accent-light)', marginLeft: 8 }}>已折抵</span>}
              </div>
              <div className="pay-bar-amount">
                <span>$ </span>{selectedMode ? getFinalPrice() : '—'}
                {selectedCoupon && selectedMode && (
                  <span style={{ fontSize: 14, textDecoration: 'line-through', marginLeft: 8, opacity: 0.5 }}>
                    ${selectedMode.price}
                  </span>
                )}
              </div>
            </div>
            <button
              className={`pay-bar-btn ${selectedMode ? 'ready' : 'disabled'}`}
              onClick={handlePay}
              disabled={!selectedMode}>
              確認付款
            </button>
          </div>
        </div>
      )}

      {/* ═══ Bottom Tab Bar ═══ */}
      <div className="tab-bar">
        <div className="tab-bar-inner">
          <button className={`tab-item ${tab === 'home' ? 'active' : ''}`} onClick={() => switchTab('home')}>
            <HomeIcon active={tab === 'home'} />
            <div className="tab-item-label">首頁</div>
          </button>
          <button className={`tab-item ${tab === 'wash' ? 'active' : ''}`} onClick={() => { switchTab('wash'); if (screen === 'result') setScreen('stores'); }}>
            <WashTabIcon active={tab === 'wash'} />
            <div className="tab-item-label">洗衣</div>
          </button>
          <button className={`tab-item ${tab === 'history' ? 'active' : ''}`} onClick={() => switchTab('history')}>
            <HistoryIcon active={tab === 'history'} />
            <div className="tab-item-label">紀錄</div>
          </button>
          <button className={`tab-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => switchTab('profile')}>
            <ProfileIcon active={tab === 'profile'} />
            <div className="tab-item-label">我的</div>
          </button>
        </div>
      </div>

      {/* ═══ Door Alert Modal (Two-Step) ═══ */}
      {showDoorAlert && (
        <div className="door-alert-overlay" onClick={() => setShowDoorAlert(false)}>
          <div className="door-alert-box" onClick={e => e.stopPropagation()}>
            <div className="door-alert-step" style={{ color: 'var(--text-hint)' }}>步驟 {doorStep} / 2</div>
            <div className="door-alert-icon-wrap">
              <svg viewBox="0 0 100 100" fill="none">
                <path d="M25 15h50a5 5 0 015 5v60a5 5 0 01-5 5H25a5 5 0 01-5-5V20a5 5 0 015-5z" stroke="#666" strokeWidth="3" fill="#F5F5F5" />
                <circle cx="50" cy="55" r="15" stroke="#999" strokeWidth="2.5" fill="none" />
                {doorStep === 1 && <>
                  <circle cx="35" cy="28" r="3" fill="#CCC" />
                  <circle cx="44" cy="28" r="3" fill="#CCC" />
                  <rect x="55" y="25" width="14" height="6" rx="3" stroke="#CCC" strokeWidth="1.5" fill="none" />
                </>}
                {doorStep === 2 && <>
                  <circle cx="35" cy="28" r="3" fill="#34C759" />
                  <circle cx="44" cy="28" r="3" fill="#34C759" />
                  <rect x="55" y="25" width="14" height="6" rx="3" stroke="#34C759" strokeWidth="1.5" fill="none" />
                </>}
                <line x1="30" y1="8" x2="30" y2="12" stroke="#AAA" strokeWidth="2" />
                <line x1="42" y1="5" x2="42" y2="12" stroke="#AAA" strokeWidth="2" />
                <line x1="58" y1="5" x2="58" y2="12" stroke="#AAA" strokeWidth="2" />
                <line x1="70" y1="8" x2="70" y2="12" stroke="#AAA" strokeWidth="2" />
                {/* Warning triangle */}
                <g transform="translate(60,60)">
                  <path d="M15 0L30 26H0L15 0z" fill="#FFC107" stroke="#F57F17" strokeWidth="1.5" />
                  <text x="15" y="21" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#F57F17">!</text>
                </g>
              </svg>
            </div>
            {doorStep === 1 ? (
              <>
                <div className="door-alert-title" style={{ color: 'var(--danger)' }}>請先關好機門！</div>
                <div className="door-alert-desc">
                  付款後機器將自動啟動<br />
                  請確認衣物已放入，並且<strong>機門已確實關閉</strong>
                </div>
              </>
            ) : (
              <>
                <div className="door-alert-title" style={{ color: 'var(--primary)' }}>確認機器狀態</div>
                <div className="door-alert-desc">
                  請確認機器螢幕已操作至付款頁面，<br />
                  且您的衣服已放置於機器內
                </div>
              </>
            )}
            <div className="door-alert-actions">
              <button className="door-alert-cancel" onClick={() => setShowDoorAlert(false)}>
                {doorStep === 1 ? '取消' : '否'}
              </button>
              <button className="door-alert-confirm" onClick={handleDoorStep}>
                {doorStep === 1 ? '確定' : '確認'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Confirm Modal ═══ */}
      {screen === 'confirm' && tab === 'wash' && (
        <div className="modal-overlay" onClick={() => setScreen('modes')}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">確認付款</div>
            <div className="modal-row">
              <span className="label">店家</span>
              <span className="value">{selectedStore?.name}</span>
            </div>
            <div className="modal-row">
              <span className="label">機台</span>
              <span className="value">洗脫烘{selectedMachine?.split('-m')[1]}號</span>
            </div>
            <div className="modal-row">
              <span className="label">模式</span>
              <span className="value">{selectedMode?.name}</span>
            </div>
            <div className="modal-row">
              <span className="label">時間</span>
              <span className="value">{selectedMode?.minutes} 分鐘</span>
            </div>
            {selectedMode?.id !== 'washonly' && (
              <div className="modal-row">
                <span className="label">烘衣溫度</span>
                <span className="value">{dryTemp === 'low' ? '低溫' : dryTemp === 'mid' ? '中溫' : '高溫'}</span>
              </div>
            )}
            <div className="modal-row">
              <span className="label">付款方式</span>
              <span className="value">{payMethod === 'wallet' ? '錢包付款' : 'LINE Pay'}</span>
            </div>
            {selectedCoupon && (
              <div className="modal-row">
                <span className="label">優惠券</span>
                <span className="value" style={{ color: 'var(--accent)' }}>
                  {selectedCoupon.name} (-${selectedCoupon.type === 'fixed' ? selectedCoupon.discount : Math.round(selectedMode.price * selectedCoupon.discount / 100)})
                </span>
              </div>
            )}
            <div className="modal-row total">
              <span className="label">應付金額</span>
              <span className="value">NT${getFinalPrice()}</span>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setScreen('modes')}>取消</button>
              <button className="modal-confirm" onClick={startPayment}>
                {payMethod === 'wallet' ? '錢包付款' : 'LINE Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Points Info Full Page ═══ */}
      {showPointsInfo && (
        <div className="points-info-fullpage">
          <div className="fullpage-header">
            <div className="fullpage-header-top">
              <button className="fullpage-back" onClick={() => setShowPointsInfo(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="fullpage-title">點數說明</div>
            </div>
          </div>
          <div className="points-info-body">
            <div className="points-info-section-title">
              <span className="section-title-bar"></span>
              儲值點數說明
            </div>

            <div className="points-info-card">
              <div className="points-info-card-title">
                <span style={{ background: '#06C755', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#FFF' }}>⬆</span>
                儲值流程
              </div>
              <div className="points-info-item"><strong>1.</strong> 客人以現金支付儲值金額，例如1000元。</div>
              <div className="points-info-item"><strong>2.</strong> 店家將以1:1比例將該金額轉換成等值點數（如1000點），點數會記錄在客人帳戶中。</div>
              <div className="points-info-item"><strong>3.</strong> 點數可用於店內自助洗衣機或烘乾機的消費，使用時系統會自動扣除相應點數。</div>
            </div>

            <div className="points-info-card">
              <div className="points-info-card-title">
                <span style={{ background: '#06C755', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#FFF' }}>✅</span>
                使用方式
              </div>
              <div className="points-info-item"><strong>1.</strong> 客人可隨時於會員系統中查詢點數餘額。</div>
              <div className="points-info-item"><strong>2.</strong> 點數即時生效，可直接用於消費，不需額外兌換。</div>
              <div className="points-info-item"><strong>3.</strong> 使用點數時，請依照機器或系統指示操作。</div>
            </div>

            <div className="points-info-card">
              <div className="points-info-card-title">
                <span style={{ background: '#F5A623', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#FFF' }}>⚠</span>
                注意事項
              </div>
              <div className="points-info-item"><strong>1.</strong> 點數不可兌換現金，僅限於店內消費使用。</div>
              <div className="points-info-item"><strong>2.</strong> 請注意點數是否有使用期限，過期可能會失效。</div>
              <div className="points-info-item"><strong>3.</strong> 儲值優惠或消費折扣，將於儲值時一併告知。</div>
              <div className="points-info-item"><strong>4.</strong> 儲值點數屬於記名制，請妥善保管會員帳號或識別方式。</div>
              <div className="points-info-item"><strong>5.</strong> 如遇系統異常或消費問題，請立即聯繫店家客服協助處理。</div>
              <div className="points-info-item"><strong>6.</strong> 儲值後若需退費，需依店家退費政策辦理。</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Transaction History Full Page ═══ */}
      {showTransactionPage && (
        <div className="fullpage-overlay">
          <div className="fullpage-header">
            <div className="fullpage-header-top">
              <button className="fullpage-back" onClick={() => setShowTransactionPage(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="fullpage-title">交易記錄</div>
            </div>
            <div className="fullpage-tabs">
              {[
                { key: 'all', label: '全部' },
                { key: 'topup', label: '儲值記錄' },
                { key: 'payment', label: '店內付款' },
                { key: 'coupon', label: '優惠券記錄' },
              ].map(t => (
                <button key={t.key} className={`fullpage-tab ${txFilter === t.key ? 'active' : ''}`}
                  onClick={() => setTxFilter(t.key)}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="fullpage-body">
            {(() => {
              const allRecords = [
                ...transactions.map(tx => ({ ...tx, recordType: tx.type })),
              ];
              coupons.filter(c => c.used).forEach(c => {
                allRecords.push({ id: `cr-${c.id}`, name: `使用優惠券：${c.name}`, date: '', amount: 0, recordType: 'coupon' });
              });
              const filtered = txFilter === 'all' ? allRecords : allRecords.filter(r => r.recordType === txFilter);
              if (filtered.length === 0) return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>暫無訂單數據</div>
                </div>
              );
              return filtered.map(r => (
                <div key={r.id} style={{ background: 'var(--card)', borderRadius: 12, padding: '16px 18px', marginBottom: 10, border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {r.recordType === 'topup' ? '$ ' : r.recordType === 'coupon' ? '🎫 ' : ''}{r.name}
                    </div>
                    {r.amount !== 0 && (
                      <div style={{ fontWeight: 700, fontSize: 16, color: r.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {r.amount > 0 ? '+' : ''}{r.amount} 點
                      </div>
                    )}
                  </div>
                  {r.date && <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>{r.date}</div>}
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* ═══ My Coupons Full Page ═══ */}
      {showMyCouponsPage && !showCouponStore && (
        <div className="fullpage-overlay">
          <div className="fullpage-header">
            <div className="fullpage-header-top">
              <button className="fullpage-back" onClick={() => setShowMyCouponsPage(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="fullpage-title">我的優惠</div>
            </div>
            <div className="fullpage-tabs">
              {[
                { key: 'active', label: '使用中' },
                { key: 'unused', label: '未使用' },
                { key: 'expired', label: '已過期' },
              ].map(t => (
                <button key={t.key} className={`fullpage-tab ${myCouponTab === t.key ? 'active' : ''}`}
                  onClick={() => setMyCouponTab(t.key)}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="fullpage-body" style={{ paddingBottom: 100 }}>
            {(() => {
              let filtered;
              if (myCouponTab === 'active') filtered = coupons.filter(c => c.used);
              else if (myCouponTab === 'unused') filtered = coupons.filter(c => !c.used && !c.expired);
              else filtered = coupons.filter(c => c.expired);
              if (filtered.length === 0) return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>暫無優惠券</div>
                </div>
              );
              return filtered.map(c => (
                <div key={c.id} style={{ background: 'var(--card)', borderRadius: 12, padding: '16px 18px', marginBottom: 10, border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>
                      {c.desc || (c.minSpend > 0 ? `消費滿 $${c.minSpend} 可用` : '無最低消費')}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 2 }}>有效期限：{c.expiry}</div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: myCouponTab === 'expired' ? 'var(--text-hint)' : 'var(--accent)' }}>
                    {c.type === 'fixed' ? `-$${c.discount}` : `${100 - c.discount}折`}
                  </div>
                </div>
              ));
            })()}
          </div>
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: '#000', zIndex: 1101 }}>
            <button onClick={() => { setCouponStoreTab('gift'); setShowCouponStore(true); }}
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)', background: '#1A1A1A', color: '#FFF', fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              去購買優惠券
            </button>
          </div>
        </div>
      )}

      {/* ═══ Coupon Store Full Page ═══ */}
      {showCouponStore && !selectedStoreCoupon && (
        <div className="fullpage-overlay">
          <div className="fullpage-header">
            <div className="fullpage-header-top">
              <button className="fullpage-back" onClick={() => setShowCouponStore(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="fullpage-title">優惠中心</div>
            </div>
          </div>
          <div className="fullpage-body">
            {/* VIP Banner */}
            {couponStoreTab === 'gift' && (
              <div className="store-vip-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#FFF' }}>歡迎成為洗衣粉</div>
                  <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 700, color: '#FFF' }}>VIP</span>
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>衣隨心動煥光彩，每件都是粉絲級呵護</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: '#C8A84E' }}>50</span>
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>點折扣券</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#C8A84E' }}>免費</span>
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>領取</span>
                </div>
              </div>
            )}
            {couponStoreTab === 'monthly' && (
              <div className="store-vip-banner" style={{ background: 'linear-gradient(135deg, rgba(80,70,120,0.5) 0%, rgba(60,50,100,0.4) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#FFF' }}>夜猫</div>
                  <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 700, color: '#FFF' }}>VIP</span>
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>在深夜，靜靜完成生活的儀式</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: '#FFF' }}>5500</span>
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>點</span>
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>原價 <span style={{ textDecoration: 'line-through' }}>19320</span></div>
              </div>
            )}

            {/* Store Tabs */}
            <div className="fullpage-tabs" style={{ marginBottom: 16 }}>
              {[
                { key: 'gift', label: '禮包', icon: '🎁' },
                { key: 'monthly', label: '包月', icon: '👑' },
                { key: 'festival', label: '節慶', icon: '🎉' },
              ].map(t => (
                <button key={t.key} className={`fullpage-tab ${couponStoreTab === t.key ? 'active' : ''}`}
                  style={{ borderBottomColor: couponStoreTab === t.key ? '#4A90D9' : 'transparent' }}
                  onClick={() => setCouponStoreTab(t.key)}>
                  {couponStoreTab === t.key && <span style={{ marginRight: 4 }}>{t.icon}</span>}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Ticket Cards */}
            {(STORE_COUPONS[couponStoreTab] || []).length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', color: 'rgba(255,255,255,0.4)' }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>暫無優惠券</div>
              </div>
            ) : (
              (STORE_COUPONS[couponStoreTab] || []).map(sc => (
                <div key={sc.id} className="ticket-card">
                  <div className="ticket-left">
                    <div className="ticket-divider" />
                    <div className="ticket-badge">{sc.discount}</div>
                    <div className="ticket-name">{sc.name}</div>
                    <div className="ticket-desc">
                      ·{sc.desc}<br/>
                      ·全台雲管家均可使用<br/>
                      ·{sc.validity.replace('自購買起', '購買後')}<br/>
                      ·{sc.device}
                    </div>
                  </div>
                  <div className="ticket-right">
                    <div><span className="ticket-price">{sc.price}</span><span className="ticket-price-unit">點</span></div>
                    <div className="ticket-original">原价：{sc.originalPrice}</div>
                    <button className="ticket-buy-btn" onClick={() => setSelectedStoreCoupon(sc)}>立即購買</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══ Coupon Payment Full Page ═══ */}
      {selectedStoreCoupon && (
        <div className="fullpage-overlay" style={{ background: '#F5F5F5' }}>
          <div className="fullpage-header" style={{ paddingBottom: 16 }}>
            <div className="fullpage-header-top">
              <button className="fullpage-back" onClick={() => setSelectedStoreCoupon(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="fullpage-title">優惠券付款</div>
            </div>
          </div>
          <div className="fullpage-body" style={{ background: '#F5F5F5', paddingBottom: 100 }}>
            {/* Price bar */}
            <div className="cpay-price-bar">
              <div className="cpay-price-label">應付點數</div>
              <div><span className="cpay-price-value">{selectedStoreCoupon.price}</span><span className="cpay-price-unit">點</span></div>
            </div>

            {/* Coupon info */}
            <div className="cpay-info-card">
              <div className="cpay-info-row">
                <span className="cpay-info-label">優惠券名稱</span>
                <span className="cpay-info-value">{selectedStoreCoupon.name}</span>
              </div>
              <div className="cpay-info-row">
                <span className="cpay-info-label">優惠券類型</span>
                <span className="cpay-info-value">{selectedStoreCoupon.type}</span>
              </div>
            </div>

            {/* Coupon details */}
            <div className="cpay-detail-card">
              <div className="cpay-detail-title">
                <span style={{ background: '#06C755', borderRadius: 4, width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#FFF' }}>✓</span>
                優惠卷說明
              </div>
              <div className="cpay-detail-row">
                <span className="cpay-detail-label">使用說明：</span>
                <span className="cpay-detail-value">{selectedStoreCoupon.desc}</span>
              </div>
              <div className="cpay-detail-row">
                <span className="cpay-detail-label">使用時段：</span>
                <span className="cpay-detail-value">{selectedStoreCoupon.timeSlot}</span>
              </div>
              <div className="cpay-detail-row">
                <span className="cpay-detail-label">設備限制：</span>
                <span className="cpay-detail-value">{selectedStoreCoupon.device}</span>
              </div>
              <div className="cpay-detail-row">
                <span className="cpay-detail-label">使用期限：</span>
                <span className="cpay-detail-value">{selectedStoreCoupon.validity}</span>
              </div>
              <div className="cpay-detail-row">
                <span className="cpay-detail-label">適用店點：</span>
                <span className="cpay-detail-value">{selectedStoreCoupon.stores}</span>
              </div>
              <div className="cpay-detail-row">
                <span className="cpay-detail-label">使用方式：</span>
                <span className="cpay-detail-value">{selectedStoreCoupon.usage}</span>
              </div>
              <div className="cpay-detail-row">
                <span className="cpay-detail-label">每人限購：</span>
                <span className="cpay-detail-value">{selectedStoreCoupon.purchaseLimit}</span>
              </div>
              {selectedStoreCoupon.canCombine && (
                <div className="cpay-detail-row">
                  <span className="cpay-detail-label">可否併用：</span>
                  <span className="cpay-detail-value">{selectedStoreCoupon.canCombine}</span>
                </div>
              )}
            </div>

            {/* Warning section */}
            <div className="cpay-warning-card">
              <div className="cpay-warning-title">
                <span style={{ fontSize: 18 }}>⚠️</span> 注意事項
              </div>
              <div className="cpay-warning-item"><strong>1.</strong> 優惠卷不得兌換現金，逾期作廢。</div>
              <div className="cpay-warning-item"><strong>2.</strong> 如發現有重複帳號註冊、濫用優惠或操作系統漏洞等情形，本公司有權取消該優惠券使用資格並不予退費，且保留法律追訴權利。</div>
              <div className="cpay-warning-item"><strong>3.</strong> 本公司保留最終修改、變更、取消本活動之權利。</div>
            </div>

            {/* Refund section */}
            <div className="cpay-warning-card">
              <div className="cpay-warning-title">
                <span style={{ fontSize: 18 }}>⚠️</span> 退費說明
              </div>
              <div className="cpay-warning-item"><strong>1.</strong> 未使用之優惠券可於購買日起7日內申請退還點數，逾期恕不受理。</div>
              <div className="cpay-warning-item"><strong>2.</strong> 優惠券一經使用，即視為您同意本條款，系統將自動記錄使用次數與折抵點數，並視為開始履約。</div>
              <div className="cpay-warning-item"><strong>3.</strong> 優惠券之使用將依據實際折抵點數進行比例計算，若累計折抵點數未超過原付款點數，可申請退還剩餘點數； 已折抵點數以該產品對應之單次標準點數價值計算。</div>
              <div className="cpay-warning-item"><strong>4.</strong> 部分優惠券可能包含額外贈送之使用次數或點數，該部分不具退款價值，不得由請折算退款。</div>
              <div className="cpay-warning-item"><strong>5.</strong> 若需申請退款，請聯繫客服，並提供購買憑證與會員資訊。客服將於3至5個工作日內協助處理。</div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="cpay-bottom-bar">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
              <input type="checkbox" style={{ width: 18, height: 18, accentColor: '#666' }} /> 自動續費
            </label>
            <button className="cpay-confirm-btn" onClick={() => setShowPurchaseConfirm(true)}>確認付款</button>
          </div>
        </div>
      )}

      {/* ═══ Purchase Confirm Dialog ═══ */}
      {showPurchaseConfirm && selectedStoreCoupon && (
        <div className="confirm-dialog-overlay" onClick={() => setShowPurchaseConfirm(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            {points >= selectedStoreCoupon.price ? (
              <>
                <div className="confirm-dialog-icon">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none"><rect x="15" y="22" width="50" height="36" rx="4" stroke="#888" strokeWidth="3"/><path d="M15 30h50" stroke="#888" strokeWidth="3"/><circle cx="40" cy="42" r="6" stroke="#888" strokeWidth="2"/><path d="M28 18l4-6M52 18l-4-6" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <div className="confirm-dialog-text">是否確認購買？</div>
                <div className="confirm-dialog-actions">
                  <button className="confirm-dialog-btn" onClick={() => setShowPurchaseConfirm(false)}>否</button>
                  <button className="confirm-dialog-btn primary" onClick={() => {
                    setPoints(prev => prev - selectedStoreCoupon.price);
                    setTransactions(prev => [{ id: `t${Date.now()}`, name: `購買優惠券：${selectedStoreCoupon.name}`, date: new Date().toISOString().split('T')[0], amount: -selectedStoreCoupon.price, type: 'coupon' }, ...prev]);
                    setCoupons(prev => [...prev, { id: `c${Date.now()}`, name: selectedStoreCoupon.name, type: 'fixed', discount: Math.round(selectedStoreCoupon.originalPrice - selectedStoreCoupon.price), minSpend: 0, expiry: '2026-06-30', used: false, category: couponStoreTab === 'monthly' ? 'monthly' : 'coupon', desc: selectedStoreCoupon.desc }]);
                    setShowPurchaseConfirm(false);
                    setSelectedStoreCoupon(null);
                    showToast(`購買成功！已獲得「${selectedStoreCoupon.name}」優惠券`);
                  }}>確認購買</button>
                </div>
              </>
            ) : (
              <>
                <div className="confirm-dialog-icon">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none"><path d="M40 15L10 65h60L40 15z" stroke="#F5A623" strokeWidth="3" fill="none"/><path d="M40 35v15M40 55h.01" stroke="#F5A623" strokeWidth="3" strokeLinecap="round"/><path d="M25 20l-4-4M55 20l4-4M20 40l-5-2M60 40l5-2" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <div className="confirm-dialog-text">您的餘額不足</div>
                <div className="confirm-dialog-actions">
                  <button className="confirm-dialog-btn primary" style={{ flex: 1 }} onClick={() => {
                    setShowPurchaseConfirm(false);
                    setSelectedStoreCoupon(null);
                    setShowCouponStore(false);
                    setShowMyCouponsPage(false);
                  }}>回到首頁</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ Topup Full Page ═══ */}
      {showTopupModal && (
        <div className="topup-fullpage">
          <div className="fullpage-header">
            <div className="fullpage-header-top">
              <button className="fullpage-back" onClick={() => setShowTopupModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="fullpage-title">線上儲值</div>
            </div>
          </div>
          <div className="topup-fullpage-body">
            {/* Input card */}
            <div className="topup-input-card">
              <div className="topup-input-title">儲值點數</div>
              <div className="topup-input-row">
                <input
                  className="topup-input-field"
                  type="number"
                  placeholder="請輸入點數"
                  value={customTopupAmount}
                  onChange={e => { setCustomTopupAmount(e.target.value); setSelectedTopup(null); }}
                />
                <span className="topup-input-unit">點</span>
              </div>
            </div>

            {/* Payment methods */}
            <div className="topup-pay-title">付款方式</div>
            <div className="topup-pay-grid">
              {[
                { key: 'linepay', label: 'LINE Pay', bg: '#06C755', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFF"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596a.626.626 0 01-.199.031c-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771z"/></svg> },
                { key: 'jkopay', label: '街口支付', bg: '#E65100', icon: <span style={{ fontSize: 16, fontWeight: 900 }}>街</span> },
                { key: 'applepay', label: 'Apple Pay', bg: '#1A1A1A', icon: <svg width="18" height="22" viewBox="0 0 18 22" fill="#FFF"><path d="M14.94 11.58c-.02-2.17 1.77-3.21 1.85-3.26-1.01-1.47-2.58-1.67-3.14-1.7-1.33-.14-2.6.79-3.28.79-.68 0-1.72-.77-2.83-.75-1.46.02-2.8.85-3.55 2.15-1.52 2.63-.39 6.52 1.09 8.65.72 1.04 1.58 2.21 2.71 2.17 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.68.7 2.82.68 1.17-.02 1.91-1.06 2.63-2.1.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.28-.87-2.31-3.49zM12.77 4.82c.6-.73 1.01-1.73.9-2.74-.87.04-1.92.58-2.54 1.3-.56.64-1.05 1.67-.92 2.66.97.07 1.96-.49 2.56-1.22z"/></svg> },
                { key: 'samsungpay', label: 'Samsung Pay', bg: '#1428A0', icon: <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: -0.5 }}>pay</span> },
                { key: 'mastercard', label: 'Mastercard', bg: '#EB001B', icon: <svg width="24" height="16" viewBox="0 0 24 16"><circle cx="9" cy="8" r="7" fill="#EB001B"/><circle cx="15" cy="8" r="7" fill="#F79E1B"/><path d="M12 2.4a7 7 0 010 11.2 7 7 0 000-11.2z" fill="#FF5F00"/></svg> },
                { key: 'visa', label: 'VISA', bg: '#1A1F71', icon: <span style={{ fontSize: 14, fontWeight: 900, fontStyle: 'italic', letterSpacing: 1 }}>VISA</span> },
              ].map(m => (
                <div key={m.key} className={`topup-pay-item ${topupPayMethod === m.key ? 'active' : ''}`}
                  onClick={() => setTopupPayMethod(m.key)}>
                  <div className="topup-pay-logo" style={{ background: m.bg }}>{m.icon}</div>
                  <span className="topup-pay-name">{m.label}</span>
                  <div className="topup-pay-radio" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom confirm */}
          <div className="topup-bottom-bar">
            <button
              className={`topup-confirm-fullbtn ${customTopupAmount ? 'ready' : ''}`}
              onClick={() => {
                if (!customTopupAmount) return;
                const amount = parseInt(customTopupAmount) || 0;
                if (amount <= 0) return;
                setPoints(prev => prev + amount);
                setTransactions(prev => [{ id: `t${Date.now()}`, name: `線上儲值`, date: new Date().toISOString().split('T')[0], amount: amount, type: 'topup' }, ...prev]);
                setCustomTopupAmount('');
                setShowTopupModal(false);
                showToast(`儲值成功！已加值 ${amount} 點`);
              }}
              disabled={!customTopupAmount}>
              確認
            </button>
          </div>
        </div>
      )}

      {/* ═══ Coupon Selection Modal (with tabs) ═══ */}
      {showCouponModal && (
        <div className="modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="modal-title" style={{ margin: 0 }}>優惠券選擇</div>
              <button onClick={() => setShowCouponModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: 'var(--text-sub)', cursor: 'pointer', padding: '4px 8px' }}>✕</button>
            </div>
            <div className="coupon-tabs">
              {[
                { key: 'coupon', label: '優惠券', count: getApplicableCoupons().filter(c => (c.category || 'coupon') === 'coupon').length },
                { key: 'monthly', label: '包月卡', count: getApplicableCoupons().filter(c => c.category === 'monthly').length },
                { key: 'festival', label: '節慶', count: getApplicableCoupons().filter(c => c.category === 'festival').length },
              ].map(t => (
                <button key={t.key} className={`coupon-tab ${couponTab === t.key ? 'active' : ''}`} onClick={() => setCouponTab(t.key)}>
                  {t.label}
                  {t.count > 0 && <span className="coupon-tab-badge">{t.count}</span>}
                </button>
              ))}
            </div>
            <div className="coupon-modal-list">
              {couponTab === 'coupon' && (
                <div
                  className={`coupon-card ${!selectedCoupon ? 'selected-coupon' : ''}`}
                  onClick={() => { setSelectedCoupon(null); setShowCouponModal(false); }}>
                  <div className="coupon-info">
                    <div className="coupon-name">不使用優惠券</div>
                    <div className="coupon-detail">以原價付款</div>
                  </div>
                </div>
              )}
              {(() => {
                const filtered = getApplicableCoupons().filter(c => (c.category || 'coupon') === couponTab);
                if (filtered.length === 0) return (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-hint)', fontSize: 16 }}>
                    暫無可使用{couponTab === 'coupon' ? '優惠券' : couponTab === 'monthly' ? '包月卡' : '節慶優惠'}
                  </div>
                );
                return filtered.map(c => (
                  <div key={c.id}
                    className={`coupon-card ${selectedCoupon?.id === c.id ? 'selected-coupon' : ''}`}
                    onClick={() => { setSelectedCoupon(c); setShowCouponModal(false); }}>
                    <div className="coupon-info">
                      <div className="coupon-name">{c.name}</div>
                      <div className="coupon-detail">
                        {c.desc || (c.minSpend > 0 ? `消費滿 $${c.minSpend} 可用` : '無最低消費')}
                        {c.modeOnly ? ` ・ 限${MODES.find(m => m.id === c.modeOnly)?.name}` : ''}
                      </div>
                    </div>
                    <div className="coupon-discount">
                      {c.type === 'fixed' ? `-$${c.discount}` : `${100 - c.discount}折`}
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div className="redeem-row">
              <input className="redeem-input" placeholder="請輸入兌換碼" value={redeemCode}
                onChange={e => setRedeemCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRedeemCode()} />
              <button className="redeem-btn" onClick={handleRedeemCode}>兌換</button>
            </div>
          </div>
        </div>
      )}
      {/* ═══ Settings Page ═══ */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-header">
            <button className="settings-back" onClick={() => setShowSettings(false)}>←</button>
            <div className="settings-brand">雲管家</div>
          </div>
          <div className="settings-content">
            <div className="settings-card">
              <div className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-row-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="settings-row-label">用戶ID</div>
                </div>
                <div className="settings-row-value">{user?.userId || 'N/A'}</div>
              </div>
              <div className="settings-row" style={{ cursor: 'pointer' }} onClick={() => showToast('個人資料功能開發中')}>
                <div className="settings-row-left">
                  <div className="settings-row-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2" strokeLinecap="round">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                  </div>
                  <div className="settings-row-label">個人資料</div>
                </div>
                <div className="settings-row-arrow">›</div>
              </div>
            </div>

            <div className="settings-card">
              <div className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-row-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12h14v4a4 4 0 01-4 4H9a4 4 0 01-4-4v-4z"/>
                      <path d="M5 12V8a4 4 0 014-4h6a4 4 0 014 4v4"/>
                      <line x1="12" y1="16" x2="12" y2="16"/>
                    </svg>
                  </div>
                  <div className="settings-row-label">優惠券到期提示</div>
                </div>
                <div className={`toggle-switch ${notifCoupon ? 'on' : ''}`} onClick={() => setShowNotAvailable(true)} />
              </div>
              <div className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-row-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <circle cx="12" cy="13" r="5"/>
                      <path d="M12 8v5l3 2"/>
                    </svg>
                  </div>
                  <div className="settings-row-label">衣物洗好提示</div>
                </div>
                <div className={`toggle-switch ${notifLaundry ? 'on' : ''}`} onClick={() => setShowNotAvailable(true)} />
              </div>
            </div>

            <div className="settings-card">
              <div className="settings-row" style={{ cursor: 'pointer' }} onClick={() => showToast('服務條款載入中...')}>
                <div className="settings-row-left">
                  <div className="settings-row-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                  </div>
                  <div className="settings-row-label">服務條款</div>
                </div>
                <div className="settings-row-arrow">›</div>
              </div>
              <div className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-row-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div className="settings-row-label">當前版本號</div>
                </div>
                <div className="settings-row-value">V2.0.0</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ News List Page ═══ */}
      {showNewsPage && !selectedNews && (
        <div className="fullpage-overlay">
          <div className="fullpage-header">
            <div className="fullpage-header-top">
              <button className="fullpage-back" onClick={() => setShowNewsPage(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="fullpage-title">最新消息</div>
            </div>
          </div>
          <div className="fullpage-body">
            {NEWS_ITEMS.map(news => (
              <div key={news.id} onClick={() => setSelectedNews(news)}
                style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                <div style={{ width: 110, height: 80, borderRadius: 10, background: 'linear-gradient(135deg, #2A2A2A, #1A1A1A)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#FFF', marginBottom: 6, lineHeight: 1.3 }}>{news.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{news.desc}</div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, alignSelf: 'center', flexShrink: 0 }}>›</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ News Detail Page ═══ */}
      {selectedNews && (
        <div className="fullpage-overlay">
          <div className="fullpage-header">
            <div className="fullpage-header-top">
              <button className="fullpage-back" onClick={() => setSelectedNews(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="fullpage-title">最新消息</div>
            </div>
          </div>
          <div className="fullpage-body">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FFF', marginBottom: 8, lineHeight: 1.4 }}>{selectedNews.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              {selectedNews.tag && <span style={{ background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{selectedNews.tag}</span>}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{selectedNews.author}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{selectedNews.date}發佈</span>
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 2, whiteSpace: 'pre-wrap' }}>
              {selectedNews.content}
            </div>
            {/* Bottom social links */}
            <div style={{ display: 'flex', gap: 10, marginTop: 40, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                <IconMachine size={16} color="#888" /> 機器狀態
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                <IconStore size={16} color="#888" /> 雲管家門市
              </button>
              <button onClick={() => window.open('https://line.me/R/ti/p/@ypure', '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#06C755"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755z"/></svg>
                聯繫我們
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Store Selection Modal ═══ */}
      {showStoreModal && (
        <div className="modal-overlay" onClick={() => setShowStoreModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '70vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="modal-title" style={{ margin: 0 }}>門市選擇</div>
              <button onClick={() => setShowStoreModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: 'var(--text-sub)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>請輸入門市</span>
            </div>
            {STORES.map(store => (
              <div key={store.id}
                onClick={() => { handleStoreSelect(store); setShowStoreModal(false); }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: selectedStore?.id === store.id ? '#C8A84E' : '#FFF' }}>{store.name}</span>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: selectedStore?.id === store.id ? '2px solid #C8A84E' : '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedStore?.id === store.id && <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#C8A84E' }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Machine Selection Modal ═══ */}
      {showMachineModal && selectedStore && (
        <div className="modal-overlay" onClick={() => setShowMachineModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="modal-title" style={{ margin: 0 }}>機器選擇</div>
              <button onClick={() => setShowMachineModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: 'var(--text-sub)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
              {[{ key: 'washer', label: '洗脫烘一體機' }, { key: 'dryer', label: '烘乾機' }, { key: 'vending', label: '販賣機' }].map(t => (
                <button key={t.key} onClick={() => setMachineModalTab(t.key)}
                  style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: machineModalTab === t.key ? '2px solid #4A90D9' : '2px solid transparent', color: machineModalTab === t.key ? '#FFF' : 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t.label}
                </button>
              ))}
            </div>
            {machineModalTab === 'washer' && Array.from({ length: selectedStore.machines }, (_, i) => {
              const mid = `${selectedStore.id}-m${i + 1}`;
              const state = getMachineState(mid);
              const isRunning = state.status === 'running';
              return (
                <div key={mid} onClick={() => { if (!isRunning) { setSelectedMachine(mid); setShowMachineModal(false); setScreen('modes'); } }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: isRunning ? 'default' : 'pointer', opacity: isRunning ? 0.5 : 1 }}>
                  <WasherIcon size={32} running={isRunning} />
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>洗脫烘{i + 1}號(大型){isRunning ? <span style={{ color: '#E57373', marginLeft: 8 }}>(使用中)</span> : ''}</span>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: selectedMachine === mid ? '2px solid #C8A84E' : '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedMachine === mid && <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#C8A84E' }} />}
                  </div>
                </div>
              );
            })}
            {machineModalTab === 'dryer' && Array.from({ length: selectedStore.dryers || 2 }, (_, i) => {
              const did = `${selectedStore.id}-d${i + 1}`;
              const dryerNum = selectedStore.machines + i + 1;
              return (
                <div key={did} onClick={() => { setSelectedMachine(did); setShowMachineModal(false); setScreen('modes'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                  <DryerIcon size={32} />
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>烘乾{String(dryerNum).padStart(2,'0')}號({i === 0 ? '上' : '下'})</span>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: selectedMachine === did ? '2px solid #C8A84E' : '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedMachine === did && <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#C8A84E' }} />}
                  </div>
                </div>
              );
            })}
            {machineModalTab === 'vending' && (
              <div onClick={() => { setSelectedMachine(`${selectedStore.id}-v1`); setShowMachineModal(false); setScreen('modes'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 4px', cursor: 'pointer' }}>
                <VendingIcon size={32} />
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>販賣機</span>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #C8A84E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#C8A84E' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Not Available Modal ═══ */}
      {showNotAvailable && (
        <div className="not-available-overlay" onClick={() => setShowNotAvailable(false)}>
          <div className="not-available-box" onClick={e => e.stopPropagation()}>
            <div className="not-available-icon">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                <rect x="20" y="35" width="60" height="45" rx="6" stroke="#CCC" strokeWidth="3" fill="#F5F5F5"/>
                <path d="M35 35V25a15 15 0 0130 0v10" stroke="#CCC" strokeWidth="3" fill="none"/>
                <line x1="35" y1="28" x2="30" y2="20" stroke="#DDD" strokeWidth="2"/>
                <line x1="50" y1="25" x2="50" y2="15" stroke="#DDD" strokeWidth="2"/>
                <line x1="65" y1="28" x2="70" y2="20" stroke="#DDD" strokeWidth="2"/>
                <path d="M38 55h24" stroke="#DDD" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M42 62h16" stroke="#DDD" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="not-available-text">暫未開放</div>
            <button className="not-available-btn" onClick={() => setShowNotAvailable(false)}>確定</button>
          </div>
        </div>
      )}
    </>
  );
}
