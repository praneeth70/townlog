"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ShiftTimer() {
  const [emp, setEmp] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [now, setNow] = useState(Date.now());
  const router = useRouter();

  useEffect(() => {
    const savedEmp = localStorage.getItem("selected_emp");
    if (!savedEmp) return router.push("/staff");
    const parsedEmp = JSON.parse(savedEmp);
    setEmp(parsedEmp);

    async function checkStatus() {
      const { data } = await supabase.from("sessions").select("*").eq("employee_id", parsedEmp.id).is("end_time", null).single();
      if (data) { setActiveSession(data); setIsWorking(true); }
    }
    checkStatus();
  }, []);

  useEffect(() => {
    let interval;
    if (isWorking) interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isWorking]);

  async function handleStart() {
    const { data } = await supabase.from("sessions").insert([{ employee_id: emp.id, start_time: new Date().toISOString() }]).select().single();
    setActiveSession(data); setIsWorking(true);
  }

  async function handleStop() {
    await supabase.from("sessions").update({ end_time: new Date().toISOString() }).eq("id", activeSession.id);
    setIsWorking(false); setActiveSession(null);
  }

  if (!emp) return null;
  const elapsed = activeSession ? now - new Date(activeSession.start_time) : 0;

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white flex flex-col items-center justify-center p-6 text-center">
      <button onClick={() => router.push("/staff")} className="absolute top-10 left-6 text-gray-500">← Back</button>
      <div className="w-20 h-20 rounded-full bg-[#ff6b3511] border-2 border-[#ff6b3533] flex items-center justify-center text-2xl mb-4">{emp.avatar}</div>
      <h2 className="text-xl font-bold mb-10">{emp.name}</h2>
      {isWorking ? (
        <>
          <div className="text-6xl font-mono font-black text-green-500 mb-2">{new Date(elapsed).toISOString().slice(11, 19)}</div>
          <p className="text-gray-500 mb-14 text-sm">Working Session Active</p>
          <button onClick={handleStop} className="w-56 h-56 rounded-full bg-red-600 border-8 border-red-900/30 text-white font-black text-xl shadow-2xl active:scale-95 transition-all uppercase">Stop Work</button>
        </>
      ) : (
        <button onClick={handleStart} className="w-56 h-56 rounded-full bg-green-600 border-8 border-green-900/30 text-white font-black text-xl shadow-2xl active:scale-95 transition-all uppercase">Start Work</button>
      )}
    </div>
  );
}