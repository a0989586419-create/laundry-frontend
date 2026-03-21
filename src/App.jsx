import { useState, useEffect, useCallback, useRef } from 'react';

/* ──────────────────────────────────────────────
   雲管家  YPURE Cloud Butler
   React + Vite — App.jsx (v3 NIKKO-style UI)
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

// ─── CSS Styles ───
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;900&display=swap');

:root {
  --primary: #3A3A8C;
  --primary-dark: #1A1A50;
  --primary-mid: #2E2E78;
  --accent: #E5B94C;
  --accent-light: #F0D078;
  --bg: #F2F3F7;
  --card: #FFFFFF;
  --text: #1A1A3A;
  --text-sub: #6A6A90;
  --text-hint: #9A9AB8;
  --success: #34C759;
  --warning: #FF9500;
  --danger: #FF3B30;
  --running: #FF6B2B;
  --radius: 16px;
  --radius-sm: 12px;
  --shadow: 0 2px 16px rgba(30, 30, 80, 0.06);
  --shadow-lg: 0 6px 32px rgba(30, 30, 80, 0.10);
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

#root { min-height: 100vh; }

/* ═══ Loading Screen ═══ */
.loading-screen {
  position: fixed; inset: 0; z-index: 9999;
  background: linear-gradient(160deg, #141435 0%, #1E1E55 35%, #2D2D78 70%, #3A3A8C 100%);
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
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ═══ Dark Header ═══ */
.dark-header {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-mid) 100%);
  padding: 0 20px;
  padding-top: env(safe-area-inset-top, 12px);
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
  border-top: 1px solid rgba(255,255,255,0.12);
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
  padding: 0 18px 120px;
}

/* ═══ Section Divider (NIKKO style) ═══ */
.section-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 28px 0 18px;
}
.section-divider::before,
.section-divider::after {
  content: ''; flex: 1; height: 1px;
  background: #D0D0E0;
}
.section-divider-text {
  font-size: 22px; font-weight: 700;
  color: var(--primary-dark);
  white-space: nowrap;
}

/* ═══ Section Title ═══ */
.sec-title {
  font-size: 24px; font-weight: 800;
  color: var(--primary-dark);
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
  color: var(--primary); font-size: 18px; font-weight: 600;
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
  border-radius: var(--radius);
  padding: 22px 18px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.2s;
  border: 2.5px solid transparent;
  position: relative;
}
.store-card:active { transform: scale(0.97); }
.store-card.selected { border-color: var(--primary); background: #F0F0FF; }
.store-card .s-name {
  font-size: 21px; font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 10px;
  line-height: 1.3;
}
.store-card .s-addr {
  font-size: 15px; color: var(--text-sub);
  line-height: 1.5; margin-bottom: 14px;
}
.store-card .s-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 14px; font-weight: 600;
  color: var(--primary); background: #EDEDFF;
  padding: 5px 14px; border-radius: 8px;
}
.store-select-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: 2px solid var(--primary-dark);
  background: transparent; color: var(--primary-dark);
  padding: 10px 22px; border-radius: 24px;
  font-size: 17px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.store-select-btn:active { background: var(--primary-dark); color: white; }
.store-select-btn.active {
  background: var(--primary-dark); color: white;
}

/* ═══ Machine List (NIKKO horizontal row style) ═══ */
.machine-list { display: flex; flex-direction: column; gap: 0; }
.machine-row {
  display: flex; align-items: center; gap: 16px;
  padding: 20px 20px;
  background: var(--card);
  border-bottom: 1px solid #ECECF2;
  cursor: pointer;
  transition: background 0.15s;
}
.machine-row:first-child { border-radius: var(--radius) var(--radius) 0 0; }
.machine-row:last-child { border-radius: 0 0 var(--radius) var(--radius); border-bottom: none; }
.machine-row:only-child { border-radius: var(--radius); }
.machine-row:active { background: #F6F6FC; }
.machine-icon-box {
  width: 60px; height: 60px; flex-shrink: 0;
  border-radius: 14px; background: #F4F5FA;
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
.m-btn-running { background: #B0B0B8; color: white; cursor: pointer; }
.m-btn-extend { background: var(--warning); color: white; font-size: 16px; line-height: 1.3; }
.m-btn-offline { background: #D8D8DC; color: #999; cursor: not-allowed; }

/* ═══ Mode Grid (NIKKO 2×3 style) ═══ */
.mode-section-header {
  font-size: 19px; font-weight: 600;
  color: var(--text); margin-bottom: 14px;
}
.mode-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.mode-cell {
  background: var(--card);
  border: 2.5px solid #E8E8F0;
  border-radius: var(--radius-sm);
  padding: 22px 10px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
}
.mode-cell:active { transform: scale(0.95); }
.mode-cell.selected {
  border-color: var(--primary);
  background: #F0F0FF;
  box-shadow: 0 0 0 1px var(--primary);
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

/* ═══ Extra Options Row ═══ */
.options-row {
  display: flex; gap: 8px; margin-top: 16px;
  flex-wrap: wrap;
}
.opt-chip {
  padding: 11px 20px;
  border-radius: 10px;
  font-size: 16px; font-weight: 600;
  border: none; cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  background: #2A2A50; color: white;
}
.opt-chip.off { background: #E8E8F0; color: var(--text); }
.opt-chip:active { transform: scale(0.95); }

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
  border: 2px solid #E0E0E8;
  background: white; color: var(--text);
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.temp-btn.active {
  background: var(--primary); border-color: var(--primary);
  color: white;
}
.temp-btn:active { transform: scale(0.95); }

/* ═══ Bottom Pay Bar (NIKKO style) ═══ */
.pay-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 200;
}
.pay-bar-inner {
  max-width: 520px; margin: 0 auto;
  background: var(--primary-dark);
  border-radius: 20px 20px 0 0;
  padding: 20px 24px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
}
.pay-bar-price {
  flex: 1;
}
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
  background: white;
  width: 100%; max-width: 520px;
  border-radius: 24px 24px 0 0;
  padding: 32px 24px;
  padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px));
  animation: sheetUp 0.3s ease;
}
@keyframes sheetUp { from { transform: translateY(100%); } }
.modal-title {
  font-size: 24px; font-weight: 800;
  color: var(--primary-dark); margin-bottom: 24px;
  text-align: center;
}
.modal-row {
  display: flex; justify-content: space-between;
  padding: 13px 0;
  font-size: 18px; color: var(--text);
  border-bottom: 1px solid #F0F0F4;
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
.modal-cancel { background: #F0F0F4; color: var(--text-sub); }
.modal-confirm {
  background: linear-gradient(135deg, #00C755, #00B040);
  color: white;
}
.modal-confirm:active { transform: scale(0.97); }

/* ═══ Toast ═══ */
.toast {
  position: fixed; top: 80px; left: 50%;
  transform: translateX(-50%);
  background: var(--primary-dark);
  color: white; padding: 16px 30px;
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
  background: var(--primary);
  color: white; font-size: 19px;
  font-weight: 700; cursor: pointer;
  font-family: inherit;
}
.result-btn:active { transform: scale(0.97); }
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


// ═══════════════════════════════════════
//  Main App Component
// ═══════════════════════════════════════
export default function App() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('stores');
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [machineStates, setMachineStates] = useState({});
  const [toast, setToast] = useState(null);
  const [payResult, setPayResult] = useState(null);
  const [dryTemp, setDryTemp] = useState('high');
  const timerIntervalRef = useRef(null);

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
          await window.liff.init({ liffId: LIFF_ID });
          if (!window.liff.isLoggedIn()) { window.liff.login(); return; }
          const profile = await window.liff.getProfile();
          setUser({
            name: profile.displayName,
            picture: profile.pictureUrl,
            userId: profile.userId,
          });
        } else {
          setUser({ name: '柏宏', picture: '', userId: 'dev-user' });
        }
      } catch (err) {
        console.error('LIFF init error:', err);
        setUser({ name: '訪客', picture: '', userId: 'guest' });
      }
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

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setSelectedMachine(null);
    setSelectedMode(null);
    fetchMachineStates(store.id);
    setScreen('machines');
  };

  const handleMachineSelect = (machineId) => {
    const state = machineStates[machineId];
    if (state?.status === 'running') { setSelectedMachine(machineId); setScreen('running'); return; }
    if (state?.status === 'offline') { showToast('此機器暫時無法使用'); return; }
    setSelectedMachine(machineId);
    setSelectedMode(null);
    setScreen('modes');
  };

  const handlePay = () => {
    if (!selectedMode) { showToast('請先選擇洗衣模式'); return; }
    setScreen('confirm');
  };

  const startPayment = async () => {
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
          amount: selectedMode?.price,
          minutes: selectedMode?.minutes,
          dryTemp,
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
        if (data.storeId && data.machineId) {
          setMachineStates(prev => ({
            ...prev,
            [data.machineId]: { status: 'running', remaining: (data.minutes || 65) * 60, mode: data.mode },
          }));
        }
      } else { setPayResult('cancel'); setScreen('result'); }
    } catch { setPayResult('cancel'); setScreen('result'); }
  };

  const goBack = () => {
    if (screen === 'machines') { setScreen('stores'); setSelectedStore(null); }
    else if (screen === 'modes') { setScreen('machines'); setSelectedMachine(null); }
    else if (screen === 'confirm') { setScreen('modes'); }
    else if (screen === 'running') { setScreen('machines'); setSelectedMachine(null); }
    else if (screen === 'result') { setScreen('stores'); setSelectedStore(null); setSelectedMachine(null); setSelectedMode(null); }
  };

  const getMachineState = (machineId) => machineStates[machineId] || { status: 'idle', remaining: 0 };

  // ── Timer ring for running detail ──
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

      <div className="app-shell">
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

          {/* ═══ Store Selection ═══ */}
          {screen === 'stores' && (
            <>
              <div className="sec-title">選擇店家</div>
              <div className="store-scroll">
                {STORES.map(store => (
                  <div key={store.id} className="store-card"
                    onClick={() => handleStoreSelect(store)}>
                    <div className="s-name">{store.name}</div>
                    <div className="s-addr">📍 {store.addr}</div>
                    <button className="store-select-btn" onClick={(e) => { e.stopPropagation(); handleStoreSelect(store); }}>
                      選擇
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ Machine List ═══ */}
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

          {/* ═══ Running Detail ═══ */}
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

          {/* ═══ Mode Selection (NIKKO 2×3 grid) ═══ */}
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
                    onClick={() => setSelectedMode(mode)}>
                    <div className="mode-dot" style={{ background: mode.color }} />
                    <div className="mode-cell-name">{mode.name}</div>
                    <div className="mode-cell-price">NT${mode.price}</div>
                  </div>
                ))}
              </div>

              {/* Dryer temp selector */}
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

              {/* Mode detail info */}
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
            </>
          )}

          {/* ═══ Payment Result ═══ */}
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
              <button className="result-btn" onClick={goBack}>返回首頁</button>
            </div>
          )}

          {/* ═══ Paying Loading ═══ */}
          {screen === 'paying' && (
            <div className="result-container">
              <div className="result-icon">⏳</div>
              <div className="result-title">正在導向 LINE Pay...</div>
              <div className="loading-dots" style={{ justifyContent: 'center', marginTop: 28 }}>
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Bottom Pay Bar (NIKKO style) ═══ */}
      {screen === 'modes' && (
        <div className="pay-bar">
          <div className="pay-bar-inner">
            <div className="pay-bar-price">
              <div className="pay-bar-label">付款金額</div>
              <div className="pay-bar-amount">
                <span>$ </span>{selectedMode?.price || '—'}
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

      {/* ═══ Confirm Modal ═══ */}
      {screen === 'confirm' && (
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
            <div className="modal-row total">
              <span className="label">應付金額</span>
              <span className="value">NT${selectedMode?.price}</span>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setScreen('modes')}>取消</button>
              <button className="modal-confirm" onClick={startPayment}>💳 LINE Pay</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
