"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Ruler, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Maximize2,
  DollarSign,
  PhoneCall
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlowButton } from "@/components/ui/glow-button";

interface Option {
  id: string;
  title: string;
  desc: string;
  priceDelta: number;
  badge?: string;
}

const OPENING_OPTIONS: Option[] = [
  {
    id: "single",
    title: "Single Entry Door (36\" × 80\")",
    desc: "Standard residential entry opening with custom weatherstripped jamb.",
    priceDelta: 1800,
  },
  {
    id: "double",
    title: "Double French Doors (72\" × 80\")",
    desc: "Grand center-opening double doors with astragal seal and dual locks.",
    priceDelta: 3400,
    badge: "Most Popular",
  },
  {
    id: "pivot",
    title: "Architectural Pivot Door (48\" × 96\")",
    desc: "Modern oversized pivot hinge system for luxury contemporary entrances.",
    priceDelta: 5200,
    badge: "High-End Luxury",
  },
  {
    id: "patio",
    title: "3-Panel Multi-Slide Patio (108\" × 96\")",
    desc: "Indoor-outdoor seamless transition system with high-durability rollers.",
    priceDelta: 6800,
  }
];

const MATERIAL_OPTIONS: Option[] = [
  {
    id: "fiberglass",
    title: "Woodgrain Composite Fiberglass",
    desc: "Zero rot, high R-value insulation, dent-proof, textured stain finish.",
    priceDelta: 600,
    badge: "Best Value",
  },
  {
    id: "steel",
    title: "Thermally Broken Architectural Steel",
    desc: "Ultra-slim sightlines, maximum structural strength, insulated thermal barrier.",
    priceDelta: 1600,
  },
  {
    id: "iron",
    title: "Hand-Forged Wrought Iron",
    desc: "Heavy 12-gauge steel scrollwork with independent operable glass panel for cleaning.",
    priceDelta: 2400,
    badge: "Maximum Security",
  },
  {
    id: "mahogany",
    title: "Solid Honduran Mahogany",
    desc: "Handcrafted natural hardwood with 6-stage UV protective marine polyurethane finish.",
    priceDelta: 2100,
  }
];

const GLASS_OPTIONS: Option[] = [
  {
    id: "clear_lowe",
    title: "Dual Insulated Low-E Clear Glass",
    desc: "Argon gas-filled double pane. High energy efficiency, maximum daylight.",
    priceDelta: 350,
  },
  {
    id: "privacy",
    title: "Acid-Etched Privacy Frosted Glass",
    desc: "Diffused natural light with 100% interior privacy from street view.",
    priceDelta: 450,
  },
  {
    id: "impact",
    title: "High-Velocity Hurricane Impact Glass",
    desc: "Laminated shatter-proof glass certified for 150+ MPH coastal wind & debris.",
    priceDelta: 950,
    badge: "Florida / Coastal Code",
  },
  {
    id: "solid",
    title: "Solid Flush Core (No Glass)",
    desc: "Maximum insulation and privacy with raised or flat architectural panels.",
    priceDelta: 0,
  }
];

const HARDWARE_OPTIONS: Option[] = [
  {
    id: "pullbar",
    title: "48\" Matte Black Architectural Pull Bar",
    desc: "Floor-to-handle brushed black stainless pull with commercial roller catch.",
    priceDelta: 450,
    badge: "Modern Trend",
  },
  {
    id: "smart",
    title: "Smart Biometric / WiFi Keyless Deadbolt",
    desc: "Fingerprint scanner, smartphone remote unlocking, and encrypted key backup.",
    priceDelta: 380,
    badge: "Smart Home Ready",
  },
  {
    id: "mortise",
    title: "Commercial Multi-Point Mortise Lock",
    desc: "Locks at 3 frame points simultaneously for airtight seal and anti-pry resistance.",
    priceDelta: 550,
  },
  {
    id: "standard",
    title: "Standard Satin Nickel Lever & Deadbolt",
    desc: "Grade 1 commercial-tested brass cylinder with lifetime mechanical warranty.",
    priceDelta: 180,
  }
];

export default function DoorEstimatorDemo() {
  const [opening, setOpening] = useState(OPENING_OPTIONS[0]);
  const [material, setMaterial] = useState(MATERIAL_OPTIONS[0]);
  const [glass, setGlass] = useState(GLASS_OPTIONS[0]);
  const [hardware, setHardware] = useState(HARDWARE_OPTIONS[0]);

  // Lead capture state
  const [step, setStep] = useState<"configure" | "submitted">("configure");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerZip, setCustomerZip] = useState("");

  const basePrice = opening.priceDelta + material.priceDelta + glass.priceDelta + hardware.priceDelta;
  const priceLow = Math.round(basePrice * 0.95);
  const priceHigh = Math.round(basePrice * 1.12);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;
    setStep("submitted");
  };

  return (
    <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6">
      {/* Back link & Demonstration Notice */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition">
          <ArrowLeft size={16} />
          Back to GTM Services
        </Link>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-mono">Live Interactive Demo</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="mb-8">
        <Badge variant="outline" className="mb-3 text-xs font-mono uppercase text-amber-300 border-amber-500/30 bg-amber-500/10">
          Client Case Prototype: Custom Door & Millwork Quoting Agent
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Consultative AI Door Estimator & Spec Sheet Engine
        </h1>
        <p className="mt-3 text-base text-neutral-300 max-w-3xl leading-relaxed">
          In high-ticket architectural trades (\$3,000–\$25,000 AOV), buyers hesitate because they don't know the exact codes or dimensions. 
          This AI engine guides them through specifications in under 60 seconds, generates an instant ballpark quote, and converts 
          after-hours visitors into scheduled laser-measurement visits.
        </p>
      </div>

      {/* The Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Selector */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Opening */}
          <div className="rounded-xl border border-white/10 bg-neutral-950/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">1</span>
                <h2 className="text-base font-semibold text-white">Opening Size & Configuration</h2>
              </div>
              <Ruler size={16} className="text-neutral-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OPENING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOpening(opt)}
                  className={`text-left p-3.5 rounded-lg border transition text-sm ${
                    opening.id === opt.id
                      ? "border-amber-400 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-400/50"
                      : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{opt.title}</span>
                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Material */}
          <div className="rounded-xl border border-white/10 bg-neutral-950/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">2</span>
                <h2 className="text-base font-semibold text-white">Door Slab & Frame Material</h2>
              </div>
              <Layers size={16} className="text-neutral-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MATERIAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMaterial(opt)}
                  className={`text-left p-3.5 rounded-lg border transition text-sm ${
                    material.id === opt.id
                      ? "border-amber-400 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-400/50"
                      : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{opt.title}</span>
                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Glass & Code */}
          <div className="rounded-xl border border-white/10 bg-neutral-950/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">3</span>
                <h2 className="text-base font-semibold text-white">Glass Inserts & Coastal Wind Rating</h2>
              </div>
              <ShieldCheck size={16} className="text-neutral-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GLASS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGlass(opt)}
                  className={`text-left p-3.5 rounded-lg border transition text-sm ${
                    glass.id === opt.id
                      ? "border-amber-400 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-400/50"
                      : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{opt.title}</span>
                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Hardware */}
          <div className="rounded-xl border border-white/10 bg-neutral-950/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">4</span>
                <h2 className="text-base font-semibold text-white">Hardware & Access Control</h2>
              </div>
              <Sparkles size={16} className="text-neutral-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HARDWARE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setHardware(opt)}
                  className={`text-left p-3.5 rounded-lg border transition text-sm ${
                    hardware.id === opt.id
                      ? "border-amber-400 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-400/50"
                      : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{opt.title}</span>
                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Estimate & Lead Conversion */}
        <div className="lg:col-span-5 sticky top-6 space-y-6">
          {/* Dynamic Price Calculation Box */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-2">
              <span>ESTIMATED BALLPARK</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Check size={12} /> Includes Laser Measurement
              </span>
            </div>

            <div className="mb-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                ${priceLow.toLocaleString()} – ${priceHigh.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Turnkey estimate including custom jamb fabrication, weatherstripping, and factory pre-hung assembly.
              </p>
            </div>

            {/* Spec Breakdown List */}
            <div className="border-t border-white/10 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-400">Opening:</span>
                <span className="font-medium text-white text-right">{opening.title}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-400">Core Material:</span>
                <span className="font-medium text-white text-right">{material.title}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-400">Glazing:</span>
                <span className="font-medium text-white text-right">{glass.title}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-400">Hardware:</span>
                <span className="font-medium text-white text-right">{hardware.title}</span>
              </div>
            </div>

            {/* Form Section */}
            {step === "configure" ? (
              <form onSubmit={handleSubmit} className="mt-6 border-t border-white/10 pt-4 space-y-3">
                <p className="text-xs font-medium text-amber-200">
                  📩 Send Me This Itemized Spec Sheet & Book Measurement
                </p>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g., Sarah Jenkins)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="Cell (for SMS quote)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={customerZip}
                    onChange={(e) => setCustomerZip(e.target.value)}
                    className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address (optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <GlowButton type="submit" className="w-full justify-center">
                  Lock In Estimate & Request Visit
                  <ArrowRight size={16} data-icon="inline-end" />
                </GlowButton>
              </form>
            ) : (
              <div className="mt-6 border-t border-white/10 pt-5 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-base font-semibold text-white">Spec Sheet Dispatched!</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Sent to <span className="text-white font-mono">{customerPhone || "your phone"}</span>. Our lead estimator has been notified with your exact specs:
                  <br />
                  <span className="text-amber-300 font-semibold">{opening.title} in {material.title}</span>.
                </p>
                <div className="rounded-lg bg-white/5 p-3 border border-white/10 text-left text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Calendar size={14} /> Laser Measurement Scheduled
                  </div>
                  <p className="text-neutral-400">
                    A technician will confirm your entry opening rough dimensions before fabrication begins.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("configure")}
                  className="text-xs text-neutral-400 hover:text-white underline pt-2"
                >
                  Modify Specifications
                </button>
              </div>
            )}
          </div>

          {/* The Pitch to Prospective Business Owners */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PhoneCall size={16} className="text-amber-400" />
              For Business Owners & Sales Directors:
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              When a homeowner or contractor browses your site at 8 PM, they won't fill out a generic "Contact Us" form. 
              They want answers. By giving them instant spec guidance and a realistic ballpark, you capture 
              <strong> 2–4× more high-intent appointments</strong> directly synced to your CRM (HubSpot, Jobber, or Google Sheets).
            </p>
            <div className="border-t border-white/10 pt-3">
              <Link 
                href="/contact"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                Discuss deploying this on your catalog →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
