import Logout from "@/components/shared/logout";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/auth-utils";

export default async function Home() {
  await requireAuth();
  return (
    <div>
      <Logout>
        <Button>Logout</Button>
      </Logout>
    </div>
  );
}
