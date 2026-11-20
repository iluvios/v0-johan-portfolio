// Single source for public contact details used across both sites.
export const CONTACT_EMAIL = "contact@asjohan.com";
export const AGENCY_EMAIL =
  process.env.NEXT_PUBLIC_AGENCY_EMAIL || "contact@energymedia.com.co";
export const LINKEDIN_URL = "https://linkedin.com/in/johanalvarez";

// Shown on the portfolio home as plain names; only clients already named publicly on the CV or a project page.
export const CLIENTS = [
  "Building Intelligence",
  "Rainforest Foundation US",
  "Revy Autos",
  "Savant International",
  "Autobruder 4WD",
  "International Nurses",
  "Conformational Aesthetics",
  "PSL Software",
];

export const STACK = [
  "Clay",
  "Apollo",
  "n8n",
  "Salesforce",
  "HubSpot",
  "ActiveCampaign",
  "Meta Ads",
  "Google Ads",
  "LinkedIn Ads",
  "Server GTM",
  "GA4",
  "Triple Whale",
  "Wicked Reports",
  "Figma",
  "Webflow",
  "Next.js",
  "Supabase",
  "Claude Code",
];

// Agency calls to action. Set NEXT_PUBLIC_AGENCY_BOOKING_URL (Calendly, Cal.com) to send
// "Get a free audit" straight to a calendar, and NEXT_PUBLIC_AGENCY_WHATSAPP (digits with
// country code) to show the floating WhatsApp button. Without them, CTAs go to /contact.
export const AGENCY_BOOKING_URL = process.env.NEXT_PUBLIC_AGENCY_BOOKING_URL || "";
export const AGENCY_WHATSAPP = (process.env.NEXT_PUBLIC_AGENCY_WHATSAPP || "").replace(/\D/g, "");
export const AGENCY_CTA_HREF = AGENCY_BOOKING_URL || "/contact";
