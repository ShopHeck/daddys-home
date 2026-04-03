import { getServerSession } from "next-auth";

import { TeamsClient } from "@/components/dashboard/TeamsClient";
import { authOptions } from "@/lib/auth";

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? "";

  return <TeamsClient currentUserId={currentUserId} />;
}
