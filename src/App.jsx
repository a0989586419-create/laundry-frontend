import { useState, useEffect } from "react";

const LIFF_ID = "2009551849-ABLT50IT";

export default function App() {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const initLiff = async () => {
      try {
        if (!window.liff) {
          setStatus("no-liff");
          return;
        }
        await window.liff.init({ liffId: LIFF_ID });
        if (window.liff.isLoggedIn()) {
          const profile = await window.liff.getProfile();
          setUser(profile);
          setStatus("ready");
        } else {
          window.liff.login();
        }
      } catch (e) {
        setError(e.message || String(e));
        setStatus("error");
      }
    };
    initLiff();
  }, []);

  const bg = { minHeight:"100vh", background:"#111", display:"flex",
    flexDirection:"column", alignItems:"center", justifyContent:"center",
    padding:32, gap:16, fontFamily:"sans-serif" };

  if (status === "loading") return (
    <div style={bg}>
      <div style={{fontSize:56}}>🌊</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:800}}>悠洗洗衣</div>
      <div style={{color:"#888",fontSize:14}}>載入中...</div>
    </div>
  );

  if (status === "no-liff") return (
    <div style={bg}>
      <div style={{fontSize:56}}>⚠️</div>
      <div style={{color:"#fff",fontSize:18,fontWeight:800}}>請用 LINE 開啟</div>
      <div style={{color:"#888",fontSize:13,textAlign:"center"}}>
        請在 LINE App 內點選連結開啟此頁面
      </div>
    </div>
  );

  if (status === "error") return (
    <div style={bg}>
      <div style={{fontSize:56}}>❌</div>
      <div style={{color:"#fff",fontSize:18,fontWeight:800}}>初始化失敗</div>
      <div style={{color:"#888",fontSize:12,textAlign:"center",maxWidth:300,wordBreak:"break-all"}}>
        {error}
      </div>
    </div>
  );

  return (
    <div style={bg}>
      <div style={{fontSize:56}}>🌊</div>
      <div style={{color:"#fff",fontSize:24,fontWeight:800}}>悠洗洗衣</div>
      <div style={{background:"#1C1C1E",borderRadius:16,padding:24,
        width:"100%",maxWidth:320,textAlign:"center"}}>
        <div style={{color:"#fff",fontSize:16,fontWeight:700,marginBottom:8}}>
          👋 歡迎，{user?.displayName}！
        </div>
        <div style={{color:"#888",fontSize:13}}>
          LIFF 連線成功 ✅
        </div>
      </div>
    </div>
  );
}
