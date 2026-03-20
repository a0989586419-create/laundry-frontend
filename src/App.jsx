import { useState, useEffect } from "react";

const CONFIG = {
  LIFF_ID: "2009551849-ABLT50IT",
  API_BASE: "",
  WS_URL: "",
};

const IS_DEV = !window.liff;
const liff = IS_DEV ? {
  init: async () => { await new Promise(r => setTimeout(r, 700)); },
  isLoggedIn: () => true,
  getProfile: async () => ({ userId: "U_demo", displayName: "測試用戶", pictureUrl: null }),
  openWindow: ({ url }) => window.open(url, '_blank'),
  closeWindow: () => {},
  isInClient: () => false,
} : window.liff;

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await liff.init({ liffId: CONFIG.LIFF_ID });
        const profile = await liff.getProfile();
        setUser(profile);
      } catch(e) {
        console.error(e);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return (
    <div style={{minHeight:"100vh",background:"#111",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:64}}>🌊</div>
      <div style={{color:"#fff",fontWeight:800,fontSize:22}}>悠洗洗衣</div>
      <div style={{color:"#666",fontSize:14}}>載入中...</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#111",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:32}}>
      <div style={{fontSize:64}}>🌊</div>
      <div style={{color:"#fff",fontWeight:800,fontSize:24}}>悠洗洗衣</div>
      <div style={{background:"#1C1C1E",borderRadius:16,padding:24,width:"100%",maxWidth:320}}>
        <div style={{color:"#fff",fontWeight:700,fontSize:16,marginBottom:8}}>
          {user ? `👋 歡迎，${user.displayName}！` : "歡迎使用"}
        </div>
        <div style={{color:"#888",fontSize:13}}>系統建置中，後端伺服器即將連線</div>
      </div>
      <div style={{color:"#444",fontSize:12,textAlign:"center"}}>
        前端部署成功 ✅<br/>
        下一步：部署後端伺服器
      </div>
    </div>
  );
}
