import { Button } from "@trainvent/arcubic";
import { PAYMENT_LINK } from "@/lib/config";

export default function BuyButton({ label }: { label: string }) {
  if (!PAYMENT_LINK) {
    return <Button size="3" disabled>{label}</Button>;
  }
  return (
    <Button size="3" asChild>
      <a href={PAYMENT_LINK}>{label}</a>
    </Button>
  );
}
