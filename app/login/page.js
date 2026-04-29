"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ShopLogin() {
  // Login States
  const [idInput, setIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Recovery Flow States
  const [showRecover, setShowRecover] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState("input"); // 'input' or 'reset'
  const [recoverShopId, setRecoverShopId] = useState("");
  const [recoveryKeyInput, setRecoveryKeyInput] = useState("");
  const [newPin, setNewPin] = useState("");
  const [processing, setProcessing] = useState(false);

  const router = useRouter();

  // Handle Shop Login
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const { data: shop } = await supabase.from("shops").select("*").eq("id", idInput).single();

    if (shop) {
      localStorage.setItem("townlog_shop_id", shop.id);
      localStorage.setItem("townlog_shop_name", shop.shop_name);
      router.push("/staff");
    } else {
      alert("Invalid Shop ID. Check your Master Key or Registry.");
    }
    setLoading(false);
  }

  // STEP 1: Verify the Recovery Key
  async function handleVerifyKey(e) {
    e.preventDefault();
    setProcessing(true);
    
    const { data: shop, error } = await supabase
      .from("shops")
      .select("id")
      .eq("id", recoverShopId)
      .eq("recovery_key", recoveryKeyInput)
      .single();

    if (shop) {
      setRecoveryStep("reset");
    } else {
      alert("Invalid Shop ID or Recovery Key. Access Denied.");
    }
    setProcessing(false);
  }

  // STEP 2: Update the Owner's PIN
  async function handleResetPin(e) {
    e.preventDefault();
    if (newPin.length !== 4) return alert("PIN must be exactly 4 digits!");
    setProcessing(true);

    const { error } = await supabase
      .from("employees")
      .update({ pin: newPin })
      .eq("shop_id", recoverShopId)
      .eq("role", "owner");

    if (!error) {
      alert("PIN reset successful! Launch the app using your Shop ID.");
      setShowRecover(false);
      setRecoveryStep("input");
      setNewPin("");
    } else {
      alert("Reset failed: " + error.message);
    }
    setProcessing(false);
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] flex flex-col items-center justify-center p-6 text-white text-center">
      <h1 className="text-5xl font-black text-[#ff6b35] mb-2 italic tracking-tighter uppercase">TownLog</h1>
      <p className="text-gray-500 mb-10 text-sm font-bold uppercase tracking-widest">Digital Ledger Login</p>
      
      <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
        <input 
          placeholder="Paste Shop ID here..." 
          className="p-5 rounded-3xl bg-[#1a1a22] border border-[#2a2a38] text-center font-mono text-xs focus:border-[#ff6b35] outline-none transition-all" 
          onChange={(e) => setIdInput(e.target.value)}
          required 
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="p-5 bg-[#ff6b35] rounded-3xl font-black uppercase text-sm active:scale-95 transition-all shadow-xl shadow-[#ff6b3511]"
        >
          {loading ? "Verifying..." : "Launch Shop App"}
        </button>
      </form>

      <button 
        onClick={() => setShowRecover(true)} 
        className="mt-8 text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-[#ff6b35] transition-colors"
      >
        Forgot PIN or lost Master Key?
      </button>

      {/* --- RECOVERY MODAL --- */}
      {showRecover && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50 backdrop-blur-xl">
          <div className="bg-[#1a1a22] w-full max-w-sm p-10 rounded-[40px] border border-[#2a2a38] text-center shadow-2xl">
            
            {recoveryStep === "input" ? (
              <>
                <h3 className="text-xl font-black mb-2 uppercase text-[#ff6b35]">Master Recovery</h3>
                <p className="text-[10px] text-gray-500 mb-8 uppercase font-bold tracking-widest">Enter details to reset Owner PIN</p>
                <form onSubmit={handleVerifyKey} className="flex flex-col gap-4">
                  <input 
                    placeholder="Shop ID" 
                    className="p-5 rounded-2xl bg-[#0f0f13] border border-[#2a2a38] text-xs font-mono outline-none focus:border-[#ff6b35]"
                    onChange={(e) => setRecoverShopId(e.target.value)}
                    required 
                  />
                  <input 
                    placeholder="Recovery Key (TL-XXXX-XXXX)" 
                    className="p-5 rounded-2xl bg-[#0f0f13] border border-[#2a2a38] text-sm font-mono outline-none focus:border-[#ff6b35] text-[#ff6b35]"
                    onChange={(e) => setRecoveryKeyInput(e.target.value)}
                    required 
                  />
                  <button disabled={processing} className="p-5 bg-[#ff6b35] rounded-2xl font-black uppercase text-xs">
                    {processing ? "Verifying..." : "Verify Master Key"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black mb-2 uppercase text-green-500">Key Verified</h3>
                <p className="text-[10px] text-gray-500 mb-8 uppercase font-bold tracking-widest">Set your new 4-digit Admin PIN</p>
                <form onSubmit={handleResetPin} className="flex flex-col gap-4">
                  <input 
                    type="password"
                    maxLength={4}
                    placeholder="New 4-Digit PIN" 
                    className="p-5 rounded-2xl bg-[#0f0f13] border border-green-500/30 text-center text-2xl font-mono text-green-500 outline-none focus:border-green-500"
                    onChange={(e) => setNewPin(e.target.value)}
                    required 
                  />
                  <button disabled={processing} className="p-5 bg-green-500 rounded-2xl font-black uppercase text-xs">
                    {processing ? "Reset PIN" : "Confirm New PIN"}
                  </button>
                </form>
              </>
            )}

            <button 
              type="button" 
              onClick={() => { setShowRecover(false); setRecoveryStep("input"); }} 
              className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-6 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-20">
         <button onClick={() => router.push("/")} className="text-[#ff6b35] text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
            Create New Shop Registry
         </button>
      </div>
    </div>
  );
}