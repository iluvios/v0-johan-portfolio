import HomePortfolio from "@/components/home-portfolio";
import AgencyHome from "@/components/agency-home";
import { getServerSite } from "@/lib/tenant-server";

export default async function HomePage() {
  const site = await getServerSite();
  return site === "energymedia" ? <AgencyHome /> : <HomePortfolio />;
}
