"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function StaffList() {
  const [employees, setEmployees] = useState([]);
  const [shopName, setShopName] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [activeEmp, setActiveEmp] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false); 
  
  const router = useRouter();

  useEffect(() => {
    const shopId = localStorage.getItem("townlog_shop_id");
    const name = localStorage.getItem("townlog_shop_name");
    
    if (!shopId) return router.push("/login");
    setShopName(name);
    
    async function fetchStaff() {
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("shop_id", shopId);
      setEmployees(data || []);
    }
    fetchStaff();
  }, [router]);

  // --- Handlers ---

  function handleAdminClick() {
    // Safety check to find the owner
    const owner = employees.find(e => e.role === 'owner');
    if (!owner) return alert("Owner record not found! Check your database.");
    
    setActiveEmp(owner);
    setIsAdminMode(true);
    setShowPinModal(true);
  }

  function handleLogout() {
    if (confirm("Logout from this shop?")) {
      localStorage.clear();
      router.push("/");
    }
  }

  function verifyPin() {
    if (pinInput === activeEmp.pin) {
      if (isAdminMode) {
        router.push("/dashboard"); // Boss enters the vault
      } else {
        localStorage.setItem("selected_emp", JSON.stringify(activeEmp));
        router.push("/shift"); // Worker starts the grind
      }
    } else {
      alert("Unauthorized! Incorrect PIN.");
      setPinInput("");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-6 font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-4xl font-black text-[#ff6b35] italic leading-none">{shopName}</h2>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-2">
            Select your name to work
          </p>
        </div>
        
        <div className="flex flex-col gap-2 items-end">
          {/* Admin Locked Gate */}
          <button 
            onClick={handleAdminClick} 
            className="text-[10px] font-bold text-[#ff6b35] border border-[#ff6b3544] px-4 py-2 rounded-xl hover:bg-[#ff6b3511] transition-all active:scale-95"
          >
            OWNER ADMIN 🔒
          </button>
          
          {/* High-Visibility Logout */}
          <button 
            onClick={handleLogout} 
            className="text-[10px] font-black text-red-500/80 border border-red-500/20 bg-red-500/5 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all uppercase tracking-widest active:scale-95"
          >
            Logout Shop 👋
          </button>
        </div>
      </div>

      {/* Staff Grid (Owner Hidden) */}
      <div className="grid gap-3">
        {employees.filter(e => e.role !== 'owner').map(emp => (
          <button 
            key={emp.id} 
            onClick={() => { setActiveEmp(emp); setIsAdminMode(false); setShowPinModal(true); }} 
            className="flex justify-between items-center p-6 bg-[#1a1a22] border border-[#2a2a38] rounded-[32px] w-full active:scale-[0.98] transition-all group hover:border-[#ff6b3522] shadow-lg shadow-black/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#ff6b3511] flex items-center justify-center text-xl border border-[#ff6b3522] group-hover:bg-[#ff6b35] group-hover:text-white transition-all">
                {emp.avatar || "👤"}
              </div>
              <p className="font-bold text-lg">{emp.name}</p>
            </div>
            <div className="text-[9px] text-gray-700 font-black uppercase tracking-widest bg-black/30 px-3 py-1 rounded-full">
              Worker
            </div>
          </button>
        ))}
      </div>

      {/* --- PIN MODAL (Multi-Use) --- */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-[#1a1a22] w-full max-w-xs p-10 rounded-[50px] border border-[#2a2a38] text-center shadow-2xl">
            <p className="text-[#ff6b35] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              {isAdminMode ? "Admin Verification" : "Worker Identity"}
            </p>
            <h3 className="text-2xl font-black mb-8 text-white">Enter PIN</h3>
            
            <input 
              type="password" 
              placeholder="****" 
              value={pinInput}
              maxLength={4}
              autoFocus
              className="w-full bg-[#0f0f13] border-2 border-[#2a2a38] p-6 rounded-3xl text-center text-4xl font-mono mb-8 tracking-[15px] outline-none focus:border-[#ff6b35] text-[#ff6b35] transition-all"
              onChange={(e) => setPinInput(e.target.value)}
            />

            <div className="flex flex-col gap-4">
              <button 
                onClick={verifyPin} 
                className="w-full p-5 bg-[#ff6b35] rounded-3xl font-black uppercase text-sm shadow-xl shadow-[#ff6b3522] active:scale-95 transition-all"
              >
                Verify & Enter
              </button>
              <button 
                onClick={() => { setShowPinModal(false); setPinInput(""); setIsAdminMode(false); }} 
                className="text-gray-600 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}