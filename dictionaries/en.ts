import { MAX_COMPUTERS, PRICE } from "@/lib/config";

export type LegalSection = { heading: string; paragraphs: string[] };

const en = {
  meta: {
    title: "StowGUI — a desktop app for GNU Stow",
    description:
      "Manage your dotfiles with GNU Stow in a clear desktop app for Linux and macOS. Preview every link before anything changes.",
  },
  nav: {
    features: "Features",
    pricing: "Pricing",
    faq: "FAQ",
    download: "Download",
    otherLanguage: "Deutsch",
    lightMode: "Switch to light mode",
    darkMode: "Switch to dark mode",
  },
  footer: {
    imprint: "Imprint",
    privacy: "Privacy",
    terms: "Terms",
    lostKey: "Lost your key?",
  },
  buy: `Buy for ${PRICE}`,
  downloadFree: "Download free",
  hero: {
    titleStart: "Your dotfiles,",
    titleAccent: "visible.",
    lead: "A friendly desktop app for GNU Stow. See every package, preview every link, and never overwrite a file by accident.",
  },
  mock: {
    import: "+ Import",
    packages: "Packages",
    git: "Git",
    settings: "Settings",
    linked: "✓ Linked",
    notLinked: "Not linked",
    link: "Link…",
    unlink: "Unlink…",
  },
  features: {
    title: "Why StowGUI",
    items: [
      { title: "Preview first", text: "See every move, link and conflict before anything changes on disk." },
      { title: "Still just Stow", text: "Your dotfiles stay a normal Stow folder. Keep using the terminal whenever you like." },
      { title: "Import in one step", text: "Move an existing config like ~/.config/nvim into your dotfiles and link it back." },
      { title: "Nothing overwritten", text: "Existing files are never replaced silently. You get a backup before anything moves." },
      { title: "Linux and macOS", text: "One app and one license for both systems." },
      { title: "Two looks", text: "Pick a clean standard style or the angular Arcubic style, in light or dark." },
    ],
  },
  steps: {
    title: "How it works",
    items: [
      { title: "Choose your dotfiles folder", text: "StowGUI lists your packages and shows which ones are linked." },
      { title: "Preview", text: "Check every link and conflict before you apply." },
      { title: "Apply", text: "GNU Stow does the linking. You can undo it any time." },
    ],
  },
  pricing: {
    title: "Pricing",
    price: PRICE,
    once: "once",
    points: [
      `Use it on up to ${MAX_COMPUTERS} computers`,
      "All 1.x updates included",
      "Works offline",
      "Key arrives by email right after payment",
    ],
    free: "The free download shows your packages and previews. Buying unlocks Apply, Import and Undo.",
    vat: "No VAT is charged under § 19 UStG (small business).",
  },
  faq: {
    title: "FAQ",
    items: [
      {
        q: "Do I need GNU Stow?",
        a: "Yes. StowGUI uses the Stow already installed on your computer. Install it with your package manager or Homebrew.",
      },
      {
        q: "Can I still use the terminal?",
        a: "Yes. StowGUI doesn't add its own format. Your dotfiles folder works with plain stow commands as before.",
      },
      {
        q: "What happens on a new computer?",
        a: `Enter your key there too. If you already use ${MAX_COMPUTERS} computers, the one you used least recently is signed out.`,
      },
      {
        q: "I lost my key.",
        a: "Request it again with the email address you used to pay. We'll send it right away.",
        link: "/license",
      },
      {
        q: "Can I get a refund?",
        a: "Write to us within 14 days and we'll refund you. Your key stops working afterwards.",
      },
    ],
  },
  download: {
    title: "Download StowGUI",
    lead: "Free to download. Buy a key to apply changes.",
    linux: "Linux",
    macos: "macOS",
    getRelease: "Get the latest version",
    stowTitle: "Install GNU Stow first",
    stowLead: "StowGUI needs GNU Stow on your computer.",
  },
  success: {
    title: "Thank you!",
    lead: "Your license key is on its way to your email inbox. It usually arrives within a minute.",
    next: "Download StowGUI, open Settings → License and paste your key.",
    noMail: "No email after a few minutes? Check your spam folder or request it again.",
    resend: "Send key again",
  },
  license: {
    title: "Lost your key?",
    lead: "Enter the email address you used to pay. We'll send your key there.",
    email: "Email address",
    submit: "Send my key",
    sent: "If we have a purchase for this address, the key is on its way.",
    error: "That didn't work. Please try again in a moment or write to us.",
    unavailable: "Key requests are not available yet. Please write to us.",
  },
  notFound: {
    title: "Page not found",
    back: "Back to the start page",
  },
  imprint: {
    title: "Imprint",
    provider: "This website is provided by:",
    owner: "owner",
    country: "Germany",
    phone: "Phone",
    email: "Email",
    companyNumber: "Company number (UNR.S)",
    tradeRegister: "Trade register",
    responsible: "Responsible for content under § 18 (2) MStV",
    vat: "Small business under § 19 UStG, no VAT is charged.",
    dispute:
      "We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.",
  },
  privacy: {
    title: "Privacy policy",
    sections: [
      {
        heading: "Who is responsible",
        paragraphs: [
          "Trainvent, owner Leon Marquardt, Ravensbergerstraße 75, 33602 Bielefeld, Germany, support@trainvent.com.",
        ],
      },
      {
        heading: "Visiting this website",
        paragraphs: [
          "This website is hosted on GitHub Pages (GitHub Inc., USA). When you open a page, GitHub processes your IP address and technical request data to deliver the page and protect the service (Art. 6 (1) (f) GDPR). GitHub is certified under the EU-US Data Privacy Framework.",
          "We don't use cookies, analytics or tracking. Your light or dark mode choice is stored only in your browser.",
        ],
      },
      {
        heading: "Buying StowGUI",
        paragraphs: [
          "Payments are handled by Stripe Payments Europe Ltd., Ireland. Stripe processes your name, email address, billing address and payment details to process the payment and prevent fraud (Art. 6 (1) (b) and (c) GDPR).",
          "To deliver and manage your license we store your email address, the purchase reference and your license key. This runs on Cloudflare, Inc. (USA, EU-US Data Privacy Framework). We send the key email through Resend (Plus Five Five, Inc., USA, EU-US Data Privacy Framework).",
          "We keep purchase records for as long as tax law requires (up to 10 years).",
        ],
      },
      {
        heading: "Using the app",
        paragraphs: [
          "The app checks your license from time to time and sends an anonymous device ID with it so your key can be used on several computers. It also checks for updates. Your dotfiles never leave your computer.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You can ask for access, correction, deletion, restriction or a copy of your data, and object to processing. Write to support@trainvent.com. You can also complain to a data protection authority, for example the LDI NRW.",
        ],
      },
    ] satisfies LegalSection[],
  },
  terms: {
    title: "Terms of sale and license",
    sections: [
      {
        heading: "1. Seller",
        paragraphs: [
          "StowGUI is sold by Trainvent, owner Leon Marquardt, Ravensbergerstraße 75, 33602 Bielefeld, Germany (\"we\").",
        ],
      },
      {
        heading: "2. Purchase",
        paragraphs: [
          `StowGUI costs ${PRICE} once. The contract is concluded when you complete the payment. We send your license key to the email address you entered right after payment.`,
        ],
      },
      {
        heading: "3. License",
        paragraphs: [
          `You may use StowGUI on up to ${MAX_COMPUTERS} computers at the same time. The license covers all 1.x versions. You may not resell, share or publish your key, or reverse engineer the app beyond what the law allows.`,
        ],
      },
      {
        heading: "4. Right of withdrawal",
        paragraphs: [
          "Consumers have a right of withdrawal. You may withdraw from this contract within 14 days without giving any reason. The period is 14 days from the day the contract was concluded.",
          "To withdraw, inform us (Trainvent, Ravensbergerstraße 75, 33602 Bielefeld, Germany, support@trainvent.com, +49 160 3455942) by a clear statement, for example an email. You may use the model withdrawal form below, but you don't have to. Sending your withdrawal before the period ends is enough.",
          "If you withdraw, we refund all payments received from you without undue delay and at the latest within 14 days, using the same means of payment you used. Your license key is deactivated.",
          "Early expiry: the right of withdrawal expires once we have started delivering the digital content (sending the license key) after you expressly agreed at checkout that we start before the withdrawal period ends and confirmed that you know you lose your right of withdrawal by doing so.",
          "Regardless of this, we refund any purchase on request within 14 days.",
        ],
      },
      {
        heading: "Model withdrawal form",
        paragraphs: [
          "To Trainvent, Ravensbergerstraße 75, 33602 Bielefeld, Germany, support@trainvent.com: I hereby withdraw from my contract for the purchase of the following digital content: StowGUI license. Ordered on: … Name: … Address: … Date: …",
        ],
      },
      {
        heading: "5. Warranty and liability",
        paragraphs: [
          "Statutory warranty rights apply. We are liable without limitation for intent, gross negligence and injury to life, body or health. For slight negligence we are liable only for breach of essential contractual obligations and limited to foreseeable, typical damage. Please keep backups of your configuration files.",
        ],
      },
      {
        heading: "6. Final provisions",
        paragraphs: [
          "German law applies, excluding the UN Convention on Contracts for the International Sale of Goods. For consumers in the EU, the mandatory consumer protection rules of their country of residence remain unaffected.",
        ],
      },
    ] satisfies LegalSection[],
  },
};

export type Dictionary = typeof en;
export default en;
