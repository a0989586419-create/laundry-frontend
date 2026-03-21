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
  { id:"standard", label:"洗脫烘-標準", price:160, min:65 },
  { id:"small",    label:"洗脫烘-少量", price:130, min:50 },
  { id:"washonly", label:"只要洗衣",    price:80,  min:35 },
  { id:"soft",     label:"洗脫烘-輕柔", price:160, min:65 },
  { id:"strong",   label:"洗脫烘-強勁", price:180, min:75 },
  { id:"dryonly",  label:"只要烘乾",    price:60,  min:40 },
];

const ADDONS = [
  { id:"det", label:"洗衣精", price:10 },
  { id:"sof", label:"柔軟精", price:10 },
  { id:"deg", label:"脫脂酵素", price:20 },
  { id:"ant", label:"除菌酵素", price:20 },
];

async function apiFetch(method, path, body) {
  const r = await fetch(API + path, {
    method,
    headers: { "Content-Type":"application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

const S = {
  bg:"#F5F4F0", dark:"#111", white:"#fff",
  teal:"#1A7F5A", tealL:"#E8F5EE", green:"#22C55E",
  orange:"#F97316", orangeL:"#FFF3E0",
  muted:"#888", border:"#E8E8E8",
};

function TopBar({ title, onBack }) {
  return (
    <div style={{background:S.dark,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:90}}>
      {onBack
        ? <button onClick={onBack} style={{background:"none",border:"none",color:"#fff",fontSize:24,cursor:"pointer",lineHeight:1,width:30}}>‹</button>
        : <div style={{width:30}}/>}
      <div style={{flex:1,textAlign:"center"}}>
        <div style={{color:"#555",fontSize:10,letterSpacing:2,fontWeight:700}}>悠洗洗衣</div>
        <div style={{color:"#fff",fontWeight:800,fontSize:15}}>{title}</div>
      </div>
      <div style={{width:30}}/>
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{background:S.white,borderRadius:14,padding:"14px 16px",boxShadow:"0 1px 6px rgba(0,0,0,.07)",marginBottom:10,...style}}>{children}</div>;
}

function StatusBadge({ state, remainSec }) {
  const running = state==="running"||state==="busy";
  const done    = state==="done";
  const color   = running?S.orange:done?S.teal:S.muted;
  const bg      = running?S.orangeL:done?S.tealL:"#f3f4f6";
  const label   = running?"使用中":done?"完成":state==="unknown"?"待機":"空閒";
  return (
    <span style={{background:bg,color,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>
      {label}{running&&remainSec>0?" · 剩"+Math.ceil(remainSec/60)+"分":""}
    </span>
  );
}

// 機器狀態頁
function HomePage({ user, onUse }) {
  const [stores,   setStores]   = useState([]);
  const [storeId,  setStoreId]  = useState(null);
  const [machines, setMachines] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    apiFetch("GET","/api/stores").then(d=>{ setStores(d); if(d[0]) setStoreId(d[0].id); }).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    apiFetch("GET","/api/machines/"+storeId)
      .then(d=>{ setMachines(d); setLoading(false); })
      .catch(()=>setLoading(false));
  }, [storeId]);

  useEffect(() => {
    const t = setInterval(() => {
      if (storeId) apiFetch("GET","/api/machines/"+storeId).then(setMachines).catch(()=>{});
    }, 30000);
    return () => clearInterval(t);
  }, [storeId]);

  const idle = machines.filter(m=>!["running","busy"].includes(m.state));
  const busy = machines.filter(m=>["running","busy"].includes(m.state));
  const store = stores.find(s=>s.id===storeId);

  return (
    <div>
      <TopBar title="機器狀態"/>
      <div style={{padding:"12px 14px"}}>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
          {stores.map(s=>(
            <button key={s.id} onClick={()=>setStoreId(s.id)} style={{
              flexShrink:0,padding:"9px 18px",borderRadius:50,border:"none",cursor:"pointer",
              fontFamily:"inherit",fontWeight:700,fontSize:13,
              background:storeId===s.id?S.dark:S.white,color:storeId===s.id?"#fff":S.muted,
              boxShadow:storeId===s.id?"0 2px 12px rgba(0,0,0,.2)":"0 1px 4px rgba(0,0,0,.06)"}}>
              {storeId===s.id?"✓ ":""}{s.name}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={{textAlign:"center",padding:"48px 0",color:S.muted}}>載入中...</div>
        ) : (
          <>
            {idle.map(m=>(
              <Card key={m.id}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:36}}>🫧</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>{m.name}（{m.size}）</div>
                    <StatusBadge state={m.state} remainSec={m.remain_sec}/>
                  </div>
                  <button onClick={()=>onUse(m,store)} style={{
                    padding:"10px 20px",borderRadius:12,border:"none",
                    background:S.teal,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
                    使用
                  </button>
                </div>
              </Card>
            ))}
            {busy.length>0 && (
              <>
                <div style={{fontSize:11,color:S.muted,fontWeight:700,margin:"8px 0 6px",letterSpacing:1}}>── 使用中 ──</div>
                {busy.map(m=>(
                  <Card key={m.id} style={{opacity:.7,border:"1.5px solid "+S.orangeL}}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div style={{fontSize:36}}>🔄</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>{m.name}（{m.size}）</div>
                        <StatusBadge state="running" remainSec={m.remain_sec}/>
                      </div>
                    </div>
                    {m.remain_sec>0&&(
                      <div style={{marginTop:10,height:6,background:S.border,borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",background:S.orange,borderRadius:3,width:(m.progress||0)+"%",transition:"width 1s"}}/>
                      </div>
                    )}
                  </Card>
                ))}
              </>
            )}
            {idle.length===0&&busy.length===0&&(
              <div style={{textAlign:"center",padding:"48px 0",color:S.muted,fontSize:14}}>目前沒有機器資料</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 付款頁 - 串接 LINE Pay
function PayPage({ machine, store, user, onBack, onToast }) {
  const [modeId,  setModeId]  = useState("standard");
  const [addons,  setAddons]  = useState([]);
  const [extend,  setExtend]  = useState(0);
  const [temp,    setTemp]    = useState("高溫");
  const [loading, setLoading] = useState(false);
  const mode     = MODES.find(m=>m.id===modeId);
  const addonSum = ADDONS.filter(a=>addons.includes(a.id)).reduce((s,a)=>s+a.price,0);
  const total    = mode.price + addonSum + extend*3;
  const toggle   = id => setAddons(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);

  const handlePay = async () => {
    setLoading(true);
    try {
      // 步驟1：建立訂單
      const order = await apiFetch("POST","/api/orders/create",{
        lineUserId:user.userId, storeId:store.id, machineId:machine.id,
        mode:modeId, addons, extendMin:extend, temp, totalAmount:total,
      });

      // 步驟2：建立 LINE Pay 付款請求
      const payment = await apiFetch("POST","/api/payment/request",{
        orderId: order.orderId,
        amount: total,
        orderName: `${store.name} ${machine.name} ${mode.label}`,
      });

      if (payment.success && payment.paymentUrl) {
        // 步驟3：跳轉到 LINE Pay 付款頁
        window.location.href = payment.paymentUrl;
      } else {
        onToast("LINE Pay 建立失敗：" + (payment.error || "未知錯誤"), "error");
        setLoading(false);
      }
    } catch(e) {
      onToast("付款請求失敗："+e.message, "error");
      setLoading(false);
    }
  };

  return (
    <div style={{background:S.bg,minHeight:"100vh"}}>
      <TopBar title="選擇模式" onBack={onBack}/>
      <Card style={{margin:"12px 14px 0"}}>
        <div style={{fontWeight:800,fontSize:15}}>{store.name}</div>
        <div style={{fontSize:13,color:S.muted,marginTop:2}}>{machine.name}（{machine.size}）</div>
      </Card>
      <div style={{padding:"0 14px 90px"}}>
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:S.muted,marginBottom:10,letterSpacing:1}}>洗衣模式</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {MODES.map(m=>{
              const on=modeId===m.id;
              return (
                <button key={m.id} onClick={()=>setModeId(m.id)} style={{
                  padding:"12px 4px",borderRadius:12,cursor:"pointer",fontFamily:"inherit",
                  border:"2px solid "+(on?S.dark:"transparent"),background:on?S.dark:S.bg,
                  display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span style={{fontSize:11,fontWeight:700,textAlign:"center",lineHeight:1.3,color:on?"#fff":S.dark}}>{m.label}</span>
                  <span style={{fontSize:10,color:on?"#aaa":S.muted}}>${m.price}</span>
                </button>
              );
            })}
          </div>
          <div style={{marginTop:10,textAlign:"center",fontSize:12,color:S.muted}}>預計 {mode.min+extend} 分鐘</div>
        </Card>
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:S.muted,marginBottom:10,letterSpacing:1}}>添加劑</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
            {ADDONS.map(a=>{
              const on=addons.includes(a.id);
              return (
                <button key={a.id} onClick={()=>toggle(a.id)} style={{
                  padding:"10px 4px",borderRadius:12,border:"none",cursor:"pointer",
                  fontFamily:"inherit",fontSize:12,fontWeight:800,
                  background:on?S.dark:S.bg,color:on?"#fff":S.dark}}>
                  {a.label}
                  <div style={{fontSize:10,marginTop:2,color:on?"#aaa":S.muted}}>+${a.price}</div>
                </button>
              );
            })}
          </div>
        </Card>
        {modeId!=="washonly"&&(
          <Card>
            <div style={{fontSize:11,fontWeight:700,color:S.muted,marginBottom:10,letterSpacing:1}}>烘衣溫度</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {["低溫","中溫","高溫"].map(t=>(
                <button key={t} onClick={()=>setTemp(t)} style={{
                  padding:"12px 4px",borderRadius:12,border:"none",cursor:"pointer",
                  fontFamily:"inherit",fontSize:13,fontWeight:800,
                  background:temp===t?S.dark:S.bg,color:temp===t?"#fff":S.muted}}>{t}</button>
              ))}
            </div>
          </Card>
        )}
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:480,margin:"0 auto",background:S.dark,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{color:"#777",fontSize:11}}>付款金額</div>
          <div style={{color:"#fff",fontSize:30,fontWeight:800}}>$ {total}</div>
        </div>
        <button onClick={handlePay} disabled={loading} style={{
          padding:"14px 28px",borderRadius:14,border:"none",
          background:loading?"#555":S.white,color:S.dark,
          fontSize:15,fontWeight:800,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}}>
          {loading?"跳轉中...":"LINE Pay 付款"}
        </button>
      </div>
    </div>
  );
}

// 付款結果頁（LINE Pay 跳回後顯示）
function PaymentResultPage() {
  const params = new URLSearchParams(window.location.search);
  const status  = params.get("status");
  const orderId = params.get("orderId");
  const msg     = params.get("msg");

  const isSuccess = status === "success";
  const isCancel  = status === "cancel";

  return (
    <div style={{minHeight:"100vh",background:S.dark,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:22}}>
      <div style={{fontSize:80}}>{isSuccess?"🎉":isCancel?"😕":"❌"}</div>
      <div style={{textAlign:"center"}}>
        <div style={{color:isSuccess?S.green:"#EF4444",fontSize:26,fontWeight:800,marginBottom:6}}>
          {isSuccess?"付款成功！":isCancel?"已取消付款":"付款失敗"}
        </div>
        {orderId && <div style={{color:"#aaa",fontSize:13,marginTop:4}}>訂單編號：{orderId}</div>}
        {msg && <div style={{color:"#888",fontSize:12,marginTop:8}}>{decodeURIComponent(msg)}</div>}
        {isSuccess && (
          <div style={{background:"#1C1C1E",borderRadius:16,padding:18,marginTop:16,textAlign:"center"}}>
            <div style={{color:"#aaa",fontSize:13}}>付款完成，機器將自動啟動</div>
          </div>
        )}
      </div>
      <button onClick={()=>window.location.href="/"} style={{
        padding:"14px 0",borderRadius:14,border:"none",
        background:S.white,color:S.dark,fontSize:15,fontWeight:800,
        cursor:"pointer",fontFamily:"inherit",width:"100%",maxWidth:320}}>
        回到首頁
      </button>
    </div>
  );
}

// 訂單頁
function OrdersPage({ user }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch("GET","/api/orders/"+user.userId)
      .then(setOrders).catch(()=>{}).finally(()=>setLoading(false));
  }, [user.userId]);
  return (
    <div>
      <TopBar title="使用紀錄"/>
      <div style={{padding:"12px 14px"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:"48px 0",color:S.muted}}>載入中...</div>
        ) : orders.length===0 ? (
          <div style={{textAlign:"center",padding:"60px 0",color:S.muted}}>
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <div>目前沒有使用紀錄</div>
          </div>
        ) : orders.map(o=>{
          const isPaid=o.status==="paid", isDone=o.status==="done", isRunning=o.status==="running";
          return (
            <Card key={o.id}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:36}}>{isDone?"✅":isRunning?"🔄":isPaid?"💳":"🫧"}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:14}}>{o.machine_name}</div>
                  <div style={{fontSize:12,color:S.muted}}>{o.store_name} · {o.mode}</div>
                  <div style={{fontSize:11,color:S.muted}}>{new Date(o.created_at).toLocaleString("zh-TW")}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:800}}>NT${o.total_amount}</div>
                  <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,fontWeight:700,
                    background:isDone?S.tealL:isRunning||isPaid?S.orangeL:"#f3f4f6",
                    color:isDone?S.teal:isRunning||isPaid?S.orange:S.muted}}>
                    {isDone?"完成":isRunning?"洗衣中":isPaid?"已付款":"待付款"}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// 帳號頁
function AccountPage({ user }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => { apiFetch("GET","/api/orders/"+user.userId).then(setOrders).catch(()=>{}); }, [user.userId]);
  const totalSpend = orders.reduce((s,o)=>s+(o.total_amount||0),0);
  return (
    <div>
      <TopBar title="帳號"/>
      <div style={{padding:"12px 14px"}}>
        <div style={{background:S.dark,borderRadius:20,padding:24,marginBottom:14,display:"flex",gap:14,alignItems:"center"}}>
          <div style={{width:54,height:54,borderRadius:"50%",background:"linear-gradient(135deg,#06C755,#00A148)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
            {user.pictureUrl ? <img src={user.pictureUrl} style={{width:54,height:54,borderRadius:"50%"}} alt=""/> : "👤"}
          </div>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:18}}>{user.displayName}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
              <span style={{background:"#06C755",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>LINE</span>
              <span style={{color:"#888",fontSize:12}}>已連結帳號</span>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[["🧺","使用次數",orders.length],["💰","累計消費","$"+totalSpend],["⭐","會員點數",Math.floor(totalSpend/100)]].map(([icon,label,val])=>(
            <Card key={label} style={{textAlign:"center",marginBottom:0}}>
              <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
              <div style={{fontWeight:800,fontSize:15}}>{val}</div>
              <div style={{fontSize:10,color:S.muted,marginTop:2}}>{label}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabBar({ tab, onTab }) {
  const tabs = [["home","🏠","機器狀態"],["orders","📋","使用紀錄"],["account","👤","帳號"]];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:480,margin:"0 auto",background:S.white,borderTop:"1px solid "+S.border,display:"flex",zIndex:100,boxShadow:"0 -4px 20px rgba(0,0,0,.08)"}}>
      {tabs.map(([k,icon,label])=>(
        <button key={k} onClick={()=>onTab(k)} style={{flex:1,padding:"10px 4px 8px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <span style={{fontSize:22}}>{icon}</span>
          <span style={{fontSize:10,fontWeight:tab===k?800:500,color:tab===k?S.teal:S.muted}}>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [ready,   setReady]   = useState(false);
  const [user,    setUser]    = useState(null);
  const [tab,     setTab]     = useState("home");
  const [payData, setPayData] = useState(null);
  const [toast,   setToast]   = useState(null);
  const [error,   setError]   = useState("");

  // 判斷是否為付款結果頁
  const isPaymentResult = window.location.pathname.includes("payment-result");

  const notify = (msg, type) => {
    setToast({msg, type:type||"ok"});
    setTimeout(()=>setToast(null),3000);
  };

  useEffect(()=>{
    if (isPaymentResult) { setReady(true); return; }
    (async()=>{
      try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) { liff.login(); return; }
        const p = await liff.getProfile();
        setUser(p);
      } catch(e) { setError(e.message||String(e)); }
      setReady(true);
    })();
  },[]);

  if (!ready) return (
    <div style={{minHeight:"100vh",background:S.dark,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:64}}>🌊</div>
      <div style={{color:"#fff",fontWeight:800,fontSize:22}}>悠洗洗衣</div>
      <div style={{color:"#666",fontSize:13}}>載入中...</div>
    </div>
  );

  // 付款結果頁不需要登入
  if (isPaymentResult) return <PaymentResultPage />;

  if (error||!user) return (
    <div style={{minHeight:"100vh",background:S.dark,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:32}}>
      <div style={{fontSize:48}}>⚠️</div>
      <div style={{color:"#fff",fontWeight:800,fontSize:18}}>請用 LINE 開啟</div>
      <div style={{color:"#888",fontSize:12,textAlign:"center"}}>{error}</div>
    </div>
  );

  return (
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Noto Sans TC',sans-serif;background:${S.bg}}`}</style>
      {toast&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,padding:"11px 22px",borderRadius:50,fontSize:13,fontWeight:700,whiteSpace:"nowrap",boxShadow:"0 6px 24px rgba(0,0,0,.25)",background:toast.type==="error"?"#EF4444":S.dark,color:"#fff"}}>
          {toast.type==="error"?"⚠️":"✓"} {toast.msg}
        </div>
      )}
      <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",position:"relative"}}>
        {payData&&(
          <div style={{position:"fixed",inset:0,zIndex:200,maxWidth:480,margin:"0 auto",overflowY:"auto",background:S.bg}}>
            <PayPage machine={payData.machine} store={payData.store} user={user}
              onBack={()=>setPayData(null)}
              onToast={notify}/>
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
