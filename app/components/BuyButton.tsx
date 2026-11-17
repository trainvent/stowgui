import { Button } from "@trainvent/arcubic";
import type { Dictionary } from "@/dictionaries";
import { PAYMENT_LINK } from "@/lib/config";

export default function BuyButton({ dict }: { dict: Dictionary }) {
  if (!PAYMENT_LINK) return <Button size="3" disabled>{dict.buy}</Button>;
  return (
    <Button size="3" asChild>
      <a href={PAYMENT_LINK}>{dict.buy}</a>
    </Button>
  );
}
