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
  { id: 's1', name: '悠洗自助洗衣',           addr: '嘉義市東區文雅街181號',       machines: 6 },
  { id: 's2', name: '吼你洗自助洗衣(玉清店)', addr: '苗栗縣苗栗市玉清路51號',      machines: 6 },
  { id: 's3', name: '吼你洗自助洗衣(農會店)', addr: '苗栗縣苗栗市為公路290號',     machines: 6 },
  { id: 's4', name: '熊愛洗自助洗衣',         addr: '台中市西屯區福聯街22巷2號',    machines: 6 },
  { id: 's5', name: '上好洗自助洗衣',         addr: '高雄市鳳山區北平路214號',      machines: 6 },
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

// ─── 預設最新消息 ───
const NEWS_ITEMS = [
  { id: 'n1', title: '🎉 開幕優惠！儲值500送50', date: '2026-03-20', content: '即日起儲值500元送50點，限時優惠中！' },
  { id: 'n2', title: '🔧 熊愛洗3號機維修完成', date: '2026-03-18', content: '台中熊愛洗3號機已修復，歡迎使用。' },
  { id: 'n3', title: '📢 新增悠洗自助洗衣店', date: '2026-03-15', content: '嘉義文雅街新店正式上線！' },
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
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(200,168,78,0.06) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255,255,255,0.02) 0%, transparent 40%),
    linear-gradient(180deg, #0C0C0C 0%, #080808 100%);
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

.home-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 10px; margin-bottom: 20px;
}
.home-grid-card {
  background: var(--card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-sm);
  padding: 20px 16px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: transform 0.1s;
  border: 1px solid var(--card-border);
}
.home-grid-card:active { transform: scale(0.97); }
.home-grid-icon { margin-bottom: 12px; text-align: center; }
.home-grid-label {
  font-size: 17px; font-weight: 700; color: var(--text);
}
.home-grid-sub {
  font-size: 13px; color: var(--text-sub); margin-top: 4px;
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
  padding: 16px 8px; margin-bottom: 20px; box-shadow: var(--shadow);
}
.home-quick-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer; font-family: inherit;
  padding: 6px 8px; transition: transform 0.1s;
}
.home-quick-item:active { transform: scale(0.93); }
.home-quick-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
}
.home-quick-label { font-size: 12px; font-weight: 600; color: var(--text-sub); }

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
function WasherIcon({ running }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="3" y="2" width="30" height="32" rx="4" stroke={running ? '#FF6B2B' : '#8888AA'} strokeWidth="2" fill="none" />
      <circle cx="18" cy="20" r="8" stroke={running ? '#FF6B2B' : '#8888AA'} strokeWidth="2" fill="none" />
      {running && <circle cx="18" cy="20" r="4" fill="#FF6B2B" opacity="0.3">
        <animateTransform attributeName="transform" type="rotate" from="0 18 20" to="360 18 20" dur="2s" repeatCount="indefinite" />
      </circle>}
      <circle cx="10" cy="7" r="1.5" fill={running ? '#FF6B2B' : '#B0B0C0'} />
      <circle cx="15" cy="7" r="1.5" fill={running ? '#FF6B2B' : '#B0B0C0'} />
      <rect x="22" y="5.5" width="6" height="3" rx="1.5" stroke={running ? '#FF6B2B' : '#B0B0C0'} strokeWidth="1" fill="none" />
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
                <img src="/ypure-logo.png" alt="YPURE" className="dark-header-logo" />
              </div>
              <div className="dark-header-brand">雲管家</div>
            </div>
            {user && (
              <div className="dark-header-user">
                {user.picture ? (
                  <img src={user.picture} className="dark-header-avatar" alt="" />
                ) : (
                  <div className="dark-header-avatar-text">{user.name?.[0] || '?'}</div>
                )}
                <div className="dark-header-welcome">
                  歡迎，<strong>{user.name}</strong>！
                </div>
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
                  <div className="home-wallet-title">我的點數餘額</div>
                  <div className="home-wallet-points">{points}<span>點</span></div>
                  <div className="home-wallet-actions">
                    <button className="home-wallet-btn topup" onClick={handleTopup}>$ 儲值</button>
                    <button className="home-wallet-btn history" onClick={() => switchTab('history')}>交易記錄 →</button>
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
                  <div className="home-quick-label">門市查詢</div>
                </button>
                <button className="home-quick-item" onClick={() => switchTab('profile')}>
                  <div className="home-quick-icon"><IconShirt size={24} color="#AAA" /></div>
                  <div className="home-quick-label">優惠中心</div>
                </button>
              </div>

              <div className="home-grid">
                <div className="home-grid-card" onClick={() => switchTab('wash')} style={{ gridRow: 'span 2' }}>
                  <div className="home-grid-icon"><IconCoupon size={48} color="#888" /></div>
                  <div className="home-grid-label">優惠中心</div>
                  <div className="home-grid-sub">洗衣天天享折扣</div>
                </div>
                <div className="home-grid-card" onClick={() => switchTab('wash')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="home-grid-label">機器狀態</div>
                      <div className="home-grid-sub">查詢狀態最即時</div>
                    </div>
                    <IconMachine size={28} color="#888" />
                  </div>
                </div>
                <div className="home-grid-card" onClick={() => switchTab('history')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="home-grid-label">最新消息</div>
                      <div className="home-grid-sub">活動訊息不漏接</div>
                    </div>
                    <IconNews size={28} color="#888" />
                  </div>
                </div>
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
                  <div className="store-search">
                    <span className="store-search-icon">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="5.5"/><line x1="12" y1="12" x2="16" y2="16"/></svg>
                    </span>
                    <input className="store-search-input" placeholder="請輸入門市名稱或地址"
                      value={storeSearch} onChange={e => setStoreSearch(e.target.value)} />
                  </div>
                  <div className="store-scroll">
                    {STORES.filter(s => !storeSearch || s.name.includes(storeSearch) || s.addr.includes(storeSearch)).map(store => (
                      <div key={store.id} className="store-card"
                        onClick={() => handleStoreSelect(store)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div className="s-name">{store.name}</div>
                          <IconWasher size={36} color="#555" />
                        </div>
                        <div className="s-addr" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="6" r="3" stroke="#C8A84E" strokeWidth="1.5"/><path d="M7 1C4.2 1 2 3.5 2 6.2 2 9.5 7 13 7 13s5-3.5 5-6.8C12 3.5 9.8 1 7 1z" stroke="#C8A84E" strokeWidth="1.5"/></svg>
                          {store.addr}
                        </div>
                        <button className="store-select-btn" onClick={(e) => { e.stopPropagation(); handleStoreSelect(store); }}>
                          選擇
                        </button>
                      </div>
                    ))}
                    {STORES.filter(s => !storeSearch || s.name.includes(storeSearch) || s.addr.includes(storeSearch)).length === 0 && (
                      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-hint)', fontSize: 16, width: '100%' }}>
                        找不到符合的門市
                      </div>
                    )}
                  </div>
                </>
              )}

              {screen === 'machines' && selectedStore && (
                <>
                  <button className="back-btn" onClick={goBack}>← 返回店家</button>
                  <div className="sec-title">{selectedStore.name}</div>
                  <div className="section-divider">
                    <span className="section-divider-text">洗脫烘一機完成</span>
                  </div>
                  <div className="machine-list" style={{ boxShadow: 'var(--shadow)', borderRadius: 'var(--radius)' }}>
                    {Array.from({ length: selectedStore.machines }, (_, i) => {
                      const mid = `${selectedStore.id}-m${i + 1}`;
                      const state = getMachineState(mid);
                      const isRunning = state.status === 'running';
                      const isOffline = state.status === 'offline';
                      return (
                        <div key={mid} className="machine-row" onClick={() => handleMachineSelect(mid)}>
                          <div className="machine-icon-box">
                            <WasherIcon running={isRunning} />
                          </div>
                          <div className="machine-info">
                            <div className="machine-name">洗脫烘{i + 1}號(中型)</div>
                            {isRunning && state.remaining > 0 && (
                              <div className="machine-timer">
                                <ClockIcon /> {formatTime(state.remaining)}
                              </div>
                            )}
                          </div>
                          <div className="machine-actions">
                            {isRunning ? (
                              <>
                                <button className="m-btn m-btn-running">運轉</button>
                                <button className="m-btn m-btn-extend">烘乾<br/>延長</button>
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
                <>
                  <button className="back-btn" onClick={goBack}>← 返回機器選擇</button>
                  <div className="sec-title">店內消費</div>
                  <div style={{ fontSize: 18, color: 'var(--text-sub)', marginBottom: 6 }}>
                    {selectedStore?.name} — 洗脫烘{selectedMachine.split('-m')[1]}號(中型)
                  </div>
                  <div className="section-divider">
                    <span className="section-divider-text">選擇洗衣模式</span>
                  </div>
                  <div className="mode-grid">
                    {MODES.map(mode => (
                      <div key={mode.id}
                        className={`mode-cell ${selectedMode?.id === mode.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedMode(mode); setSelectedCoupon(null); }}>
                        <div className="mode-dot" style={{ background: mode.color }} />
                        <div className="mode-cell-name">{mode.name}</div>
                        <div className="mode-cell-price">NT${mode.price}</div>
                      </div>
                    ))}
                  </div>

                  {selectedMode && selectedMode.id !== 'dryonly' && (
                    <>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-sub)', marginTop: 16, marginBottom: 4 }}>洗劑選擇</div>
                      <div className="addon-row">
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
                    </>
                  )}

                  {selectedMode && selectedMode.id !== 'washonly' && (
                    <div className="temp-row">
                      <div className="temp-label">烘衣溫度</div>
                      {['low', 'mid', 'high'].map(t => (
                        <button key={t}
                          className={`temp-btn ${dryTemp === t ? 'active' : ''}`}
                          onClick={() => setDryTemp(t)}>
                          {t === 'low' ? '低溫' : t === 'mid' ? '中溫' : '高溫'}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedMode && selectedMode.id !== 'washonly' && (
                    <div className="extend-row">
                      <div className="extend-label">烘乾延長</div>
                      <select className="extend-select" value={dryExtend} onChange={e => setDryExtend(Number(e.target.value))}>
                        <option value={0}>0 min</option>
                        <option value={10}>+10 min ($20)</option>
                        <option value={20}>+20 min ($35)</option>
                        <option value={30}>+30 min ($50)</option>
                      </select>
                    </div>
                  )}

                  {selectedMode && (
                    <div style={{
                      background: 'var(--card)', borderRadius: 'var(--radius-sm)',
                      padding: '16px 18px', marginTop: 16,
                      display: 'flex', justifyContent: 'space-between', fontSize: 18
                    }}>
                      <span style={{ color: 'var(--text-sub)' }}>預計時間</span>
                      <span style={{ fontWeight: 700 }}>{selectedMode.minutes} 分鐘</span>
                    </div>
                  )}

                  {selectedMode && (
                    <>
                      <div className="pay-toggle">
                        <button
                          className={`pay-toggle-btn ${payMethod === 'linepay' ? 'active' : ''}`}
                          onClick={() => setPayMethod('linepay')}>
                          錢包付款
                        </button>
                        <button
                          className={`pay-toggle-btn ${payMethod === 'wallet' ? 'active' : ''}`}
                          onClick={() => setPayMethod('wallet')}>
                          單次付款
                        </button>
                      </div>
                      {payMethod === 'wallet' && points < getFinalPrice() && (
                        <div className="points-banner">
                          <div className="points-banner-icon">⚠️</div>
                          <div className="points-banner-text">
                            餘額不足！需要 {getFinalPrice()} 點，目前只有 {points} 點
                          </div>
                          <button className="points-banner-btn" onClick={handleTopup}>儲值</button>
                        </div>
                      )}
                    </>
                  )}

                  {selectedMode && (
                    <div className="coupon-select-row" onClick={() => { setCouponTab('coupon'); setShowCouponModal(true); }}>
                      <div className="coupon-select-label">使用優惠</div>
                      <div className="coupon-select-value">
                        {selectedCoupon
                          ? `${selectedCoupon.name} (-$${selectedCoupon.type === 'fixed' ? selectedCoupon.discount : Math.round(selectedMode.price * selectedCoupon.discount / 100)})`
                          : getApplicableCoupons().length > 0
                            ? <span style={{ color: 'var(--accent)' }}>{getApplicableCoupons().length} 張可使用 →</span>
                            : <span style={{ color: 'var(--text-hint)' }}>暫無可用優惠</span>
                        }
                      </div>
                    </div>
                  )}
                </>
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

      {/* ═══ Topup Modal ═══ */}
      {showTopupModal && (
        <div className="modal-overlay" onClick={() => setShowTopupModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="modal-title" style={{ margin: 0 }}>$ 點數儲值</div>
              <button onClick={() => setShowTopupModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: 'var(--text-sub)', cursor: 'pointer', padding: '4px 8px' }}>✕</button>
            </div>
            <div style={{ fontSize: 16, color: 'var(--text-sub)', marginBottom: 16 }}>
              目前餘額：<strong style={{ color: 'var(--primary)' }}>{points} 點</strong>
            </div>
            <div className="topup-grid">
              {TOPUP_OPTIONS.map(opt => (
                <div key={opt.id}
                  className={`topup-card ${selectedTopup?.id === opt.id ? 'selected' : ''} ${opt.popular ? 'popular' : ''}`}
                  onClick={() => setSelectedTopup(opt)}>
                  <div className="topup-amount">{opt.label}</div>
                  <div className="topup-bonus">{opt.tag || ''}</div>
                </div>
              ))}
            </div>
            <div className="topup-custom">
              <div className="topup-custom-label">或自訂</div>
              <input className="topup-custom-input" type="number" placeholder="請輸入點數"
                value={customTopupAmount}
                onChange={e => { setCustomTopupAmount(e.target.value); setSelectedTopup(null); }} />
              <div className="topup-custom-label">點</div>
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 20, marginBottom: 8 }}>付款方式</div>
            <div className="pay-method-grid">
              {[
                { key: 'linepay', icon: 'L', label: 'LINE Pay', color: '#06C755' },
                { key: 'jkopay', icon: '街', label: '街口支付', color: '#E65100' },
                { key: 'applepay', icon: '⌘', label: 'Apple Pay', color: '#FFF' },
                { key: 'creditcard', icon: '卡', label: '信用卡', color: '#C8A84E' },
              ].map(m => (
                <div key={m.key} className={`pay-method-card ${topupPayMethod === m.key ? 'active' : ''}`}
                  onClick={() => setTopupPayMethod(m.key)}>
                  <span className="pay-method-icon" style={{ color: m.color, fontWeight: 900, fontSize: 16 }}>{m.icon}</span>
                  <span className="pay-method-name">{m.label}</span>
                </div>
              ))}
            </div>

            {(selectedTopup || customTopupAmount) && (
              <div style={{ marginTop: 16, padding: '14px 18px', background: '#111', borderRadius: 12, fontSize: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-sub)' }}>儲值金額</span>
                  <span style={{ fontWeight: 700 }}>${selectedTopup?.amount || customTopupAmount}</span>
                </div>
                {selectedTopup?.bonus > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-sub)' }}>贈送點數</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>+{selectedTopup.bonus} 點</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #2A2A2A' }}>
                  <span style={{ fontWeight: 700 }}>實際獲得</span>
                  <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: 20 }}>
                    {selectedTopup ? selectedTopup.amount + selectedTopup.bonus : customTopupAmount} 點
                  </span>
                </div>
              </div>
            )}
            <button
              className={`topup-confirm-btn ${(selectedTopup || customTopupAmount) ? 'ready' : 'disabled'}`}
              onClick={confirmTopup} disabled={!(selectedTopup || customTopupAmount)}>
              {selectedTopup ? `確認儲值 $${selectedTopup.amount}` : customTopupAmount ? `確認儲值 $${customTopupAmount}` : '請選擇儲值方案'}
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
    </>
  );
}
