/** Switch to true when the first version is out: shows Buy and Download instead of "Coming soon". */
export const RELEASED = false;

export const SITE_URL = "https://stowgui.com";
export const PRICE = "5 €";
export const MAX_COMPUTERS = 3;
export const SUPPORT_EMAIL = "support@trainvent.com";
export const REPO_URL = "https://github.com/trainvent/stowgui";
export const RELEASES_URL = `${REPO_URL}/releases/latest`;
export const GNU_STOW_URL = "https://www.gnu.org/software/stow/";

export const PAYMENT_LINK = process.env.NEXT_PUBLIC_PAYMENT_LINK ?? "";
export const LICENSE_API_URL = process.env.NEXT_PUBLIC_LICENSE_API_URL ?? "";

export const COMPANY = {
  name: "Trainvent",
  owner: "Leon Marquardt",
  street: "Ravensbergerstraße 75",
  city: "33602 Bielefeld",
  phone: "+49 160 3455942",
  email: SUPPORT_EMAIL,
  companyNumber: "143513874102001",
  tradeRegister: "HRA 17633 Amtsgericht Bielefeld",
  responsible: "Leon Marquardt",
};
