import { useState, useEffect } from "react";

const LIFF_ID = import.meta.env.VITE_LIFF_ID || "2009552592-xkDKSJ1Y";
const API = import.meta.env.VITE_API_BASE || "https://laundry-backend-production-efa4.up.railway.app";

const IS_DEV = !window.liff;
const liff = IS_DEV ? {
  init: async () => {},
  isLoggedIn: () => true,
  getProfile: async () => ({ userId:"U_demo", displayName:"柏宏", pictureUrl:null }),
  login: () => {},
  isInClient: () => false,
} : window.liff;

const MODES = [
  { id:"standard", label:"洗脫烘－標準", price:160, min:65 },
  { id:"small",    label:"洗脫烘－少量", price:130, min:50 },
  { id:"washonly", label:"只要洗衣",     price:80,  min:35 },
  { id:"soft",     label:"洗脫烘－輕柔", price:160, min:65 },
  { id:"strong",   label:"洗脫烘－強勁", price:180, min:75 },
  { id:"dryonly",  label:"只要烘乾",     price:60,  min:40 },
];
const ADDONS = [
  { id:"det", label:"洗衣精",   price:10 },
  { id:"sof", label:"柔軟精",   price:10 },
  { id:"deg", label:"脫脂酵素", price:20 },
  { id:"ant", label:"除菌酵素", price:20 },
];
const EXTEND_OPTIONS = [0,5,10,15,20,30];

async function apiFetch(method, path, body) {
  const r = await fetch(API + path, {
    method,
    headers:{"Content-Type":"application/json"},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

function formatTime(sec) {
  const h = Math.floor(sec/3600).toString().padStart(2,"0");
  const m = Math.floor((sec%3600)/60).toString().padStart(2,"0");
  const s = (sec%60).toString().padStart(2,"0");
  return `${h}:${m}:${s}`;
}

// ── 樣式常數 ────────────────────────────────────────────
const C = {
  bg:"#F5F5F5", white:"#FFFFFF", dark:"#1A1A1A",
  green:"#4CAF50", greenD:"#388E3C",
  orange:"#FF9800", orangeD:"#F57C00",
  gray:"#9E9E9E", grayL:"#EEEEEE", grayLL:"#F9F9F9",
  blue:"#2196F3", border:"#E0E0E0",
  text:"#212121", textS:"#757575",
};

// ── 機器圖示 SVG ────────────────────────────────────────
function WashIcon({ size=48, running=false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="4" y="8" width="56" height="48" rx="4" fill={running ? "#FFF3E0" : "#F5F5F5"} stroke={running ? C.orange : "#BDBDBD"} strokeWidth="2"/>
      <rect x="8" y="12" width="20" height="8" rx="2" fill={running ? "#FFB74D" : "#BDBDBD"}/>
      <circle cx="38" cy="16" r="3" fill={running ? C.orange : "#BDBDBD"}/>
      <circle cx="46" cy="16" r="3" fill={running ? "#FF9800" : "#BDBDBD"}/>
      <circle cx="32" cy="38" r="14" fill="white" stroke={running ? C.orange : "#BDBDBD"} strokeWidth="2"/>
      <circle cx="32" cy="38" r="8" fill={running ? "#FFF3E0" : "#F5F5F5"}/>
      {running && <path d="M32 30 A8 8 0 0 1 40 38" stroke={C.orange} strokeWidth="2.5" strokeLinecap="round"/>}
    </svg>
  );
}

function DryIcon({ size=48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="4" y="8" width="56" height="48" rx="4" fill="#FFF8E1" stroke="#FFB300" strokeWidth="2"/>
      <rect x="8" y="12" width="20" height="8" rx="2" fill="#FFB300"/>
      <circle cx="38" cy="16" r="3" fill="#FF9800"/>
      <circle cx="46" cy="16" r="3" fill="#FFB300"/>
      <circle cx="32" cy="38" r="14" fill="white" stroke="#FFB300" strokeWidth="2"/>
      <path d="M26 38 Q29 32 32 38 Q35 44 38 38" stroke="#FF9800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ── 頂部導覽 ────────────────────────────────────────────
function Header({ title, onBack, rightEl }) {
  return (
    <div style={{
      background:C.dark, color:"white",
      padding:"0 16px",
      height:56,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:100,
    }}>
      <div style={{width:40}}>
        {onBack && (
          <button onClick={onBack} style={{background:"none",border:"none",color:"white",fontSize:22,cursor:"pointer",padding:4}}>
            ‹
          </button>
        )}
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:10,color:"#888",letterSpacing:1}}>悠洗洗衣</div>
        <div style={{fontSize:16,fontWeight:700}}>{title}</div>
      </div>
      <div style={{width:40,display:"flex",justifyContent:"flex-end"}}>
        {rightEl}
      </div>
    </div>
  );
}

// ── 機器狀態頁 ──────────────────────────────────────────
function HomePage({ user, onUse }) {
  const [stores,   setStores]   = useState([]);
  const [storeId,  setStoreId]  = useState(null);
  const [machines, setMachines] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(()=>{
    apiFetch("GET","/api/stores").then(d=>{ setStores(d); if(d[0]) setStoreId(d[0].id); }).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(!storeId) return;
    setLoading(true);
    apiFetch("GET","/api/machines/"+storeId)
      .then(d=>{ setMachines(d); setLoading(false); })
      .catch(()=>setLoading(false));
  },[storeId]);

  useEffect(()=>{
    const t = setInterval(()=>{
      if(storeId) apiFetch("GET","/api/machines/"+storeId).then(setMachines).catch(()=>{});
    },30000);
    return ()=>clearInterval(t);
  },[storeId]);

  const store = stores.find(s=>s.id===storeId);
  const filtered = machines.filter(m=> !search || m.name.includes(search));
  const running = filtered.filter(m=>["running","busy"].includes(m.state));
  const idle    = filtered.filter(m=>!["running","busy"].includes(m.state));

  return (
    <div style={{background:C.bg, minHeight:"100vh"}}>
      <Header title="機器狀態"/>

      {/* 品牌 Banner */}
      <div style={{background:C.dark, padding:"12px 16px 16px"}}>
        <div style={{fontSize:20, fontWeight:800, color:"white", letterSpacing:1}}>
          悠洗洗衣
        </div>
        {store && <div style={{fontSize:12,color:"#aaa",marginTop:2}}>{store.name}</div>}
      </div>

      {/* 門市搜尋 */}
      <div style={{background:C.dark, paddingBottom:12}}>
        <div style={{margin:"0 16px", background:"#333", borderRadius:8, display:"flex", alignItems:"center", padding:"0 12px"}}>
          <span style={{color:"#888",marginRight:8,fontSize:14}}>🔍</span>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="請輸入門市"
            style={{flex:1, background:"none", border:"none", color:"white", fontSize:14, outline:"none", padding:"10px 0"}}
          />
        </div>
      </div>

      {/* 門市選擇 */}
      <div style={{padding:"12px 16px", display:"flex", gap:10, overflowX:"auto", background:"white", borderBottom:`1px solid ${C.border}`}}>
        {stores.map(s=>{
          const sel = s.id===storeId;
          return (
            <div key={s.id} onClick={()=>setStoreId(s.id)} style={{
              flex:"0 0 auto", width:160,
              background: sel ? C.dark : C.grayLL,
              border:`2px solid ${sel ? C.dark : C.border}`,
              borderRadius:12, padding:"10px 12px",
              cursor:"pointer", position:"relative",
            }}>
              <div style={{fontWeight:700, fontSize:13, color: sel ? "white" : C.text, marginBottom:4}}>
                {s.name}
              </div>
              <WashIcon size={36}/>
              {sel && (
                <div style={{
                  position:"absolute", bottom:8, left:12,
                  background:C.green, color:"white", fontSize:10,
                  fontWeight:700, padding:"2px 8px", borderRadius:20,
                  display:"flex", alignItems:"center", gap:4,
                }}>選擇 ✓</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 機器清單 */}
      <div style={{padding:"0 0 80px"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:"60px",color:C.gray}}>載入中...</div>
        ) : (
          <>
            {/* 分類標題 */}
            {filtered.length > 0 && (
              <div style={{padding:"12px 16px 4px", display:"flex", alignItems:"center", gap:8}}>
                <div style={{flex:1, height:1, background:C.border}}/>
                <div style={{fontSize:12, color:C.textS, fontWeight:600}}>洗脫烘一機完成</div>
                <div style={{flex:1, height:1, background:C.border}}/>
              </div>
            )}

            {[...running, ...idle].map(m=>{
              const isRunning = ["running","busy"].includes(m.state);
              const isDry = m.name.includes("烘");
              return (
                <div key={m.id} style={{
                  background:"white", margin:"6px 16px",
                  borderRadius:14, padding:"14px 16px",
                  display:"flex", alignItems:"center", gap:12,
                  border:`1px solid ${C.border}`,
                  boxShadow:"0 1px 4px rgba(0,0,0,.05)",
                }}>
                  {/* 圖示 */}
                  <div style={{flexShrink:0}}>
                    {isDry ? <DryIcon size={48}/> : <WashIcon size={48} running={isRunning}/>}
                  </div>

                  {/* 資訊 */}
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:700, fontSize:15, color:C.text}}>
                      {m.name}（{m.size}）
                    </div>
                    {isRunning && m.remain_sec > 0 && (
                      <div style={{display:"flex", alignItems:"center", gap:4, marginTop:4}}>
                        <span style={{fontSize:12,color:C.textS}}>🕐</span>
                        <span style={{fontSize:13, color:C.textS, fontFamily:"monospace", fontWeight:600}}>
                          {formatTime(m.remain_sec)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 按鈕 */}
                  <div style={{display:"flex", gap:6, flexShrink:0}}>
                    {isRunning ? (
                      <>
                        <button style={{
                          padding:"10px 14px", borderRadius:10, border:"none",
                          background:C.grayL, color:C.textS,
                          fontSize:13, fontWeight:700, cursor:"default", fontFamily:"inherit",
                        }}>運轉</button>
                        <button style={{
                          padding:"10px 12px", borderRadius:10, border:"none",
                          background:C.orange, color:"white",
                          fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                          lineHeight:1.3,
                        }}>烘乾<br/>延長</button>
                      </>
                    ) : (
                      <button onClick={()=>onUse(m, store)} style={{
                        padding:"12px 22px", borderRadius:10, border:"none",
                        background:C.green, color:"white",
                        fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                      }}>使用</button>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{textAlign:"center",padding:"60px",color:C.gray}}>
                <div style={{fontSize:40,marginBottom:12}}>🫧</div>
                <div>目前沒有機器資料</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── 付款頁 ──────────────────────────────────────────────
function PayPage({ machine, store, user, onBack, onToast }) {
  const [modeId,  setModeId]  = useState("standard");
  const [addons,  setAddons]  = useState([]);
  const [extend,  setExtend]  = useState(0);
  const [temp,    setTemp]    = useState("高溫");
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState("single"); // wallet | single
  const [showMode, setShowMode] = useState(false);
  const [showExtend, setShowExtend] = useState(false);

  const mode     = MODES.find(m=>m.id===modeId);
  const addonSum = ADDONS.filter(a=>addons.includes(a.id)).reduce((s,a)=>s+a.price,0);
  const total    = mode.price + addonSum + extend * 3;
  const toggle   = id => setAddons(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);

  const handlePay = async () => {
    setLoading(true);
    try {
      const order = await apiFetch("POST","/api/orders/create",{
        lineUserId:user.userId, storeId:store.id, machineId:machine.id,
        mode:modeId, addons, extendMin:extend, temp, totalAmount:total,
      });
      const payment = await apiFetch("POST","/api/payment/request",{
        orderId: order.orderId, amount: total,
        orderName: `${store.name} ${machine.name} ${mode.label}`,
      });
      if (payment.success && payment.paymentUrl) {
        window.location.href = payment.paymentUrl;
      } else {
        onToast("LINE Pay 建立失敗：" + (payment.error||"未知錯誤"), "error");
        setLoading(false);
      }
    } catch(e) {
      onToast("付款請求失敗："+e.message,"error");
      setLoading(false);
    }
  };

  return (
    <div style={{background:C.bg, minHeight:"100vh"}}>
      <Header title="店內消費" onBack={onBack}/>

      {/* 品牌 Banner */}
      <div style={{background:C.dark, padding:"10px 16px 14px"}}>
        <div style={{fontSize:16, fontWeight:800, color:"white"}}>悠洗洗衣</div>
      </div>

      {/* 付款方式切換 */}
      <div style={{background:"white", borderBottom:`1px solid ${C.border}`}}>
        {/* 門市顯示 */}
        <div style={{padding:"10px 16px", display:"flex", alignItems:"center", gap:8}}>
          <div style={{width:4, height:16, background:C.dark, borderRadius:2}}/>
          <span style={{fontSize:12, color:C.textS, fontWeight:600}}>門市選擇</span>
        </div>
        <div style={{margin:"0 16px 12px", border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:12}}>
          <WashIcon size={40}/>
          <div>
            <div style={{fontWeight:700, fontSize:14, color:C.text}}>悠洗洗衣</div>
            <div style={{fontSize:12, color:C.textS, marginTop:2}}>{store.name}</div>
          </div>
          <span style={{marginLeft:"auto", color:C.gray}}>∨</span>
        </div>

        {/* 付款方式 Tab */}
        <div style={{display:"flex", margin:"0 16px 12px", background:C.grayL, borderRadius:25, padding:3}}>
          {[["wallet","錢包付款"],["single","單次付款"]].map(([k,label])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              flex:1, padding:"8px 0", borderRadius:22, border:"none",
              background: tab===k ? C.dark : "transparent",
              color: tab===k ? "white" : C.textS,
              fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* 選項區 */}
      <div style={{padding:"0 16px 100px"}}>

        {/* 機器選擇 */}
        <div style={{background:"white", borderRadius:12, marginTop:12, border:`1px solid ${C.border}`}}>
          <div style={{
            display:"flex", alignItems:"center", padding:"14px 16px",
            borderBottom:`1px solid ${C.border}`,
          }}>
            <span style={{fontSize:14, color:C.text, flex:1}}>機器選擇</span>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <WashIcon size={28} running={false}/>
              <span style={{fontSize:14, fontWeight:600, color:C.text}}>{machine.name}（{machine.size}）</span>
              <span style={{color:C.gray}}>∨</span>
            </div>
          </div>

          {/* 洗衣模式 */}
          <div style={{padding:"14px 16px", borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:12, color:C.textS, marginBottom:10, fontWeight:600}}>洗衣模式</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8}}>
              {MODES.map(m=>{
                const sel = modeId===m.id;
                return (
                  <button key={m.id} onClick={()=>setModeId(m.id)} style={{
                    padding:"10px 4px", borderRadius:10, cursor:"pointer",
                    border:`2px solid ${sel ? C.dark : C.border}`,
                    background: sel ? C.dark : "white", fontFamily:"inherit",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                  }}>
                    <span style={{fontSize:11, fontWeight:700, color: sel?"white":C.text, textAlign:"center", lineHeight:1.3}}>{m.label}</span>
                    <span style={{fontSize:10, color: sel?"#aaa":C.textS}}>NT${m.price}</span>
                  </button>
                );
              })}
            </div>
            <div style={{marginTop:8, textAlign:"center", fontSize:11, color:C.textS}}>預計 {mode.min+extend} 分鐘</div>
          </div>

          {/* 添加劑 */}
          <div style={{padding:"14px 16px", borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:12, color:C.textS, marginBottom:10, fontWeight:600}}>添加劑</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8}}>
              {ADDONS.map(a=>{
                const sel = addons.includes(a.id);
                return (
                  <button key={a.id} onClick={()=>toggle(a.id)} style={{
                    padding:"8px 4px", borderRadius:10, border:`2px solid ${sel ? C.green : C.border}`,
                    background: sel ? "#E8F5E9" : "white", cursor:"pointer", fontFamily:"inherit",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                  }}>
                    <span style={{fontSize:11, fontWeight:700, color: sel ? C.greenD : C.text}}>{a.label}</span>
                    <span style={{fontSize:10, color: sel ? C.greenD : C.textS}}>+${a.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 烘乾延長 */}
          <div style={{padding:"14px 16px", borderBottom:modeId!=="washonly"?`1px solid ${C.border}`:"none", display:"flex", alignItems:"center"}}>
            <span style={{fontSize:14, color:C.text, flex:1}}>烘乾延長</span>
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowExtend(!showExtend)} style={{
                display:"flex", alignItems:"center", gap:8,
                background:C.grayLL, border:`1px solid ${C.border}`,
                borderRadius:8, padding:"8px 14px", cursor:"pointer", fontFamily:"inherit",
                fontSize:14, color:C.text, fontWeight:600,
              }}>
                {extend > 0 ? `+${extend}min` : "不延長"} <span style={{color:C.gray}}>∨</span>
              </button>
              {showExtend && (
                <div style={{
                  position:"absolute", right:0, top:"110%", zIndex:50,
                  background:"white", border:`1px solid ${C.border}`,
                  borderRadius:10, overflow:"hidden",
                  boxShadow:"0 4px 16px rgba(0,0,0,.1)", minWidth:120,
                }}>
                  {EXTEND_OPTIONS.map(v=>(
                    <div key={v} onClick={()=>{setExtend(v);setShowExtend(false);}} style={{
                      padding:"10px 16px", cursor:"pointer", fontSize:14,
                      background: extend===v ? "#F5F5F5" : "white",
                      fontWeight: extend===v ? 700 : 400, color:C.text,
                    }}>{v===0 ? "不延長" : `+${v}min`}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 溫度選擇 */}
          {modeId!=="washonly" && (
            <div style={{padding:"14px 16px", borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:12, color:C.textS, marginBottom:10, fontWeight:600}}>烘衣溫度</div>
              <div style={{display:"flex", gap:8}}>
                {["低溫","中溫","高溫"].map(t=>(
                  <button key={t} onClick={()=>setTemp(t)} style={{
                    flex:1, padding:"10px 0", borderRadius:10, border:`2px solid ${temp===t ? C.dark : C.border}`,
                    background: temp===t ? C.dark : "white", color: temp===t ? "white" : C.textS,
                    fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                  }}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {/* 使用優惠 */}
          <div style={{padding:"14px 16px", display:"flex", alignItems:"center"}}>
            <span style={{fontSize:14, color:C.text, flex:1}}>使用優惠</span>
            <span style={{fontSize:14, color:C.gray}}>請選擇優惠券 ∨</span>
          </div>
        </div>
      </div>

      {/* 底部付款 */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, maxWidth:480, margin:"0 auto",
        background:C.dark, padding:"14px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div>
          <div style={{color:"#888", fontSize:11}}>付款金額</div>
          <div style={{color:"white", fontSize:28, fontWeight:800}}>$ {total}</div>
        </div>
        <button onClick={handlePay} disabled={loading} style={{
          padding:"14px 32px", borderRadius:12, border:"none",
          background: loading ? "#555" : "white",
          color: C.dark, fontSize:15, fontWeight:800,
          cursor: loading ? "not-allowed" : "pointer", fontFamily:"inherit",
        }}>{loading ? "跳轉中..." : "確認付款"}</button>
      </div>
    </div>
  );
}

// ── 付款結果頁 ──────────────────────────────────────────
function PaymentResultPage() {
  const params  = new URLSearchParams(window.location.search);
  const status  = params.get("status");
  const orderId = params.get("orderId");
  const msg     = params.get("msg");
  const isSuccess = status==="success";
  const isCancel  = status==="cancel";

  return (
    <div style={{minHeight:"100vh", background:C.dark, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, gap:20}}>
      <div style={{fontSize:72}}>{isSuccess?"🎉":isCancel?"😕":"❌"}</div>
      <div style={{textAlign:"center"}}>
        <div style={{color: isSuccess ? C.green : "#EF4444", fontSize:24, fontWeight:800, marginBottom:6}}>
          {isSuccess ? "付款成功！" : isCancel ? "已取消付款" : "付款失敗"}
        </div>
        {orderId && <div style={{color:"#aaa", fontSize:13}}>訂單編號：{orderId}</div>}
        {msg && <div style={{color:"#888", fontSize:12, marginTop:8}}>{decodeURIComponent(msg)}</div>}
        {isSuccess && (
          <div style={{background:"#1C1C1E", borderRadius:16, padding:16, marginTop:16}}>
            <div style={{color:"#aaa", fontSize:13}}>付款完成，機器將自動啟動</div>
          </div>
        )}
      </div>
      <button onClick={()=>window.location.href="/"} style={{
        padding:"14px 0", borderRadius:12, border:"none",
        background:"white", color:C.dark, fontSize:15, fontWeight:800,
        cursor:"pointer", fontFamily:"inherit", width:"100%", maxWidth:320,
      }}>回到首頁</button>
    </div>
  );
}

// ── 訂單頁 ──────────────────────────────────────────────
function OrdersPage({ user }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    apiFetch("GET","/api/orders/"+user.userId)
      .then(setOrders).catch(()=>{}).finally(()=>setLoading(false));
  },[user.userId]);

  return (
    <div style={{background:C.bg, minHeight:"100vh"}}>
      <Header title="使用紀錄"/>
      <div style={{padding:"12px 16px 80px"}}>
        {loading ? (
          <div style={{textAlign:"center", padding:"60px", color:C.gray}}>載入中...</div>
        ) : orders.length===0 ? (
          <div style={{textAlign:"center", padding:"60px", color:C.gray}}>
            <div style={{fontSize:48, marginBottom:12}}>📭</div>
            <div>目前沒有使用紀錄</div>
          </div>
        ) : orders.map(o=>{
          const isPaid=o.status==="paid", isDone=o.status==="done", isRunning=o.status==="running";
          const statusColor = isDone ? C.green : isPaid||isRunning ? C.orange : C.gray;
          const statusBg    = isDone ? "#E8F5E9" : isPaid||isRunning ? "#FFF3E0" : "#F5F5F5";
          const statusLabel = isDone?"完成":isRunning?"洗衣中":isPaid?"已付款":"待付款";
          return (
            <div key={o.id} style={{background:"white", borderRadius:14, padding:"14px 16px", marginBottom:10, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
              <div style={{display:"flex", alignItems:"center", gap:12}}>
                <WashIcon size={44} running={isRunning}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700, fontSize:14, color:C.text}}>{o.machine_name}</div>
                  <div style={{fontSize:12, color:C.textS, marginTop:2}}>{o.store_name} · {o.mode}</div>
                  <div style={{fontSize:11, color:C.gray, marginTop:2}}>{new Date(o.created_at).toLocaleString("zh-TW")}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:800, fontSize:15, color:C.text}}>NT${o.total_amount}</div>
                  <span style={{fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:700, background:statusBg, color:statusColor, marginTop:4, display:"inline-block"}}>{statusLabel}</span>
                </div>
              </div>
              {isRunning && o.remain_sec > 0 && (
                <div style={{marginTop:10, height:4, background:C.grayL, borderRadius:2, overflow:"hidden"}}>
                  <div style={{height:"100%", background:C.orange, borderRadius:2, width:(o.progress||0)+"%", transition:"width 1s"}}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 帳號頁 ──────────────────────────────────────────────
function AccountPage({ user }) {
  const [orders, setOrders] = useState([]);
  useEffect(()=>{ apiFetch("GET","/api/orders/"+user.userId).then(setOrders).catch(()=>{}); },[user.userId]);
  const totalSpend = orders.reduce((s,o)=>s+(o.total_amount||0),0);

  return (
    <div style={{background:C.bg, minHeight:"100vh"}}>
      <Header title="帳號"/>
      <div style={{padding:"16px 16px 80px"}}>
        {/* 用戶卡片 */}
        <div style={{background:C.dark, borderRadius:16, padding:"20px 16px", marginBottom:16, display:"flex", gap:14, alignItems:"center"}}>
          <div style={{width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#06C755,#00A148)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden"}}>
            {user.pictureUrl ? <img src={user.pictureUrl} style={{width:52,height:52,borderRadius:"50%"}} alt=""/> : <span style={{fontSize:24}}>👤</span>}
          </div>
          <div>
            <div style={{color:"white", fontWeight:800, fontSize:18}}>{user.displayName}</div>
            <div style={{display:"flex", alignItems:"center", gap:6, marginTop:4}}>
              <span style={{background:"#06C755", color:"white", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20}}>LINE</span>
              <span style={{color:"#888", fontSize:12}}>已連結帳號</span>
            </div>
          </div>
        </div>

        {/* 統計卡片 */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16}}>
          {[["🧺","使用次數",orders.length,"次"],["💰","累計消費","$"+totalSpend,""],["⭐","會員點數",Math.floor(totalSpend/100),"點"]].map(([icon,label,val,unit])=>(
            <div key={label} style={{background:"white", borderRadius:12, padding:"14px 12px", textAlign:"center", border:`1px solid ${C.border}`}}>
              <div style={{fontSize:22, marginBottom:6}}>{icon}</div>
              <div style={{fontWeight:800, fontSize:16, color:C.text}}>{val}<span style={{fontSize:11}}>{unit}</span></div>
              <div style={{fontSize:10, color:C.textS, marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>

        {/* 常用門市 */}
        <div style={{background:"white", borderRadius:12, padding:"14px 16px", border:`1px solid ${C.border}`}}>
          <div style={{fontWeight:700, fontSize:14, color:C.text, marginBottom:12}}>使用說明</div>
          {[
            ["💳","支援 LINE Pay 付款","選機器後點付款自動跳轉"],
            ["🍓","機器自動啟動","付款成功後樹莓派自動控制機器"],
            ["📱","訂單即時追蹤","可在使用紀錄查看剩餘時間"],
          ].map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex", gap:12, alignItems:"flex-start", marginBottom:12}}>
              <span style={{fontSize:20}}>{icon}</span>
              <div>
                <div style={{fontWeight:600, fontSize:13, color:C.text}}>{title}</div>
                <div style={{fontSize:11, color:C.textS, marginTop:2}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 底部導覽 ────────────────────────────────────────────
function TabBar({ tab, onTab }) {
  const tabs = [["home","機器狀態","🏠"],["orders","使用紀錄","📋"],["account","帳號","👤"]];
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, maxWidth:480, margin:"0 auto",
      background:"white", borderTop:`1px solid ${C.border}`,
      display:"flex", zIndex:100,
      boxShadow:"0 -2px 12px rgba(0,0,0,.08)",
    }}>
      {tabs.map(([k,label,icon])=>(
        <button key={k} onClick={()=>onTab(k)} style={{
          flex:1, padding:"10px 4px 8px", border:"none", background:"none",
          cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3,
        }}>
          <span style={{fontSize:22}}>{icon}</span>
          <span style={{fontSize:10, fontWeight: tab===k ? 800 : 500, color: tab===k ? C.dark : C.gray}}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ── 主 App ──────────────────────────────────────────────
export default function App() {
  const [ready,   setReady]   = useState(false);
  const [user,    setUser]    = useState(null);
  const [tab,     setTab]     = useState("home");
  const [payData, setPayData] = useState(null);
  const [toast,   setToast]   = useState(null);
  const [error,   setError]   = useState("");

  const isPaymentResult = window.location.pathname.includes("payment-result");

  const notify = (msg, type) => {
    setToast({msg, type:type||"ok"});
    setTimeout(()=>setToast(null), 3000);
  };

  useEffect(()=>{
    if(isPaymentResult){ setReady(true); return; }
    (async()=>{
      try {
        await liff.init({ liffId: LIFF_ID });
        if(!liff.isLoggedIn()){ liff.login(); return; }
        const p = await liff.getProfile();
        setUser(p);
      } catch(e){ setError(e.message||String(e)); }
      setReady(true);
    })();
  },[]);

  if(!ready) return (
    <div style={{minHeight:"100vh", background:C.dark, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16}}>
      <div style={{fontSize:60}}>🌊</div>
      <div style={{color:"white", fontWeight:800, fontSize:22}}>悠洗洗衣</div>
      <div style={{color:"#666", fontSize:13}}>載入中...</div>
    </div>
  );

  if(isPaymentResult) return <PaymentResultPage/>;

  if(error||!user) return (
    <div style={{minHeight:"100vh", background:C.dark, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:32}}>
      <div style={{fontSize:48}}>⚠️</div>
      <div style={{color:"white", fontWeight:800, fontSize:18}}>請用 LINE 開啟</div>
      <div style={{color:"#888", fontSize:12, textAlign:"center"}}>{error}</div>
    </div>
  );

  return (
    <>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; } body { font-family:'Noto Sans TC',sans-serif; background:${C.bg}; } select { appearance:none; }`}</style>
      {toast && (
        <div style={{
          position:"fixed", top:16, left:"50%", transform:"translateX(-50%)",
          zIndex:9999, padding:"11px 22px", borderRadius:50, fontSize:13, fontWeight:700,
          whiteSpace:"nowrap", boxShadow:"0 4px 16px rgba(0,0,0,.2)",
          background: toast.type==="error" ? "#EF4444" : C.dark, color:"white",
        }}>
          {toast.type==="error" ? "⚠️" : "✓"} {toast.msg}
        </div>
      )}
      <div style={{maxWidth:480, margin:"0 auto", minHeight:"100vh", position:"relative"}}>
        {payData && (
          <div style={{position:"fixed", inset:0, zIndex:200, maxWidth:480, margin:"0 auto", overflowY:"auto", background:C.bg}}>
            <PayPage machine={payData.machine} store={payData.store} user={user}
              onBack={()=>setPayData(null)} onToast={notify}/>
          </div>
        )}
        <div style={{paddingBottom:64}}>
          {tab==="home"    && <HomePage user={user} onUse={(m,s)=>setPayData({machine:m,store:s})}/>}
          {tab==="orders"  && <OrdersPage user={user}/>}
          {tab==="account" && <AccountPage user={user}/>}
        </div>
        <TabBar tab={tab} onTab={setTab}/>
      </div>
    </>
  );
}
