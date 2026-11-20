import fs from "node:fs"
import path from "node:path"
import { ACTIVE_LOCAL_COHORTS, ensureAuditDirs, W2W_DIR } from "./config"

export interface W2wCohortBenchmark {
  cohort: string
  label: string
  w2wCategories: string[]
  provenAdHooks: string[]
  recommendedFunnelPattern: string
  referenceAdSummary: string
  updatedAt: string
}

// Builds & merges $0 Web2Wave industry reference benchmarks (never calls paid creatives/generate!)
async function main() {
  ensureAuditDirs()
  const outFile = path.join(W2W_DIR, "benchmarks.json")

  let existing: Record<string, W2wCohortBenchmark> = {}
  if (fs.existsSync(outFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(outFile, "utf8"))
    } catch {
      existing = {}
    }
  }

  const curatedDefaults: Record<string, Omit<W2wCohortBenchmark, "cohort" | "label" | "w2wCategories" | "updatedAt">> = {
    med_spa_aesthetics: {
      provenAdHooks: [
        "Local patient transformation + transparent monthly payment ('From $149/mo with 0% APR')",
        "60-Second Treatment Match Quiz -> Instant VIP Consultation Voucher",
        "Doctor/Injector authority video + '200+ 5-Star Local Reviews' proof bar",
      ],
      recommendedFunnelPattern: "4-step Goal & Skin/Smile Assessment -> Instant Package Range -> Direct Calendar Booking",
      referenceAdSummary: "W2W Beauty/Dental benchmark: High-contrast before/after + specific local new-patient voucher outperforms generic brand awareness 3.1x.",
    },
    home_services_ads: {
      provenAdHooks: [
        "60-Second Roof / HVAC / Solar Ballpark Estimator (Zip Code + Home SqFt)",
        "Same-Day Local Dispatch + '$0 Down / Financing Approved in 2 Minutes'",
        "Storm / Seasonal Inspection Offer backed by 150+ local 5-star Google reviews",
      ],
      recommendedFunnelPattern: "3-click Property & Issue Selector -> Instant Cost Range -> Priority Dispatch Call/SMS",
      referenceAdSummary: "W2W Home Improvement benchmark: Instant-quote interactive quiz funnels convert cold local paid clicks at 14-22% vs 3-5% on static forms.",
    },
    law_firms: {
      provenAdHooks: [
        "'Do I Have a Case?' 45-Second Confidential Case Value & Eligibility Check",
        "Local Verdicts & Settlements Proof + '$0 Out-of-Pocket Unless We Win'",
        "Direct Attorney 24/7 Text/Chat Intake (Bilingual English/Spanish)",
      ],
      recommendedFunnelPattern: "3-question Incident & Timeline Qualifier -> Instant Case Review Priority Routing",
      referenceAdSummary: "W2W High-Ticket Services benchmark: Low-friction eligibility quiz + instant SMS callback captures 2.4x more qualified claimants than 9-field legal forms.",
    },
    specialty_auto: {
      provenAdHooks: [
        "Select Your Vehicle Make/Model -> Get Instant PPF / Wrap / Ceramic Package Pricing",
        "Close-up gloss/rock-chip protection visual + 10-Year XPEL/3M Warranty badge",
        "Shop bay showcase of local exotics/trucks + 'Book Drop-Off Slot Online'",
      ],
      recommendedFunnelPattern: "Vehicle Type + Protection Goal Selector -> Good/Better/Best Package Quote + Deposit/Slot Hold",
      referenceAdSummary: "W2W Auto benchmark: Vehicle-specific instant package pricing eliminates tire-kickers and lifts booked bay deposits.",
    },
    custom_building: {
      provenAdHooks: [
        "Visualize Your Entryway / Remodel: Browse Local Projects + Unlock Price Guide",
        "Factory-Direct / Custom Measure & Install in [City] — Free In-Home Design Quote",
        "Before/After Curb-Appeal Transformation + Homeowner Financing Option",
      ],
      recommendedFunnelPattern: "Style & Opening Size Picker -> Download Lookbook/Price Tier -> Book In-Home Measurement",
      referenceAdSummary: "W2W Remodeling benchmark: Visual style-picker lead magnets capture homeowners early with 40% lower CPL than 'Contact Us' pages.",
    },
    event_venues: {
      provenAdHooks: [
        "Download Our Full 2026-2027 Wedding & Event Pricing Guide Instantly (No 48hr Wait)",
        "Check Your Preferred Date & Guest Capacity in 30 Seconds + Book a Private Tour",
        "Real Golden-Hour Venue Gallery + 'Rated 4.9★ by 150+ Local Couples'",
      ],
      recommendedFunnelPattern: "Event Type + Guest Count + Season Picker -> Instant Pricing PDF Unlock -> Live Tour Scheduler",
      referenceAdSummary: "W2W High-Ticket Venue benchmark: Instant pricing-brochure unlock + immediate tour calendar doubles booked venue walkthroughs.",
    },
    real_estate: {
      provenAdHooks: [
        "Instant Local Home Valuation / Rental Cash-Flow Estimate for [City] Owners",
        "Off-Market & Coming-Soon [City] Listings Curated to Your Price & School Zone",
        "Full-Service Property Management ROI Calculator + '0% Vacancy Guarantee'",
      ],
      recommendedFunnelPattern: "Address / Portfolio Goal Step -> Instant Valuation / Management Fee Breakdown -> Strategy Call",
      referenceAdSummary: "W2W Real Estate benchmark: Interactive valuation & rental-income calculators consistently beat generic agent bio pages.",
    },
    healthcare_clinics: {
      provenAdHooks: [
        "Same-Week New-Patient / Urgent Pet Visit Slot + 'Verify Your Insurance in 30 Seconds'",
        "24/7 Web & SMS Symptom / Appointment Triage (Zero Phone Hold Loops)",
        "Doctor / Vet Authority Intro + 150+ Local Patient/Pet-Parent 5★ Reviews",
      ],
      recommendedFunnelPattern: "Symptom/Visit Type + Insurance Check -> Live Time-Slot Selection -> Instant SMS Confirmation",
      referenceAdSummary: "W2W Dental/Healthcare benchmark: 24/7 booking + instant insurance check lifts booked new patients 2.2x vs phone-only scheduling.",
    },
    longevity_specialty_med: {
      provenAdHooks: [
        "60-Second Confidential Candidacy Quiz ('Am I a Candidate?' + Monthly Payment Range)",
        "Surgeon / MD Clinical Outcomes Showcase + 0% APR Financing Options",
        "Private 24/7 Consultation Concierge for Late-Night Researchers",
      ],
      recommendedFunnelPattern: "Private 4-Step Eligibility Quiz -> Ballpark Package & Financing -> Discreet 1-on-1 Consult Booking",
      referenceAdSummary: "W2W High-Ticket Aesthetics/Medical benchmark: Discreet candidacy quiz + financing unlocks 3x higher consult show rates.",
    },
    urgent_home_dispatch: {
      provenAdHooks: [
        "24/7 Live Emergency Dispatch + 'Enter ZIP & Issue for 60-Second Arrival Window'",
        "Upfront Diagnostic Clarity + Same-Day Truck Roll Guarantee",
        "Automated Missed-Call SMS Textback + Direct Crew Scheduling",
      ],
      recommendedFunnelPattern: "Emergency vs Standard Selector -> ZIP & Issue Triage -> Immediate Dispatch Call/SMS",
      referenceAdSummary: "W2W Home Dispatch benchmark: Instant emergency triage + missed-call textback stops callers from dialing the next Google result.",
    },
    moving_cleaning: {
      provenAdHooks: [
        "30-Second Move Size / SqFt Ballpark Estimator (Zero 24-Hour Callback Wait)",
        "Licensed, Insured & Flat-Rate Transparent Guarantee",
        "Instant Crew Date Check + Commercial Walkthrough Booking",
      ],
      recommendedFunnelPattern: "Origin/Size or SqFt Picker -> Instant Ballpark Range -> Crew Slot Hold / Walkthrough",
      referenceAdSummary: "W2W Instant-Quote Services benchmark: Interactive size/sqft calculators cut cost-per-booked-job by 38% vs generic contact forms.",
    },
    hospitality_rentals: {
      provenAdHooks: [
        "Check Real-Time Date Availability & Group Pricing in 30 Seconds",
        "24/7 Web & Instagram DM Concierge for Yachts, Exotic Fleets & Direct Cabins",
        "Book Direct & Save vs Marketplace Fees + Verified 5★ Guest Gallery",
      ],
      recommendedFunnelPattern: "Date + Group Size + Vessel/Vehicle/Cabin Picker -> Instant Charter/Stay Quote -> Deposit Hold",
      referenceAdSummary: "W2W High-Ticket Experiences benchmark: Instant date & capacity bot converts Instagram & Google high-intent browsers immediately.",
    },
    pet_resorts_grooming: {
      provenAdHooks: [
        "Check Holiday/Weekend Boarding Availability + Clear Breed & Vaccine Rules",
        "Mobile Spa / Grooming Van Route Checker + Recurring VIP Plan",
        "24/7 Pet-Parent Q&A Bot + Instant Temperament Evaluation Booking",
      ],
      recommendedFunnelPattern: "Pet Size/Breed + Service + Dates -> Vaccine & Pricing Check -> Suite or Van Booking",
      referenceAdSummary: "W2W Pet Care benchmark: Automated vaccine Q&A + self-serve suite/van booking eliminates front-desk phone bottlenecks.",
    },
    academies_fitness: {
      provenAdHooks: [
        "Find Your Level & Book a Free Intro Trial / Campus Tour in 45 Seconds",
        "Clear Class Schedule, Age Groups & Safety Credentials Upfront",
        "24/7 Web & IG DM Program Matcher + Automated Trial Reminder",
      ],
      recommendedFunnelPattern: "Age/Goal + Schedule Preference -> Recommended Program -> Trial Pass / Campus Tour Booking",
      referenceAdSummary: "W2W Fitness/Education benchmark: 2-step program matcher + instant trial slot doubles show-up rate on paid social ads.",
    },
    event_vendors: {
      provenAdHooks: [
        "Check Your 2026–2027 Event Date & Guest-Count Package Range Instantly",
        "Portfolio Gallery + Transparent Starting Tiers (No Waiting Days for PDFs)",
        "24/7 IG DM & Web Tasting/Consult Concierge",
      ],
      recommendedFunnelPattern: "Event Date + Guest Count + Style -> Instant Package Range -> Tasting / Consult Scheduler",
      referenceAdSummary: "W2W Event Services benchmark: Instant date-availability check + ballpark package unlock captures couples before competitors reply.",
    },
  }

  for (const c of ACTIVE_LOCAL_COHORTS) {
    const def = curatedDefaults[c.cohort]
    existing[c.cohort] = {
      cohort: c.cohort,
      label: c.label,
      w2wCategories: c.w2wCategories,
      provenAdHooks: existing[c.cohort]?.provenAdHooks?.length ? existing[c.cohort].provenAdHooks : def.provenAdHooks,
      recommendedFunnelPattern: existing[c.cohort]?.recommendedFunnelPattern || def.recommendedFunnelPattern,
      referenceAdSummary: existing[c.cohort]?.referenceAdSummary || def.referenceAdSummary,
      updatedAt: new Date().toISOString(),
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(existing, null, 2), "utf8")
  console.log(`[Web2Wave] Saved $0 industry ad & funnel benchmarks across ${ Object.keys(existing).length } cohorts to ${outFile}`)
}

main().catch((err) => {
  console.error("Web2Wave benchmark script failed:", err)
  process.exit(1)
})
