// Energy Media pricing: every "from" price on the agency site lives here.
// Prices are USD. Ad spend is never included: the client pays Google or Meta directly.

export type SetupId = "website" | "email" | "crm" | "tracking" | "seo";
export type ChannelId = "google" | "meta" | "seo" | "email" | "social";
export type PaymentModel = "monthly" | "commission";

export const SETUP_IDS: SetupId[] = ["website", "email", "crm", "tracking", "seo"];
export const CHANNEL_IDS: ChannelId[] = ["google", "meta", "seo", "email", "social"];
export const AD_CHANNELS: ChannelId[] = ["google", "meta"];

export const PRICING = {
  setup: {
    website: 3500,
    email: 800,
    crm: 1200,
    tracking: 800,
    seo: 1000,
  } satisfies Record<SetupId, number>,
  // Setup is discounted when the client also keeps a monthly plan.
  planSetupDiscount: 0.5,
  monthly: {
    google: 1000,
    meta: 1000,
    seo: 1000,
    email: 800,
    social: 500,
  } satisfies Record<ChannelId, number>,
  includedCampaigns: 3,
  extraCampaign: 200,
  video: 150,
  graphic: 50,
  weeksPerMonth: 4,
  commission: {
    // Share of the monthly fee paid on the commission model.
    monthlyShare: 0.5,
    // Share of new revenue that tracking attributes to our work.
    revenueShare: 0.1,
  },
  limits: {
    campaigns: { min: 1, max: 10 },
    videosPerWeek: { min: 0, max: 7 },
    graphicsPerMonth: { min: 0, max: 40 },
  },
} as const;

export interface PlanInput {
  setup: SetupId[];
  channels: ChannelId[];
  campaigns: number;
  videosPerWeek: number;
  graphicsPerMonth: number;
  payment: PaymentModel;
}

export interface Quote {
  setupFull: number;
  setupDue: number;
  setupDiscounted: boolean;
  monthlyFull: number;
  monthlyDue: number;
  hasPlan: boolean;
  revenueShare: number | null;
}

export function quote(input: PlanInput): Quote {
  const setupFull = input.setup.reduce((sum, id) => sum + PRICING.setup[id], 0);
  const adChannels = input.channels.filter((id) => AD_CHANNELS.includes(id)).length;
  const extraCampaigns = Math.max(0, input.campaigns - PRICING.includedCampaigns);
  const monthlyFull =
    input.channels.reduce((sum, id) => sum + PRICING.monthly[id], 0) +
    adChannels * extraCampaigns * PRICING.extraCampaign +
    input.videosPerWeek * PRICING.weeksPerMonth * PRICING.video +
    input.graphicsPerMonth * PRICING.graphic;
  const hasPlan = monthlyFull > 0;
  const setupDiscounted = hasPlan && setupFull > 0;
  const setupDue = setupDiscounted
    ? Math.round(setupFull * (1 - PRICING.planSetupDiscount))
    : setupFull;
  const commission = input.payment === "commission" && hasPlan;
  const monthlyDue = commission
    ? Math.round(monthlyFull * PRICING.commission.monthlyShare)
    : monthlyFull;
  return {
    setupFull,
    setupDue,
    setupDiscounted,
    monthlyFull,
    monthlyDue,
    hasPlan,
    revenueShare: commission ? PRICING.commission.revenueShare : null,
  };
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

// Starting points shown on the home page. Each one opens the calculator preset
// on /services?plan=<id>#pricing, and its prices always come from quote().
export type ExamplePlanId = "starter" | "growth" | "full";
export const EXAMPLE_PLAN_IDS: ExamplePlanId[] = ["starter", "growth", "full"];
export const EXAMPLE_PLANS: Record<ExamplePlanId, Omit<PlanInput, "payment">> = {
  starter: {
    setup: ["tracking"],
    channels: ["google"],
    campaigns: 3,
    videosPerWeek: 0,
    graphicsPerMonth: 0,
  },
  growth: {
    setup: ["website", "crm", "tracking"],
    channels: ["google", "meta"],
    campaigns: 3,
    videosPerWeek: 0,
    graphicsPerMonth: 4,
  },
  full: {
    setup: ["website", "email", "crm", "tracking", "seo"],
    channels: ["google", "meta", "email", "social"],
    campaigns: 3,
    videosPerWeek: 1,
    graphicsPerMonth: 8,
  },
};

export function isExamplePlanId(value: string | undefined): value is ExamplePlanId {
  return value === "starter" || value === "growth" || value === "full";
}
