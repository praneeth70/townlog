"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function OwnerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [shopName, setShopName] = useState("");
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);
  
  // States for Logs & Analytics
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [history, setHistory] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [stats, setStats] = useState({ daily: "0h", weekly: "0h", monthly: "0h" });

  const router = useRouter();

  useEffect(() => {
    const shopId = localStorage.getItem("townlog_shop_id");
    const name = localStorage.getItem("townlog_shop_name");
    if (!shopId) return router.push("/login");
    setShopName(name);
    fetchData(shopId);
  }, []);

  async function fetchData(shopId) {
    const { data: emps } = await supabase.from("employees").select("*").eq("shop_id", shopId);
    setEmployees(emps || []);
    
    const today = new Date().toISOString().slice(0, 10);
    const { data: sess } = await supabase.from("sessions").select("*").gte("start_time", `${today}T00:00:00Z`);
    setSessions(sess || []);
  }

  // --- LOGIC: MANAGE EMPLOYEES ---
  async function handleAddEmployee(e) {
    e.preventDefault();
    setLoading(true);
    const shopId = localStorage.getItem("townlog_shop_id");
    
    await supabase.from("employees").insert([{
      shop_id: shopId,
      name: newName,
      pin: newPin,
      role: "employee",
      avatar: "👤"
    }]);

    setNewName(""); setNewPin("");
    fetchData(shopId);
    setLoading(false);
  }
  // Function to update an existing worker's PIN
async function handleUpdatePin(empId) {
  const newPin = prompt("Enter new 4-digit PIN for this worker:");
  
  if (!newPin || newPin.length !== 4 || isNaN(newPin)) {
    return alert("Invalid PIN! Must be exactly 4 digits.");
  }

  const { error } = await supabase
    .from("employees")
    .update({ pin: newPin })
    .eq("id", empId);

  if (error) {
    alert("Error updating PIN: " + error.message);
  } else {
    alert("PIN updated successfully!");
    // Refresh data to show new PIN in the list
    const shopId = localStorage.getItem("townlog_shop_id");
    fetchData(shopId);
  }
}
  async function handleDelete(id) {
    if (confirm("Are you sure? This will permanently remove the worker from your shop list.")) {
      await supabase.from("employees").delete().eq("id", id);
      setEmployees(employees.filter(e => e.id !== id));
    }
  }

  // --- LOGIC: ANALYTICS & LOGS ---
  const calculateAggregates = (logs) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().slice(0, 10);

    const getHours = (ms) => `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;

    let dMs = 0, wMs = 0, mMs = 0;
    logs.forEach(s => {
      const start = new Date(s.start_time);
      const end = s.end_time ? new Date(s.end_time) : new Date();
      const diff = end - start;
      if (s.start_time.startsWith(todayStr)) dMs += diff;
      if (start >= oneWeekAgo) wMs += diff;
      if (start >= oneMonthAgo) mMs += diff;
    });

    setStats({ daily: getHours(dMs), weekly: getHours(wMs), monthly: getHours(mMs) });
  };

  async function viewEmployeeLogs(emp) {
    setSelectedEmp(emp);
    const { data } = await supabase.from("sessions").select("*").eq("employee_id", emp.id).order("start_time", { ascending: false });
    setHistory(data || []);
    calculateAggregates(data || []);
    setShowLogs(true);
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#ff6b35] italic leading-none">DASHBOARD</h1>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-2">{shopName} Admin Panel</p>
        </div>
        <button onClick={() => router.push("/staff")} className="text-xs font-bold bg-[#1a1a22] px-5 py-2 rounded-2xl border border-[#2a2a38]">Exit Admin</button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-[#1a1a22] p-6 rounded-[32px] border border-[#2a2a38]">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Live Now</p>
          <p className="text-4xl font-black text-green-500 tabular-nums">{employees.filter(e => sessions.some(s => s.employee_id === e.id && !s.end_time)).length}</p>
        </div>
        <div className="bg-[#1a1a22] p-6 rounded-[32px] border border-[#2a2a38]">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Total Workers</p>
          <p className="text-4xl font-black text-[#ff6b35] tabular-nums">{employees.filter(e => e.role !== 'owner').length}</p>
        </div>
      </div>

      {/* 1. ADD EMPLOYEE FORM */}
      <div className="bg-[#1a1a22] p-8 rounded-[40px] border border-[#2a2a38] mb-10 shadow-2xl">
        <h3 className="text-xs font-black text-gray-400 uppercase mb-6 tracking-widest">Register New Staff</h3>
        <form onSubmit={handleAddEmployee} className="flex flex-col gap-4">
          <input 
            placeholder="Full Name" 
            className="w-full bg-[#0f0f13] border border-[#2a2a38] p-5 rounded-[24px] outline-none focus:border-[#ff6b35] transition-all"
            value={newName} onChange={(e)=>setNewName(e.target.value)} required 
          />
          <div className="flex gap-3">
            <input 
              placeholder="4-Digit PIN" 
              maxLength={4}
              className="flex-1 bg-[#0f0f13] border border-[#2a2a38] p-5 rounded-[24px] text-center font-mono text-xl outline-none focus:border-[#ff6b35]"
              value={newPin} onChange={(e)=>setNewPin(e.target.value)} required 
            />
            <button disabled={loading} className="bg-[#ff6b35] px-10 rounded-[24px] font-black uppercase text-xs active:scale-95 transition-all">
              {loading ? "..." : "Add"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. ATTENDANCE LOG & DELETE */}
      <h3 className="text-xs font-black text-gray-700 uppercase mb-5 tracking-widest ml-4">Staff Management</h3>
      <div className="space-y-4 pb-20">
        {employees.filter(e => e.role !== 'owner').map(emp => (
          <div key={emp.id} className="bg-[#1a1a22] p-6 rounded-[35px] border border-[#2a2a38] group transition-all">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#ff6b3511] flex items-center justify-center text-2xl border border-[#ff6b3522]">{emp.avatar}</div>
                <div>
                  <p className="font-black text-lg">{emp.name}</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase">PIN: {emp.pin}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(emp.id)} className="text-[9px] text-red-900 font-black uppercase border border-red-950 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-all">Remove</button>
            </div>
            
            <button 
              onClick={() => viewEmployeeLogs(emp)}
              className="w-full py-4 bg-[#0f0f13] rounded-2xl text-[#ff6b35] font-black text-xs uppercase tracking-widest border border-[#2a2a38] hover:bg-[#ff6b35] hover:text-white transition-all"
            >
              View Full Logs & Analytics →
            </button>
          </div>
        ))}
      </div>

      {/* --- HISTORY MODAL --- */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/95 flex items-end sm:items-center justify-center p-0 sm:p-6 z-50 backdrop-blur-xl">
          <div className="bg-[#0f0f13] w-full max-w-2xl h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-[50px] sm:rounded-[48px] border-t sm:border border-[#2a2a38] flex flex-col">
            <div className="p-8 border-b border-[#2a2a38] flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{selectedEmp.avatar}</div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">{selectedEmp.name}</h3>
              </div>
              <button onClick={() => setShowLogs(false)} className="bg-[#1a1a22] px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-[#2a2a38]">Close</button>
            </div>

            <div className="grid grid-cols-3 gap-1 p-6 bg-[#1a1a22]/30">
                <div className="text-center"><p className="text-[8px] font-bold text-gray-600 uppercase">Today</p><p className="text-sm font-black">{stats.daily}</p></div>
                <div className="text-center border-x border-[#2a2a38]"><p className="text-[8px] font-bold text-gray-600 uppercase">7 Days</p><p className="text-sm font-black text-[#ff6b35]">{stats.weekly}</p></div>
                <div className="text-center"><p className="text-[8px] font-bold text-gray-600 uppercase">30 Days</p><p className="text-sm font-black">{stats.monthly}</p></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {history.map((log) => (
                <div key={log.id} className="bg-[#1a1a22] p-5 rounded-3xl border border-[#2a2a38] flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{new Date(log.start_time).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    <p className="text-xs font-black">{new Date(log.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {log.end_time ? new Date(log.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active"}</p>
                  </div>
                  <p className="text-[#ff6b35] font-black text-sm">{log.end_time ? `${Math.floor((new Date(log.end_time) - new Date(log.start_time)) / 3600000)}h ${Math.floor(((new Date(log.end_time) - new Date(log.start_time)) % 3600000) / 60000)}m` : "LIVE"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}