"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; // Ensure this relative path is correct for your setup

export default function ShopLogin() {
  // Login States
  const [idInput, setIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Recovery States
  const [showRecover, setShowRecover] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [sending, setSending] = useState(false);

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
      alert("Invalid Shop ID. Please check your setup email.");
    }
    setLoading(false);
  }

  // Handle Admin Credentials Recovery
  async function handleRecover(e) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoverEmail }),
      });

      if (res.ok) {
        alert("Success! Credentials have been sent to your email.");
        setShowRecover(false);
        setRecoverEmail("");
      } else {
        alert("Error: Email not found in our system.");
      }
    } catch (err) {
      alert("Something went wrong. Try again later.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] flex flex-col items-center justify-center p-6 text-white text-center">
      {/* Brand Header */}
      <h1 className="text-5xl font-black text-[#ff6b35] mb-2 italic tracking-tighter">TownLog</h1>
      <p className="text-gray-500 mb-10 text-sm font-bold uppercase tracking-widest">Digital Ledger Login</p>
      
      {/* Login Form */}
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

      {/* Recovery Trigger */}
      <button 
        onClick={() => setShowRecover(true)} 
        className="mt-8 text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-[#ff6b35] transition-colors"
      >
        Forgot Shop ID or PIN?
      </button>

      {/* --- RECOVERY MODAL --- */}
      {showRecover && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50 backdrop-blur-md">
          <div className="bg-[#1a1a22] w-full max-w-xs p-10 rounded-[40px] border border-[#2a2a38] text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Recover Access</h3>
            <p className="text-[10px] text-gray-500 mb-8 uppercase font-bold tracking-widest">
              Enter owner email to receive ID & PIN
            </p>
            
            <form onSubmit={handleRecover} className="flex flex-col gap-4">
              <input 
                type="email" 
                placeholder="Owner Email" 
                className="p-5 rounded-2xl bg-[#0f0f13] border border-[#2a2a38] text-sm outline-none focus:border-[#ff6b35] transition-all"
                onChange={(e) => setRecoverEmail(e.target.value)}
                required 
              />
              <button 
                disabled={sending} 
                className="p-5 bg-[#ff6b35] rounded-2xl font-black uppercase text-xs shadow-lg shadow-[#ff6b3522] active:scale-95 transition-all"
              >
                {sending ? "Sending..." : "Send Credentials"}
              </button>
              <button 
                type="button" 
                onClick={() => setShowRecover(false)} 
                className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-2 hover:text-white"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Registration Link */}
      <div className="mt-20">
         <button onClick={() => router.push("/")} className="text-[#ff6b35] text-[10px] font-black uppercase tracking-widest">
           Create New Shop Registry
         </button>
      </div>
    </div>
  );
}