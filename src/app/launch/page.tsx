"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Globe, 
  ArrowRight, 
  Coins, 
  Info,
  Clock,
  Sparkles,
  TrendingUp,
  Search,
  CheckCircle2
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { LAUNCH_SCHEDULE, LaunchCountry } from "../../data/launches";
import { SupabaseService } from "../../services/supabase";

export default function LaunchSchedulePage() {
  const { solPrice } = useCart();
  const [launchesList, setLaunchesList] = useState<LaunchCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<LaunchCountry | null>(null);
  const [calcValue, setCalcValue] = useState<string>("100");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load launches dynamically
    const dbLaunches = SupabaseService.getLaunches();
    if (dbLaunches && dbLaunches.length > 0) {
      setLaunchesList(dbLaunches);
      setSelectedCountry(dbLaunches[0]);
    } else {
      setLaunchesList(LAUNCH_SCHEDULE);
      setSelectedCountry(LAUNCH_SCHEDULE[0]);
    }
  }, []);

  // Calculate SOL conversion based on input value
  const calculateSol = (valueStr: string, country: LaunchCountry) => {
    const value = parseFloat(valueStr);
    if (isNaN(value) || value <= 0) return "0.0000";
    
    // Value in local currency -> USD -> SOL
    const valueInUsd = value * country.rateToUsd;
    const valueInSol = valueInUsd / solPrice;
    
    return valueInSol.toFixed(4);
  };

  const handleCountrySelect = (country: LaunchCountry) => {
    setSelectedCountry(country);
  };

  // Filter countries by search query
  const filteredSchedule = launchesList.filter(item => 
    item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-20 min-h-screen bg-black text-white">
      
      {/* Hero Header */}
      <section className="relative w-full py-16 md:py-24 border-b border-[#222222] bg-[#000000] flex flex-col items-center text-center px-4">
        {/* Subtle background red glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF0000]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        
        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF0000]/30 bg-[#FF0000]/5 text-xs text-[#FF0000] font-black uppercase tracking-wider mb-6">
            <span className="h-2 w-2 rounded-full bg-[#FF0000] animate-pulse"></span>
            Weekly Launch Plan
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none text-white uppercase">
            Global Coverage <span className="text-[#FF0000]">Soon</span>.
          </h1>
          
          <p className="max-w-2xl text-sm sm:text-base text-zinc-400 mt-6 leading-relaxed">
            We are launching supported countries weekly. Below you can check the exact launch dates, currency conversions to SOL, and the list of countries to be accepted on SOLCart.
          </p>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Dynamic SOL Conversion Calculator (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="border border-[#222222] bg-[#0A0A0A] p-6 rounded-2xl shadow-xl flex flex-col gap-6">
              
              <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-[#FF0000]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    SOL Conversion Calculator
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/30 text-[9px] font-black tracking-wide uppercase">
                  Live Rates
                </span>
              </div>

              {/* Calculator Form */}
              <div className="space-y-4">
                
                {/* Select Country */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                    Select Target Country
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCountry?.code || ""}
                      onChange={(e) => {
                        const found = launchesList.find(c => c.code === e.target.value);
                        if (found) setSelectedCountry(found);
                      }}
                      className="w-full h-12 bg-black border border-[#222222] rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/25 cursor-pointer appearance-none"
                    >
                      {launchesList.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.country} ({item.currency}) {item.status === "active" ? "— Active" : "— Coming Soon"}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                      <Globe className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Local Currency Amount */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                    Gift Card Amount ({selectedCountry?.currency || ""})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={calcValue}
                      onChange={(e) => setCalcValue(e.target.value)}
                      className="w-full h-12 bg-black border border-[#222222] rounded-xl pl-10 pr-4 text-sm font-bold text-white focus:outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]/25"
                      placeholder="e.g. 100"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#FF0000] select-none">
                      {selectedCountry?.symbol || "$"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Conversion Result Block */}
              <div className="bg-black border border-[#222222] p-5 rounded-xl flex flex-col items-center justify-center text-center mt-2">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Estimated Gift Card Conversion to SOL
                </span>
                
                <div className="text-3xl sm:text-4xl font-black text-[#FF0000] mt-3 tracking-tighter">
                  {selectedCountry ? calculateSol(calcValue, selectedCountry) : "0.0000"} <span className="text-white text-lg font-bold">SOL</span>
                </div>
                
                <span className="text-[9px] text-zinc-500 mt-2 font-mono">
                  Based on local rate of {selectedCountry?.symbol || "$"}1.00 = {selectedCountry?.rateToUsd || 1.0} USD
                </span>
              </div>

              {/* Live Info details */}
              <div className="border-t border-[#222222] pt-4 flex flex-col gap-2.5 text-[11px] text-zinc-400">
                <div className="flex justify-between items-center">
                  <span>Current SOL Settlement Price:</span>
                  <span className="font-bold text-white font-mono">${solPrice.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Country Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    selectedCountry?.status === "active" 
                      ? "bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/25"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}>
                    {selectedCountry?.status === "active" ? "Active Now" : "Upcoming Weekly Launch"}
                  </span>
                </div>
                {selectedCountry?.status === "upcoming" && (
                  <div className="flex justify-between items-center">
                    <span>Target Launch Date:</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#FF0000]" />
                      {selectedCountry?.launchDate}
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Quick Informational Notice */}
            <div className="border border-[#222222] bg-[#0A0A0A]/50 p-4 rounded-xl text-xs text-zinc-400 flex gap-3">
              <Info className="h-5 w-5 text-[#FF0000] shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-bold text-white uppercase tracking-wider text-[10px]">Settlement Transparency</p>
                <p className="leading-relaxed">
                  Gift card purchases are settled at live exchange rates. All transactions require connection to a Solana wallet (e.g. Phantom, Solflare, Backpack) for instant, automated smart contract execution.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Country Timeline & Launch dates (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Filter and Search controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border border-[#222222] bg-[#0A0A0A] p-4 rounded-xl">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search countries, currencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-black border border-[#222222] rounded-lg pl-9 pr-4 text-xs font-bold text-white focus:outline-none focus:border-[#FF0000]"
                />
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
              </div>
              
              <div className="flex gap-2.5 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <span className="flex items-center gap-1 text-white">
                  <span className="h-2 w-2 rounded-full bg-[#FF0000]"></span>
                  {launchesList.filter(l => l.status === "active").length} Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-zinc-700"></span>
                  {launchesList.filter(l => l.status === "upcoming").length} Upcoming
                </span>
              </div>
            </div>

            {/* Launch Timeline list */}
            <div className="space-y-4">
              {filteredSchedule.map((item, idx) => {
                const isSelected = selectedCountry?.code === item.code;
                
                return (
                  <motion.div
                    key={item.code}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
                    onClick={() => handleCountrySelect(item)}
                    className={`border cursor-pointer transition-all duration-300 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? "border-[#FF0000] bg-[#FF0000]/5 shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                        : "border-[#222222] bg-[#0A0A0A] hover:border-zinc-700"
                    }`}
                  >
                    {/* Left: Flag, Country, Currency info */}
                    <div className="flex items-center gap-4">
                      {/* Flag Image via FlagCDN */}
                      <img
                        src={`https://flagcdn.com/w80/${item.code.toLowerCase()}.png`}
                        alt={`${item.country} Flag`}
                        className="w-12 h-8 object-cover rounded border border-zinc-800 shadow"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-base tracking-tight">{item.country}</h4>
                          <span className="text-xs font-mono font-bold text-[#FF0000]">
                            ({item.currency})
                          </span>
                        </div>
                        
                        <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
                          {item.status === "active" ? (
                            <span className="text-[#FF0000] font-black flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Active settlement now
                            </span>
                          ) : (
                            <span className="text-zinc-500 font-bold flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Weekly Gap: Launching {item.launchDate}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right: Quick Conversion display */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-l sm:border-[#222222] sm:pl-6 border-t border-[#222222] sm:border-t-0 pt-3 sm:pt-0">
                      
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-black block">
                          Sample Conversion
                        </span>
                        <span className="text-sm font-bold text-white">
                          {item.symbol}100 = <strong className="text-[#FF0000]">{calculateSol("100", item)} SOL</strong>
                        </span>
                      </div>

                      <div className="h-8 w-8 rounded-full border border-[#222222] flex items-center justify-center bg-black hover:bg-[#FF0000] hover:border-[#FF0000] transition-colors group shrink-0">
                        <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-black transition-colors" />
                      </div>

                    </div>

                  </motion.div>
                );
              })}
              
              {filteredSchedule.length === 0 && (
                <div className="border border-[#222222] bg-[#0A0A0A] p-12 text-center rounded-xl text-zinc-500">
                  <Globe className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
                  <p className="font-bold text-white uppercase tracking-wider text-xs">No Countries Found</p>
                  <p className="text-xs text-zinc-500 mt-1">Try searching for a different country name or currency code.</p>
                </div>
              )}

            </div>

            {/* Submit request block */}
            <div className="border border-[#222222] bg-[#0A0A0A] p-8 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div className="space-y-1">
                <h4 className="font-black text-white text-lg tracking-tight uppercase">Don't see your country?</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We are scaling fast and adding weekly new country settlement models. Request your region now!
                </p>
              </div>
              <a
                href="/contact?subject=Country Request"
                className="px-6 py-3 rounded-full bg-[#FF0000] text-black font-black text-xs hover:scale-102 hover:bg-[#E30A17] transition-all whitespace-nowrap"
              >
                Request My Country
              </a>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
