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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e) {
    e.preventDefault();
    if (ownerPin.length !== 4) return alert("PIN must be 4 digits!");
    
    setLoading(true);
    
    const { data: shop, error } = await supabase
      .from("shops")
      .insert([{ shop_name: shopName, owner_email: ownerEmail }])
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
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  }

  if (shopId) return (
    <div className="min-h-screen bg-[#0f0f13] text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-black text-green-500 mb-2 italic uppercase">Success!</h2>
      <p className="text-gray-500 mb-6 font-bold uppercase text-[10px] tracking-[0.2em]">Save your Shop ID:</p>
      <div className="p-6 bg-[#1a1a22] border-2 border-dashed border-[#ff6b35] rounded-[32px] text-[#ff6b35] font-mono text-lg mb-10 break-all shadow-2xl">
        {shopId}
      </div>
      <button onClick={() => router.push("/login")} className="w-full max-w-xs p-5 bg-[#ff6b35] rounded-3xl font-black uppercase text-sm active:scale-95 transition-all">
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

        {/* --- THE MISSING DOOR --- */}
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