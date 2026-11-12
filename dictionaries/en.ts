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
    install: "Install",
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
  comingSoon: "Coming soon",
  notify: "Get notified on GitHub",
  notifyHint: "Watch the repository on GitHub and choose “Releases” to get an email when StowGUI is out.",
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
      { title: "Apply", text: "GNU Stow does the linking. You can unlink files again and keep a copy in place." },
    ],
  },
  pricing: {
    title: "Pricing",
    price: PRICE,
    once: "once",
    points: [
      `Use it on up to ${MAX_COMPUTERS} computers`,
      "All 1.x updates included",
      "Online activation; up to 30 days offline",
      "Key arrives by email right after payment",
    ],
    free: "Explore packages and previews for free. A license unlocks linking, imports and other file changes. Unlinking stays available without a license.",
    vat: "No VAT is charged under § 19 UStG (small business).",
  },
  faq: {
    title: "FAQ",
    items: [
      {
        q: "Do I need GNU Stow?",
        a: "Yes. StowGUI uses the Stow already installed on your computer. Install GNU Stow 2.4 or newer with your package manager or Homebrew.",
      },
      {
        q: "Can I still use the terminal?",
        a: "Yes. StowGUI doesn't add its own format. Your dotfiles folder works with plain stow commands as before.",
      },
      {
        q: "What happens on a new computer?",
        a: `Activate your key there. If you already have ${MAX_COMPUTERS} active computers, the least recently checked one is released. It locks paid changes at its next online check or when its offline allowance expires. To choose which computer to free instead, deactivate it in Settings → License on any of your computers.`,
      },
      {
        q: "I lost my key.",
        a: "Request it again with the email address you used to pay. We'll send it right away.",
        link: "/license",
      },
      {
        q: "Can I sell or give away my license?",
        a: "Yes, as a whole. Stop using it and delete your saved keys and activation tokens before transferring it. Contact support@trainvent.com to arrange the handover so key recovery follows the new owner.",
      },
      {
        q: "Can I get a refund?",
        a: "Consumers normally have 14 days to withdraw. For immediate digital delivery, this right ends early only when the legal requirements are met, including your express consent and a contract confirmation. Your statutory rights if the app is defective remain unaffected. See the terms for details.",
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
    stowLead: "StowGUI needs GNU Stow 2.4 or newer on your computer.",
    installGuide: "Installation guide",
  },
  install: {
    title: "Install StowGUI",
    lead: "Set up StowGUI so it opens from your app menu like any other app.",
    ubuntu: "Ubuntu",
    steps: {
      download: {
        title: "Download the app",
        text: "Get the file ending in .AppImage. It contains the whole app, so there is nothing else to install.",
      },
      store: {
        title: "Give it a permanent home",
        text: "Move it to an Applications folder in your home folder and give it a short name. Updates replace this file, so your menu entry keeps working.",
      },
      executable: {
        title: "Allow it to run",
        text: "Mark the file as a program.",
      },
      menu: {
        title: "Add it to the app menu",
        text: "Save the icon and create a menu entry. StowGUI then appears when you search your apps and can be pinned to the dock.",
      },
    },
  },
  success: {
    title: "Thank you!",
    lead: "Your license key is on its way to your email inbox. It usually arrives within a minute.",
    next: "Download StowGUI, open Settings → License and activate your key online.",
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
          "To deliver and manage your license we store your email address, the purchase reference and your license key. This runs on Cloudflare, Inc. (USA, EU-US Data Privacy Framework). We send the key email through Brevo (Sendinblue SAS, France).",
          "We retain purchase and accounting records for the applicable statutory periods (Art. 6 (1) (c) GDPR). We retain license and current activation records while needed to provide your license and handle support or legal claims; they are deleted when no longer needed unless a legal retention obligation applies.",
        ],
      },
      {
        heading: "Using the app",
        paragraphs: [
          "When you activate or check your license, the app sends your license key, a randomly generated installation ID, your computer name and, for renewal, the activation ID to our Cloudflare service. We store the link to your license, the computer name (which you can rename in the app), activation time and last successful check to manage the three-computer limit and renew your offline allowance (Art. 6 (1) (b) GDPR). These IDs are pseudonymous, not anonymous, because the license is linked to your purchase. We do not use a hardware fingerprint.",
          "Cloudflare also processes your IP address and technical request data to deliver and protect the activation service. Background license checks occur at most once a day; manual activation and checks also contact the service. Each successful check grants up to 30 days offline.",
          "If update checks are enabled, the app requests release information and downloads from GitHub. GitHub receives your IP address and technical request data. You can turn automatic update checks off in Settings. StowGUI does not upload your managed configuration files as part of license or update checks.",
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
          "StowGUI is sold by Trainvent, owner Leon Marquardt, Ravensbergerstraße 75, 33602 Bielefeld, Germany. Contact: support@trainvent.com.",
        ],
      },
      {
        heading: "2. Purchase and delivery",
        paragraphs: [
          `StowGUI costs ${PRICE} once, with no subscription. The contract is concluded when you complete the payment. We send your license key to the email address you entered after successful payment.`,
          "StowGUI is a desktop application for Linux and macOS and requires GNU Stow 2.4 or newer, installed separately. Check the download page for available builds and system requirements before buying. The free download lets you explore packages and previews.",
        ],
      },
      {
        heading: "3. Right to use StowGUI",
        paragraphs: [
          `You receive a non-exclusive right to use StowGUI for personal or commercial purposes, without a time limit, on up to ${MAX_COMPUTERS} active computers for one license holder. For an organization, this means one designated user. The license includes all 1.x versions; later major versions are not included unless stated otherwise.`,
          "You may not publish your key or share it for use by multiple license holders. The complete license may be transferred as described below. Rights granted by mandatory law, including permitted backup copies, inspection and interoperability, remain unaffected. Third-party components remain subject to their own licenses.",
        ],
      },
      {
        heading: "4. Activation and offline use",
        paragraphs: [
          "An internet connection is required for initial activation. The app then checks the license in the background at most once a day; you can also check manually. Each successful check allows up to 30 days of offline use. If that period expires, online verification is needed before you can apply further paid changes.",
          `Activating a further computer when all ${MAX_COMPUTERS} places are in use releases the installation with the oldest successful check. That installation locks paid changes at its next successful online check or when its current offline allowance expires. Reclaiming a place requires an explicit activation.`,
          "A valid withdrawal or full purchase-price refund ends the corresponding right to use the paid features. Activation checks enforce this when the installation next checks online. Viewing packages and previews, unlinking files and keeping copies in place remain available without an active license. Your files remain yours.",
          "If we permanently discontinue the activation service, we will provide existing license holders with a free update or another means of continuing to use their licensed version without periodic online verification. This does not promise new features or compatibility with every future operating system.",
        ],
      },
      {
        heading: "5. Transferring or reselling your license",
        paragraphs: [
          "You may sell or give the entire license to another person or organization. The transfer includes all rights and included updates; the license and its computer allowance cannot be split between owners.",
          "Before completing the transfer, the previous holder must stop using the paid features, remove their licensed copies, and delete all saved license keys and activation tokens from their installations and backups under their control. They may keep legally required purchase records, but may not use a retained key or token. Offline tokens must not be used after the transfer.",
          "Contact support@trainvent.com to arrange the transfer and update the license and recovery email to the new holder. We do not charge a transfer fee. Forwarding a key alone does not update the purchase email or release existing activations. The new holder receives the same version entitlement; the transfer does not restart the original purchase withdrawal period. Mandatory transfer rights remain unaffected.",
        ],
      },
      {
        heading: "6. Right of withdrawal",
        paragraphs: [
          "Consumers may withdraw from this contract within 14 days without giving a reason. The withdrawal period is 14 days from the day the contract is concluded.",
          "To withdraw, inform Trainvent, Ravensbergerstraße 75, 33602 Bielefeld, Germany, support@trainvent.com, +49 160 3455942, by a clear statement, for example an email. You may use the model form below, but do not have to. Sending the notice before the period ends is enough.",
          "If you withdraw, we refund all payments received under the contract without undue delay and at the latest within 14 days after receiving your notice, using the same payment method unless expressly agreed otherwise. You incur no refund fee. The corresponding license is deactivated.",
          "For paid digital content delivered without a physical medium, the withdrawal right ends early only if delivery has begun after you expressly consented to delivery before the withdrawal period ends, acknowledged that this causes you to lose your withdrawal right when delivery begins, and we have provided the legally required contract confirmation. This confirmation records that consent and acknowledgment. If these requirements are not met, immediate key delivery alone does not end the right.",
        ],
      },
      {
        heading: "Model withdrawal form",
        paragraphs: [
          "To Trainvent, Ravensbergerstraße 75, 33602 Bielefeld, Germany, support@trainvent.com: I/We (*) hereby withdraw from my/our (*) contract for the purchase of the following digital content: StowGUI license. Ordered on/received on (*): … Name of consumer(s): … Address of consumer(s): … Signature of consumer(s), only if sent on paper: … Date: … (*) Delete as appropriate.",
        ],
      },
      {
        heading: "7. Updates, defects and liability",
        paragraphs: [
          "Statutory rights concerning defects and required updates remain unaffected. The inclusion of 1.x versions does not restrict any mandatory obligation to provide updates needed to maintain conformity, including security updates. Contact support@trainvent.com if StowGUI does not work as agreed.",
          "We are liable without limitation for intent, gross negligence and injury to life, body or health, and where mandatory law requires. For slight negligence, liability is otherwise limited to breaches of essential contractual obligations and the foreseeable damage typical of the contract. Statutory product liability and any expressly assumed guarantees remain unaffected. Keep independent backups before changing files; this advice does not limit your statutory rights.",
        ],
      },
      {
        heading: "8. Applicable law",
        paragraphs: [
          "German law applies, excluding the UN Convention on Contracts for the International Sale of Goods. Consumers retain the mandatory protection of the law of their country of habitual residence where applicable. These terms do not restrict mandatory consumer rights.",
        ],
      },
    ] satisfies LegalSection[],
  },
};

export type Dictionary = typeof en;
export default en;
