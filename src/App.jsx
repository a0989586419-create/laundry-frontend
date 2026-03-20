import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════
//  設定區 — 部署時修改這裡
// ══════════════════════════════════════════════════════════════
const CONFIG = {
  LIFF_ID:    "2009551849-ABLT50IT",            // LINE Developers 取得
  API_BASE:   "https://你的伺服器網址.com", // server.js 的網址
  WS_URL:     "wss://你的伺服器網址.com",  // WebSocket（即時狀態）
};

// ══════════════════════════════════════════════════════════════
//  LIFF SDK 模擬（開發測試用）
//  實際部署在 index.html 加入：
//  <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
// ══════════════════════════════════════════════════════════════
const IS_DEV = !window.liff;
const liff = IS_DEV ? {
  init: async () => { await new Promise(r => setTimeout(r, 700)); },
  isLoggedIn: () => true,
  getProfile: async () => ({
    userId: "U_demo_user_123",
    displayName: "王小明",
    pictureUrl: null,
  }),
  openWindow: ({ url }) => window.open(url, '_blank'),
  closeWindow: () => {},
  isInClient: () => false,
} : window.liff;

// ══════════════════════════════════════════════════════════════
//  設計系統
// ══════════════════════════════════════════════════════════════
const C = {
  bg: "#F5F4F0", dark: "#111111", white: "#FFFFFF",
  teal: "#1A7F5A", tealLight: "#E8F5EE", tealBright: "#22C55E",
  orange: "#F97316", orangeLight: "#FFF3E0",
  muted: "#888888", border: "#E8E8E8",
  line: "#06C755",
  error: "#EF4444", errorLight: "#FEE2E2",
};

const WASH_MODES = [
  { id:"standard", label:"洗脫烘-標準", price:160, min:65,  hasDry:true  },
  { id:"small",    label:"洗脫烘-少量", price:130, min:50,  hasDry:true  },
  { id:"washonly", label:"只要洗衣",    price:80,  min:35,  hasDry:false },
  { id:"soft",     label:"洗脫烘-輕柔", price:160, min:65,  hasDry:true  },
  { id:"strong",   label:"洗脫烘-強勁", price:180, min:75,  hasDry:true  },
  { id:"dryonly",  label:"只要烘乾",    price:60,  min:40,  hasDry:true  },
];
const ADDONS = [
  { id:"det", label:"洗衣精",   price:10 },
  { id:"sof", label:"柔軟精",   price:10 },
  { id:"deg", label:"脫脂酵素", price:20 },
  { id:"ant", label:"除菌酵素", price:20 },
];

// ══════════════════════════════════════════════════════════════
//  API 工具
// ══════════════════════════════════════════════════════════════
async function api(method, path, body) {
  const res = await fetch(CONFIG.API_BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ══════════════════════════════════════════════════════════════
//  WebSocket Hook — 即時接收機器狀態
// ══════════════════════════════════════════════════════════════
function useWebSocket(onMessage) {
  const ws = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    ws.current = new WebSocket(CONFIG.WS_URL);
    ws.current.onmessage = e => {
      try { onMessage(JSON.parse(e.data)); } catch {}
    };
    ws.current.onclose = () => {
      // 5 秒後重連
      reconnectTimer.current = setTimeout(connect, 5000);
    };
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);
}

// ══════════════════════════════════════════════════════════════
//  UI 元件
// ══════════════════════════════════════════════════════════════
function Toast({ msg, type = "ok" }) {
  return (
    <div style={{
      position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, padding: "11px 22px", borderRadius: 50, fontSize: 13,
      fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 6px 24px rgba(0,0,0,.25)",
      animation: "fadeDown .25s ease",
      background: type === "error" ? C.error : C.dark,
      color: "#fff",
    }}>
      {type === "error" ? "⚠️" : "✓"} {msg}
    </div>
  );
}

function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid #eee`,
      borderTop: `2px solid ${C.teal}`, borderRadius: "50%",
      animation: "spin .7s linear infinite", flexShrink: 0,
    }} />
  );
}

function WashIcon({ size = 48, status = "idle" }) {
  const col = status === "busy" ? C.orange : status === "done" ? C.tealBright : "#ccc";
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <rect x="5" y="6" width="46" height="40" rx="7"
        fill={status === "busy" ? "#fff8f0" : status === "done" ? "#f0faf4" : "#fafafa"}
        stroke={col} strokeWidth="2.5" />
      <circle cx="14" cy="15" r="3" fill={col} opacity=".8" />
      <circle cx="22" cy="15" r="2" fill={col} opacity=".5" />
      <rect x="32" y="11" width="14" height="7" rx="3.5" fill={col} opacity=".3" />
      <circle cx="28" cy="31" r="13" fill="#fff" stroke={col} strokeWidth="2" />
      <path d="M15 31 A13 13 0 0 1 41 31 Z"
        fill={status === "busy" ? "#93C5FD" : "#BFDBFE"} opacity=".9" />
      <path d="M15 31 A13 13 0 0 0 41 31 Z"
        fill={status === "busy" ? "#FB923C" : "#FED7AA"} opacity=".9" />
      <circle cx="28" cy="31" r="7" fill="none" stroke={col} strokeWidth="1.5" opacity=".6" />
      {status === "done" && (
        <path d="M23 31 l3.5 3.5 6-6" stroke={C.tealBright} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
    </svg>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      background: C.dark, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 10,
      position: "sticky", top: 0, zIndex: 90,
    }}>
      {onBack
        ? <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>‹</button>
        : <div style={{ width: 30 }} />}
      <div style={{ flex: 1, textAlign: "center" }}>
        <div style={{ color: "#666", fontSize: 10, letterSpacing: 2, fontWeight: 700 }}>悠洗洗衣</div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{title}</div>
      </div>
      {right || <div style={{ width: 30 }} />}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.white, borderRadius: 14, padding: "14px 16px",
      boxShadow: "0 1px 6px rgba(0,0,0,.07)", marginBottom: 10, ...style,
    }}>
      {children}
    </div>
  );
}

function MachineStatusBadge({ state, remainSec }) {
  if (state === "idle")
    return <span style={{ background: C.tealLight, color: C.teal, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>空閒</span>;
  if (state === "done")
    return <span style={{ background: "#DCFCE7", color: C.tealBright, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>完成 ✓</span>;
  if (state === "running" || state === "busy") {
    const min = Math.ceil((remainSec || 0) / 60);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ background: C.orangeLight, color: C.orange, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>使用中</span>
        <span style={{ fontSize: 11, color: C.muted }}>剩 {min} 分</span>
      </div>
    );
  }
  return <span style={{ background: "#F3F4F6", color: C.muted, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>離線</span>;
}

// ══════════════════════════════════════════════════════════════
//  PAGE：機器狀態（首頁）
// ══════════════════════════════════════════════════════════════
function MachinesPage({ user, onUse }) {
  const [stores, setStores]       = useState([]);
  const [storeId, setStoreId]     = useState(null);
  const [machines, setMachines]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const machinesRef = useRef([]);

  // 載入門市
  useEffect(() => {
    api("GET", "/api/stores").then(data => {
      setStores(data);
      if (data.length > 0) setStoreId(data[0].id);
    });
  }, []);

  // 載入機器
  const loadMachines = useCallback(async (sid, silent = false) => {
    if (!sid) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await api("GET", `/api/machines/${sid}`);
      setMachines(data);
      machinesRef.current = data;
    } catch {
      // 靜默失敗
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadMachines(storeId); }, [storeId]);

  // WebSocket 即時更新
  const handleWsMsg = useCallback((msg) => {
    if (msg.type !== "machine_status") return;
    const d = msg.data;
    setMachines(prev => prev.map(m =>
      m.id === d.machine_id
        ? { ...m, state: d.state, remain_sec: d.remain_sec, progress: d.progress }
        : m
    ));
  }, []);
  useWebSocket(handleWsMsg);

  // 每 30 秒輪詢一次（WebSocket 備援）
  useEffect(() => {
    const t = setInterval(() => loadMachines(storeId, true), 30000);
    return () => clearInterval(t);
  }, [storeId, loadMachines]);

  const idle = machines.filter(m => m.state === "idle" || m.state === "done");
  const busy = machines.filter(m => m.state !== "idle" && m.state !== "done" && m.state !== "unknown");

  return (
    <div>
      <TopBar title="機器狀態" right={
        refreshing
          ? <div style={{ width: 30, display: "flex", justifyContent: "center" }}><Spinner size={16} /></div>
          : <button onClick={() => loadMachines(storeId, true)} style={{ background: "none", border: "none", color: "#888", fontSize: 18, cursor: "pointer" }}>↻</button>
      } />
      <div style={{ padding: "12px 14px" }}>
        {/* 門市選擇 */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
          {stores.map(s => (
            <button key={s.id} onClick={() => setStoreId(s.id)} style={{
              flexShrink: 0, padding: "9px 18px", borderRadius: 50, border: "none",
              cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
              background: storeId === s.id ? C.dark : C.white,
              color: storeId === s.id ? "#fff" : C.muted,
              boxShadow: storeId === s.id ? "0 2px 12px rgba(0,0,0,.2)" : "0 1px 4px rgba(0,0,0,.06)",
            }}>
              {storeId === s.id ? "✓ " : ""}{s.name}
            </button>
          ))}
        </div>

        {/* 統計列 */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14, fontSize: 12 }}>
          <span style={{ color: C.teal, fontWeight: 700 }}>🟢 空閒 {idle.length} 台</span>
          <span style={{ color: C.orange, fontWeight: 700 }}>🟠 使用中 {busy.length} 台</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}><Spinner size={32} /></div>
        ) : (
          <>
            {/* 可用機器 */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>
              ── 洗脫烘一機完成 ──
            </div>
            {idle.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: C.muted, fontSize: 13 }}>
                目前所有機器均在使用中，請稍候
              </div>
            )}
            {idle.map(m => (
              <Card key={m.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <WashIcon size={48} status={m.state === "done" ? "done" : "idle"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.dark, marginBottom: 4 }}>
                      {m.name}（{m.size}）
                    </div>
                    <MachineStatusBadge state={m.state} remainSec={m.remain_sec} />
                  </div>
                  <button onClick={() => onUse(m, stores.find(s => s.id === storeId))} style={{
                    padding: "10px 22px", borderRadius: 12, border: "none",
                    background: m.state === "done" ? C.tealBright : C.teal,
                    color: "#fff", fontSize: 14, fontWeight: 800,
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: `0 4px 12px ${C.teal}44`,
                  }}>
                    使用
                  </button>
                </div>
              </Card>
            ))}

            {/* 使用中機器 */}
            {busy.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, margin: "14px 0 8px", letterSpacing: 1 }}>
                  ── 使用中 ──
                </div>
                {busy.map(m => (
                  <Card key={m.id} style={{ opacity: 0.75, border: `1.5px solid ${C.orangeLight}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <WashIcon size={48} status="busy" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: C.dark, marginBottom: 4 }}>
                          {m.name}（{m.size}）
                        </div>
                        <MachineStatusBadge state={m.state} remainSec={m.remain_sec} />
                        {m.remain_sec > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: 3,
                                background: `linear-gradient(to right, ${C.orange}, #FCD34D)`,
                                width: `${m.progress || 0}%`, transition: "width 1s",
                              }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PAGE：選模式 & 付款
// ══════════════════════════════════════════════════════════════
function PayPage({ machine, store, user, onBack, onPaid, onToast }) {
  const [payType,  setPayType]  = useState("linepay");
  const [modeId,   setModeId]   = useState("standard");
  const [addons,   setAddons]   = useState([]);
  const [extend,   setExtend]   = useState(0);
  const [temp,     setTemp]     = useState("高溫");
  const [coupon,   setCoupon]   = useState(null);
  const [showExt,  setShowExt]  = useState(false);
  const [showCoup, setShowCoup] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const mode      = WASH_MODES.find(m => m.id === modeId);
  const addonSum  = ADDONS.filter(a => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const extSum    = extend * 3;
  const subtotal  = mode.price + addonSum + extSum;
  const discount  = coupon ? Math.min(coupon.value, subtotal) : 0;
  const total     = subtotal - discount;
  const noDry     = modeId === "washonly";
  const noAddon   = modeId === "dryonly";
  const toggle    = id => setAddons(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1. 建立訂單
      const { orderId } = await api("POST", "/api/orders/create", {
        lineUserId: user.userId,
        storeId:    store.id,
        machineId:  machine.id,
        mode:       modeId,
        addons,
        extendMin:  extend,
        temp,
        totalAmount: total,
      });

      if (payType === "linepay") {
        // 2. 取得 LINE Pay 付款網址
        const { paymentUrl } = await api("POST", "/api/payment/linepay/request", { orderId });
        // 3. 導向 LINE Pay 付款頁
        liff.openWindow({ url: paymentUrl, external: false });
        // 付款完成後 server 會 redirect 回 LIFF，URL 帶有 result=success
        // 這裡等待 URL 參數變化
        onPaid({ orderId, mode, total, machine, store });
      } else {
        // 錢包付款（直接扣款，不導外頁）
        await api("POST", "/api/payment/wallet", { orderId, lineUserId: user.userId });
        onPaid({ orderId, mode, total, machine, store });
      }
    } catch (err) {
      onToast(err.message || "付款失敗，請重試", "error");
      setLoading(false);
    }
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar title="店內消費" onBack={onBack} />

      {/* 門市 & 機器資訊 */}
      <Card style={{ margin: "12px 14px 0", borderRadius: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 10 }}>
          <div style={{ width: 3, height: 18, background: C.dark, borderRadius: 2 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginLeft: 6 }}>門市選擇</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WashIcon size={40} status="idle" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.dark }}>悠洗洗衣</div>
            <div style={{ fontSize: 13, color: C.muted }}>
              {store.name} · {machine.name}（{machine.size}）
            </div>
          </div>
        </div>
      </Card>

      <div style={{ padding: "10px 14px 90px" }}>
        {/* 付款方式 */}
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { k: "linepay", l: "LINE Pay" },
              { k: "wallet",  l: "錢包付款" },
            ].map(({ k, l }) => (
              <button key={k} onClick={() => setPayType(k)} style={{
                padding: 12, borderRadius: 12, border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 14, fontWeight: 800,
                background: payType === k ? C.dark : C.bg,
                color: payType === k ? "#fff" : C.muted,
                boxShadow: payType === k ? "0 2px 10px rgba(0,0,0,.18)" : "none",
              }}>
                {k === "linepay" && <span style={{ color: payType === k ? C.line : C.line, marginRight: 4 }}>●</span>}
                {l}
              </button>
            ))}
          </div>
        </Card>

        {/* 洗衣模式 */}
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {WASH_MODES.map(m => {
              const on = modeId === m.id;
              return (
                <button key={m.id} onClick={() => setModeId(m.id)} style={{
                  padding: "11px 4px", borderRadius: 12, cursor: "pointer",
                  fontFamily: "inherit", border: `2px solid ${on ? C.dark : "transparent"}`,
                  background: on ? C.dark : C.bg,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: on ? "#fff" : "#e0e0e0",
                    overflow: "hidden", position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: "50%",
                      background: m.hasDry ? "#93C5FD" : "#BFDBFE",
                    }} />
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                      background: m.id !== "washonly" ? "#FB923C" : "transparent",
                    }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: 1.3, color: on ? "#fff" : C.dark }}>
                    {m.label}
                  </span>
                  <span style={{ fontSize: 10, color: on ? "#aaa" : C.muted }}>${m.price}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 10, textAlign: "center", fontSize: 12, color: C.muted }}>
            ⏱️ 預計 {mode.min + extend} 分鐘
          </div>
        </Card>

        {/* 添加劑 */}
        {!noAddon && (
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {ADDONS.map(a => {
                const on = addons.includes(a.id);
                return (
                  <button key={a.id} onClick={() => toggle(a.id)} style={{
                    padding: "10px 4px", borderRadius: 12, border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 12, fontWeight: 800,
                    background: on ? C.dark : C.bg, color: on ? "#fff" : C.dark,
                  }}>
                    {a.label}
                    <div style={{ fontSize: 10, color: on ? "#aaa" : C.muted, marginTop: 2 }}>+${a.price}</div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* 烘乾延長 */}
        {!noDry && (
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>烘乾延長</span>
              <button onClick={() => setShowExt(x => !x)} style={{
                padding: "8px 14px", borderRadius: 50, border: `1.5px solid ${C.border}`,
                background: C.bg, fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                {extend === 0 ? "0 min" : `+${extend} min`} {showExt ? "▲" : "▼"}
              </button>
            </div>
            {showExt && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 12 }}>
                {[0, 10, 20, 30].map(v => (
                  <button key={v} onClick={() => { setExtend(v); setShowExt(false); }} style={{
                    padding: 10, borderRadius: 10, border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 12, fontWeight: 800,
                    background: extend === v ? C.dark : C.bg, color: extend === v ? "#fff" : C.dark,
                  }}>
                    {v === 0 ? "不延" : `+${v}m`}
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* 烘衣溫度 */}
        {!noDry && (
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.dark, paddingRight: 4 }}>烘衣溫度</span>
              {["低溫", "中溫", "高溫"].map(t => (
                <button key={t} onClick={() => setTemp(t)} style={{
                  padding: "11px 4px", borderRadius: 12, border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 800,
                  background: temp === t ? C.dark : C.bg, color: temp === t ? "#fff" : C.muted,
                }}>
                  {t}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* 優惠券 */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>使用優惠</span>
            <button onClick={() => setShowCoup(x => !x)} style={{
              border: "none", background: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13, color: coupon ? C.teal : C.muted,
            }}>
              {coupon ? `已選 -$${coupon.value}` : "請選擇優惠券"} {showCoup ? "▲" : "▼"}
            </button>
          </div>
          {showCoup && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {[null, { id: "c1", label: "新會員優惠", value: 30 }, { id: "c2", label: "LINE 好友折扣", value: 20 }].map((c, i) => (
                <button key={i} onClick={() => { setCoupon(c); setShowCoup(false); }} style={{
                  padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600, textAlign: "left",
                  border: `1.5px solid ${coupon?.id === c?.id ? C.teal : C.border}`,
                  background: coupon?.id === c?.id ? C.tealLight : C.bg,
                  color: c ? C.teal : C.muted,
                }}>
                  {c ? `🎟️ ${c.label} — 折 $${c.value}` : "不使用優惠券"}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 固定底部 */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 480, margin: "0 auto",
        background: C.dark, padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ color: "#666", fontSize: 11 }}>付款金額</div>
          <div style={{ color: "#fff", fontSize: 30, fontWeight: 800 }}>$ {total}</div>
        </div>
        <button onClick={handlePay} disabled={loading} style={{
          padding: "14px 28px", borderRadius: 14, border: "none",
          background: loading ? "#555" : C.white,
          color: C.dark, fontSize: 15, fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {loading ? <><Spinner size={16} /> 處理中...</> : "確認付款"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PAGE：成功畫面
// ══════════════════════════════════════════════════════════════
function SuccessPage({ result, onTrack }) {
  const { machine, mode, total, store } = result;
  const [progress, setProgress] = useState(2);

  useEffect(() => {
    const t = setTimeout(() => setProgress(8), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: C.dark,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 32, gap: 22,
    }}>
      <div style={{ animation: "pop .5s ease" }}>
        <WashIcon size={80} status="busy" />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: C.tealBright, fontSize: 28, fontWeight: 800, marginBottom: 6 }}>🎉 啟動成功！</div>
        <div style={{ color: "#aaa", fontSize: 14 }}>{machine.name} 已開始運轉</div>
        <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>{store.name} · {mode.label} · NT${total}</div>
      </div>
      <div style={{ background: "#1C1C1E", borderRadius: 16, padding: 18, width: "100%", maxWidth: 320 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#aaa", marginBottom: 8 }}>
          <span>預估完成</span>
          <span style={{ color: "#fff", fontWeight: 700 }}>約 {mode.min} 分鐘後</span>
        </div>
        <div style={{ height: 8, background: "#333", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: `linear-gradient(to right, ${C.teal}, ${C.tealBright})`,
            borderRadius: 4, width: `${progress}%`, transition: "width 1.5s ease",
          }} />
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "#666", textAlign: "center" }}>
          完成後將推播 LINE 通知給您 🔔
        </div>
      </div>
      <button onClick={onTrack} style={{
        padding: "14px 0", borderRadius: 14, border: "none",
        background: C.white, color: C.dark,
        fontSize: 15, fontWeight: 800, cursor: "pointer",
        fontFamily: "inherit", width: "100%", maxWidth: 320,
      }}>
        查看運轉狀態
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PAGE：使用紀錄
// ══════════════════════════════════════════════════════════════
function OrdersPage({ user }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("GET", `/api/orders/${user.userId}`)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user.userId]);

  // WebSocket 即時更新訂單進度
  const handleWs = useCallback((msg) => {
    if (msg.type !== "machine_status") return;
    const d = msg.data;
    setOrders(prev => prev.map(o =>
      o.machine_id === d.machine_id && o.status === "running"
        ? { ...o, remain_sec: d.remain_sec, progress: d.progress,
            status: d.state === "done" ? "done" : "running" }
        : o
    ));
  }, []);
  useWebSocket(handleWs);

  return (
    <div>
      <TopBar title="使用紀錄" />
      <div style={{ padding: "12px 14px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}><Spinner size={32} /></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div>目前沒有使用紀錄</div>
          </div>
        ) : orders.map(o => {
          const isDone    = o.status === "done" || o.status === "completed";
          const isRunning = o.status === "running";
          const remainMin = Math.ceil((o.remain_sec || 0) / 60);
          return (
            <Card key={o.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isRunning ? 12 : 0 }}>
                <WashIcon size={42} status={isDone ? "done" : isRunning ? "busy" : "idle"} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.dark }}>{o.machine_name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{o.store_name} · {o.mode}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {new Date(o.created_at).toLocaleString("zh-TW")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.dark }}>NT${o.total_amount}</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                      background: isDone ? C.tealLight : isRunning ? C.orangeLight : "#F3F4F6",
                      color: isDone ? C.teal : isRunning ? C.orange : C.muted,
                    }}>
                      {isDone ? "完成" : isRunning ? "洗衣中" : o.status}
                    </span>
                  </div>
                </div>
              </div>
              {isRunning && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 6 }}>
                    <span>洗衣進度</span>
                    <span style={{ color: C.teal, fontWeight: 700 }}>剩餘 {remainMin} 分鐘</span>
                  </div>
                  <div style={{ height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      background: `linear-gradient(to right, ${C.teal}, ${C.tealBright})`,
                      width: `${Math.max(2, o.progress || 0)}%`, transition: "width 1s",
                    }} />
                  </div>
                </>
              )}
              {isDone && (
                <div style={{
                  marginTop: 10, textAlign: "center", padding: 8,
                  background: C.tealLight, borderRadius: 10,
                  fontSize: 13, fontWeight: 700, color: C.teal,
                }}>
                  ✅ 洗衣完成，請取衣！
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PAGE：帳號
// ══════════════════════════════════════════════════════════════
function AccountPage({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api("GET", `/api/orders/${user.userId}`).then(setOrders).catch(() => {});
  }, [user.userId]);

  const total  = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const points = Math.floor(total / 100);

  return (
    <div>
      <TopBar title="帳號" />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ background: C.dark, borderRadius: 20, padding: 24, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 54, height: 54, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.line}, #00A148)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
            }}>
              {user.pictureUrl ? <img src={user.pictureUrl} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} alt="" /> : "👤"}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{user.displayName}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{ background: C.line, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>LINE</span>
                <span style={{ color: "#888", fontSize: 12 }}>已連結帳號</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[
            { icon: "🧺", label: "使用次數", val: orders.length },
            { icon: "💰", label: "累計消費", val: `$${total}` },
            { icon: "⭐", label: "會員點數", val: points },
          ].map(({ icon, label, val }) => (
            <Card key={label} style={{ textAlign: "center", marginBottom: 0 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.dark }}>{val}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{label}</div>
            </Card>
          ))}
        </div>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.line, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💳</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>LINE Pay 錢包</div>
                <div style={{ fontSize: 12, color: C.muted }}>可用餘額</div>
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>$520</div>
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🎟️ 我的優惠券</div>
          {[
            { l: "新會員優惠", v: 30, exp: "2026/06/30" },
            { l: "LINE 好友折扣", v: 20, exp: "2026/04/30" },
          ].map((c, i, arr) => (
            <div key={c.l} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>{c.l}</div>
                <div style={{ fontSize: 11, color: C.muted }}>有效至 {c.exp}</div>
              </div>
              <div style={{ background: C.tealLight, color: C.teal, fontWeight: 800, fontSize: 13, padding: "6px 14px", borderRadius: 20 }}>
                折 ${c.v}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Tab Bar
// ══════════════════════════════════════════════════════════════
function TabBar({ tab, onTab }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 480, margin: "0 auto",
      background: C.white, borderTop: `1px solid ${C.border}`,
      display: "flex", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,.08)",
    }}>
      {[
        { k: "home",    icon: "🏠", label: "機器狀態" },
        { k: "orders",  icon: "📋", label: "使用紀錄" },
        { k: "account", icon: "👤", label: "帳號" },
      ].map(({ k, icon, label }) => (
        <button key={k} onClick={() => onTab(k)} style={{
          flex: 1, padding: "10px 4px 8px", border: "none", background: "none",
          cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <span style={{ fontSize: 10, fontWeight: tab === k ? 800 : 500, color: tab === k ? C.teal : C.muted }}>
            {label}
          </span>
          {tab === k && <div style={{ width: 20, height: 3, background: C.teal, borderRadius: 2, position: "absolute", bottom: 0 }} />}
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  主程式
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [ready,   setReady]   = useState(false);
  const [user,    setUser]    = useState(null);
  const [tab,     setTab]     = useState("home");
  const [payData, setPayData] = useState(null);   // { machine, store }
  const [success, setSuccess] = useState(null);   // { orderId, mode, total, machine, store }
  const [toast,   setToast]   = useState(null);

  const notify = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // LIFF 初始化 + 檢查付款回調
  useEffect(() => {
    (async () => {
      await liff.init({ liffId: CONFIG.LIFF_ID });
      const profile = await liff.getProfile();
      setUser(profile);
      setReady(true);

      // 檢查是否從 LINE Pay 回來
      const params = new URLSearchParams(window.location.search);
      const result = params.get("result");
      if (result === "success") {
        notify("🎉 付款成功，機器已啟動！");
        setTab("orders");
        // 清除 URL 參數
        window.history.replaceState({}, "", window.location.pathname);
      } else if (result === "fail" || result === "cancelled") {
        notify("付款未完成", "error");
        window.history.replaceState({}, "", window.location.pathname);
      }
    })();
  }, []);

  if (!ready) return (
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Noto Sans TC',sans-serif;background:#111}
        @keyframes dot{from{opacity:.2}to{opacity:1}}`}</style>
      <div style={{ minHeight: "100vh", background: C.dark, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 68, height: 68, borderRadius: 20, background: C.line, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>🌊</div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>悠洗洗衣</div>
        <div style={{ color: "#666", fontSize: 13 }}>正在透過 LINE 登入...</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#444", animation: `dot .9s ${i * .2}s ease-in-out infinite alternate` }} />
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Noto Sans TC', sans-serif; background: ${C.bg}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
        @keyframes fadeDown { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes pop { 0%{transform:scale(.5)} 70%{transform:scale(1.1)} 100%{transform:scale(1)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.bg, position: "relative" }}>
        {/* 付款頁 覆蓋 */}
        {payData && !success && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, maxWidth: 480, margin: "0 auto", overflowY: "auto", background: C.bg }}>
            <PayPage
              machine={payData.machine} store={payData.store} user={user}
              onBack={() => setPayData(null)}
              onPaid={result => { setSuccess(result); setPayData(null); }}
              onToast={notify}
            />
          </div>
        )}

        {/* 成功頁 覆蓋 */}
        {success && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, maxWidth: 480, margin: "0 auto" }}>
            <SuccessPage result={success} onTrack={() => { setSuccess(null); setTab("orders"); }} />
          </div>
        )}

        {/* 主畫面 */}
        <div style={{ paddingBottom: 64 }}>
          {tab === "home"    && <MachinesPage user={user} onUse={(m, s) => setPayData({ machine: m, store: s })} />}
          {tab === "orders"  && <OrdersPage user={user} />}
          {tab === "account" && <AccountPage user={user} />}
        </div>

        <TabBar tab={tab} onTab={setTab} />
      </div>
    </>
  );
}
