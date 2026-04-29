"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LandingPage() {
  const [shopName, setShopName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPin, setOwnerPin] = useState(""); 
  const [shopId, setShopId] = useState(null);
  const [recoveryKey, setRecoveryKey] = useState(""); // NEW: State to store the generated key
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false); // NEW: State for copy feedback
  const router = useRouter();

  const generateRecoveryKey = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let key = "TL-";
    for (let i = 0; i < 8; i++) {
      if (i === 4) key += "-";
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleRegister(e) {
    e.preventDefault();
    if (ownerPin.length !== 4) return alert("PIN must be 4 digits!");
    
    setLoading(true);
    
    // 1. Generate the key BEFORE inserting
    const newKey = generateRecoveryKey();
    
    // 2. Insert into 'shops' including the recovery_key
    const { data: shop, error } = await supabase
      .from("shops")
      .insert([{ 
        shop_name: shopName, 
        owner_email: ownerEmail,
        recovery_key: newKey // SAVING TO DB
      }])
      .select().single();

    if (shop) {
      await supabase.from("employees").insert([{
        shop_id: shop.id,
        name: ownerName,
        pin: ownerPin,
        role: "owner",
        avatar: "👑"
      }]);
      setShopId(shop.id);
      setRecoveryKey(newKey); // SETTING STATE TO SHOW USER
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  }

  // --- UPDATED SUCCESS SCREEN ---
  if (shopId) return (
    <div className="min-h-screen bg-[#0f0f13] text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-black text-green-500 mb-2 italic uppercase">Registration Successful!</h2>
      
      <div className="w-full max-w-sm bg-[#1a1a22] p-8 rounded-[40px] border-2 border-[#ff6b35] shadow-2xl mt-4">
        <p className="text-gray-500 mb-2 font-bold uppercase text-[10px] tracking-[0.2em]">Master Recovery Key:</p>
        
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-[#0f0f13] rounded-2xl border border-[#2a2a38] font-mono text-2xl text-[#ff6b35] font-black tracking-widest">
            {recoveryKey}
          </div>
          
          <button 
            onClick={copyToClipboard}
            className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${copied ? 'bg-green-500' : 'bg-[#2a2a38] hover:bg-[#3a3a48]'}`}
          >
            {copied ? "Copied to Clipboard!" : "Copy Recovery Key"}
          </button>
        </div>

        <p className="text-[9px] text-gray-600 mt-6 uppercase leading-relaxed font-bold">
          ⚠️ Save this key safely. You will need it to reset your PIN if you ever forget it.
        </p>
      </div>

      <button onClick={() => router.push("/login")} className="w-full max-w-xs p-5 bg-[#ff6b35] rounded-3xl font-black uppercase text-sm mt-10 active:scale-95 transition-all">
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-8 flex flex-col items-center justify-center font-sans">
      <h1 className="text-7xl font-black text-[#ff6b35] mb-2 italic tracking-tighter uppercase">TownLog</h1>
      <p className="text-gray-600 mb-12 text-center max-w-xs text-[10px] font-bold uppercase tracking-[0.3em]">Cloud Ledger System</p>
      
      <div className="w-full max-w-md bg-[#1a1a22] p-10 rounded-[50px] border border-[#2a2a38] shadow-2xl flex flex-col items-center">
        <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
          <input placeholder="Shop Name" required className="p-5 rounded-3xl bg-[#0f0f13] border border-[#2a2a38] outline-none focus:border-[#ff6b35] transition-all" onChange={(e)=>setShopName(e.target.value)} />
          <input placeholder="Owner Name" required className="p-5 rounded-3xl bg-[#0f0f13] border border-[#2a2a38] outline-none focus:border-[#ff6b35] transition-all" onChange={(e)=>setOwnerName(e.target.value)} />
          <input placeholder="Owner Email" type="email" required className="p-5 rounded-3xl bg-[#0f0f13] border border-[#2a2a38] outline-none focus:border-[#ff6b35] transition-all" onChange={(e)=>setOwnerEmail(e.target.value)} />
          
          <div className="relative mt-2">
            <input 
              placeholder="Set 4-Digit Admin PIN" 
              type="password"
              maxLength={4}
              required 
              className="w-full p-5 rounded-3xl bg-[#0f0f13] border-2 border-[#ff6b3522] text-center font-mono text-xl outline-none focus:border-[#ff6b35] transition-all text-[#ff6b35]" 
              onChange={(e)=>setOwnerPin(e.target.value)} 
            />
          </div>

          <button type="submit" disabled={loading} className="p-5 bg-[#ff6b35] rounded-3xl font-black text-sm uppercase mt-6 active:scale-95 transition-all shadow-xl shadow-[#ff6b3511]">
            {loading ? "Registering..." : "Register My Shop"}
          </button>
        </form>

        <button 
          onClick={() => router.push("/login")} 
          className="mt-8 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] hover:text-[#ff6b35] transition-colors"
        >
          Already registered? Login here
        </button>
      </div>
    </div>
  );
}