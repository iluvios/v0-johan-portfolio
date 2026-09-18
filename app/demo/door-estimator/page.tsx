import type { Metadata } from "next";
import DoorEstimatorDemo from "@/components/door-estimator-demo";

export const metadata: Metadata = {
  title: "Live Prototype: AI Door & Millwork Estimator",
  description:
    "Interactive consultative quoting and specification triage agent for custom architectural millwork, doors, and windows.",
};

export default function DoorEstimatorPage() {
  return <DoorEstimatorDemo />;
}
