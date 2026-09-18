// Single source for public contact details used across the site.
export const CONTACT_EMAIL = "contact@asjohan.com";
export const LINKEDIN_URL = "https://linkedin.com/in/johanalvarez";

// Tools shown on each service card, keyed by the service id in lib/i18n.ts.
export const SERVICE_TOOLS: Record<string, string[]> = {
  outbound: ["Clay", "Apollo", "Salesforce", "HubSpot", "n8n"],
  crm: ["Salesforce", "HubSpot", "ActiveCampaign", "n8n", "Twilio"],
  tracking: ["Server-side GTM", "GA4", "PostHog", "Triple Whale", "Wicked Reports"],
  mvp: ["Next.js", "Supabase", "v0", "Claude Code", "Vercel"],
};

export const STACK = [
  "Clay",
  "Apollo",
  "n8n",
  "Salesforce",
  "HubSpot",
  "ActiveCampaign",
  "Server-side GTM",
  "GA4",
  "Triple Whale",
  "Wicked Reports",
  "Next.js",
  "Supabase",
  "Claude Code",
];
