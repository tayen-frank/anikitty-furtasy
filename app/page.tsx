import { PublicFlow } from "@/components/public/public-flow";
import { getAllStyles } from "@/lib/style-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <PublicFlow initialStyles={await getAllStyles()} />;
}
