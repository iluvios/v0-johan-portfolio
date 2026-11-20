"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { useLanguage } from "@/contexts/language-context";
import { calculatorCopy, type CalculatorCopy } from "@/lib/agency/copy";
import {
  AD_CHANNELS,
  CHANNEL_IDS,
  PRICING,
  SETUP_IDS,
  formatUsd,
  quote,
  type ChannelId,
  type PaymentModel,
  type PlanInput,
  type SetupId,
} from "@/lib/agency/pricing";

const DEFAULT_PLAN: Omit<PlanInput, "payment"> = {
  setup: ["website", "crm", "tracking"],
  channels: ["google", "meta"],
  campaigns: PRICING.includedCampaigns,
  videosPerWeek: 0,
  graphicsPerMonth: 0,
};

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function clamp(value: number, { min, max }: { min: number; max: number }) {
  return Math.min(max, Math.max(min, value));
}

function Stepper({
  label,
  hint,
  value,
  onChange,
  limits,
  copy,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
  limits: { min: number; max: number };
  copy: CalculatorCopy;
}) {
  // Deterministic id from the label, so server and client markup always match.
  const id = `calc-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="calc-stepper">
      <div className="min-w-0">
        <p id={`${id}-label`} className="calc-option-label">
          {label}
        </p>
        <p className="calc-option-body">{hint}</p>
      </div>
      <div className="calc-stepper-controls" role="group" aria-labelledby={`${id}-label`}>
        <button
          type="button"
          className="calc-step-button"
          onClick={() => onChange(clamp(value - 1, limits))}
          disabled={value <= limits.min}
          aria-label={`${copy.decrease}: ${label}`}
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <output className="calc-step-value" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="calc-step-button"
          onClick={() => onChange(clamp(value + 1, limits))}
          disabled={value >= limits.max}
          aria-label={`${copy.increase}: ${label}`}
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function PricingCalculator({
  preset,
}: {
  preset?: Omit<PlanInput, "payment">;
}) {
  const { language } = useLanguage();
  const copy = calculatorCopy[language];
  const [plan, setPlan] = useState<Omit<PlanInput, "payment">>(preset ?? DEFAULT_PLAN);
  const [payment, setPayment] = useState<PaymentModel>("monthly");
  const result = useMemo(() => quote({ ...plan, payment }), [plan, payment]);
  const hasAds = plan.channels.some((id) => AD_CHANNELS.includes(id));
  const nothing = result.setupFull === 0 && !result.hasPlan;

  const message = useMemo(() => {
    const list = (items: string[]) => (items.length ? items.join(", ") : copy.none);
    const lines = [
      copy.messageIntro,
      "",
      `${copy.messageSetup}: ${list(plan.setup.map((id) => copy.setup[id].label))}`,
      `${copy.messageMonthly}: ${list(plan.channels.map((id) => copy.channels[id].label))}${
        hasAds ? ` (${copy.campaigns}: ${plan.campaigns})` : ""
      }`,
      `${copy.messageContent}: ${copy.videos}: ${plan.videosPerWeek}, ${copy.graphics}: ${plan.graphicsPerMonth}`,
      `${copy.messagePayment}: ${copy.payment[payment].label}`,
      `${copy.messageEstimate}: ${formatUsd(result.setupDue)} ${copy.setupLine.toLowerCase()}, ${formatUsd(result.monthlyDue)}${copy.perMonth}${
        result.revenueShare ? ` + ${copy.commissionValue}` : ""
      }`,
    ];
    return lines.join("\n");
  }, [copy, plan, payment, result, hasAds]);

  return (
    <div className="calc">
      <div className="calc-config">
        <fieldset className="calc-group">
          <legend className="calc-group-title">{copy.paymentTitle}</legend>
          <div className="calc-payment">
            {(["monthly", "commission"] as PaymentModel[]).map((model) => (
              <label key={model} className="calc-option calc-option--radio">
                <input
                  type="radio"
                  name="calc-payment"
                  value={model}
                  checked={payment === model}
                  onChange={() => setPayment(model)}
                  className="calc-input"
                />
                <span className="min-w-0">
                  <span className="calc-option-label">{copy.payment[model].label}</span>
                  <span className="calc-option-body">{copy.payment[model].body}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="calc-group">
          <legend className="calc-group-title">
            <span className="service-index">01</span> {copy.setupTitle}
          </legend>
          <p className="calc-group-note">{copy.setupNote}</p>
          <div className="calc-options">
            {SETUP_IDS.map((id: SetupId) => {
              const full = PRICING.setup[id];
              const discounted = Math.round(full * (1 - PRICING.planSetupDiscount));
              return (
                <label key={id} className="calc-option">
                  <input
                    type="checkbox"
                    checked={plan.setup.includes(id)}
                    onChange={() => setPlan((p) => ({ ...p, setup: toggle(p.setup, id) }))}
                    className="calc-input"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="calc-option-label">{copy.setup[id].label}</span>
                    <span className="calc-option-body">{copy.setup[id].body}</span>
                  </span>
                  <span className="calc-price">
                    {result.hasPlan ? (
                      <>
                        <s className="calc-price-was">{formatUsd(full)}</s>
                        {formatUsd(discounted)}
                      </>
                    ) : (
                      formatUsd(full)
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="calc-group">
          <legend className="calc-group-title">
            <span className="service-index">02</span> {copy.monthlyTitle}
          </legend>
          <p className="calc-group-note">{copy.monthlyNote}</p>
          <div className="calc-options">
            {CHANNEL_IDS.map((id: ChannelId) => (
              <label key={id} className="calc-option">
                <input
                  type="checkbox"
                  checked={plan.channels.includes(id)}
                  onChange={() => setPlan((p) => ({ ...p, channels: toggle(p.channels, id) }))}
                  className="calc-input"
                />
                <span className="min-w-0 flex-1">
                  <span className="calc-option-label">{copy.channels[id].label}</span>
                  <span className="calc-option-body">{copy.channels[id].body}</span>
                </span>
                <span className="calc-price">
                  <span>
                    {formatUsd(PRICING.monthly[id])}
                    <span className="calc-price-unit">{copy.perMonth}</span>
                  </span>
                </span>
              </label>
            ))}
            {hasAds && (
              <Stepper
                label={copy.campaigns}
                hint={copy.campaignsHint}
                value={plan.campaigns}
                onChange={(campaigns) => setPlan((p) => ({ ...p, campaigns }))}
                limits={PRICING.limits.campaigns}
                copy={copy}
              />
            )}
          </div>
        </fieldset>

        <fieldset className="calc-group">
          <legend className="calc-group-title">
            <span className="service-index">03</span> {copy.contentTitle}
          </legend>
          <div className="calc-options">
            <Stepper
              label={copy.videos}
              hint={copy.videosHint}
              value={plan.videosPerWeek}
              onChange={(videosPerWeek) => setPlan((p) => ({ ...p, videosPerWeek }))}
              limits={PRICING.limits.videosPerWeek}
              copy={copy}
            />
            <Stepper
              label={copy.graphics}
              hint={copy.graphicsHint}
              value={plan.graphicsPerMonth}
              onChange={(graphicsPerMonth) => setPlan((p) => ({ ...p, graphicsPerMonth }))}
              limits={PRICING.limits.graphicsPerMonth}
              copy={copy}
            />
          </div>
        </fieldset>
      </div>

      <aside className="calc-summary" aria-live="polite">
        <p className="eyebrow">{copy.summaryTitle}</p>
        {nothing ? (
          <p className="calc-summary-note">{copy.nothing}</p>
        ) : (
          <dl className="calc-lines">
            <div className="calc-line">
              <dt>{copy.setupLine}</dt>
              <dd>
                {result.setupDiscounted && (
                  <s className="calc-price-was">{formatUsd(result.setupFull)}</s>
                )}
                {formatUsd(result.setupDue)}
              </dd>
            </div>
            <div className="calc-line calc-line--total">
              <dt>{copy.monthlyLine}</dt>
              <dd>
                {result.revenueShare !== null && result.monthlyFull !== result.monthlyDue && (
                  <s className="calc-price-was">{formatUsd(result.monthlyFull)}</s>
                )}
                {formatUsd(result.monthlyDue)}
                <span className="calc-price-unit">{copy.perMonth}</span>
              </dd>
            </div>
            {result.revenueShare !== null && (
              <div className="calc-line">
                <dt>{copy.commissionLine}</dt>
                <dd>{copy.commissionValue}</dd>
              </div>
            )}
          </dl>
        )}
        {result.setupDiscounted && (
          <p className="calc-summary-highlight">
            {copy.savings.replace("{amount}", formatUsd(result.setupFull - result.setupDue))}
          </p>
        )}
        {payment === "commission" && !result.hasPlan && !nothing && (
          <p className="calc-summary-note">{copy.noPlanCommission}</p>
        )}
        <GlowButton asChild className="w-full justify-center">
          <Link href={`/contact?message=${encodeURIComponent(message)}`}>
            {copy.cta}
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </GlowButton>
        <p className="calc-summary-note">
          {copy.adSpend} {copy.estimate}
        </p>
      </aside>
    </div>
  );
}
