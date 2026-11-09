import LanguageRedirect from "../../../components/LanguageRedirect";

export const metadata = { robots: { index: false } };

export default function SuccessRedirect() {
  return <LanguageRedirect path="/buy/success" />;
}
