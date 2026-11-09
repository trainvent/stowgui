import { Button } from "@trainvent/arcubic";
import type { Dictionary } from "@/dictionaries";
import { PAYMENT_LINK, RELEASED, REPO_URL } from "@/lib/config";

export default function ReleaseAction({ dict }: { dict: Dictionary }) {
  if (!RELEASED) {
    return (
      <Button size="3" asChild>
        <a href={REPO_URL}>{dict.notify}</a>
      </Button>
    );
  }
  if (!PAYMENT_LINK) {
    return <Button size="3" disabled>{dict.buy}</Button>;
  }
  return (
    <Button size="3" asChild>
      <a href={PAYMENT_LINK}>{dict.buy}</a>
    </Button>
  );
}
