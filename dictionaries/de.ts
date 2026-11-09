import { MAX_COMPUTERS, PRICE } from "@/lib/config";
import type { Dictionary } from "./en";

const de: Dictionary = {
  meta: {
    title: "StowGUI – eine Desktop-App für GNU Stow",
    description:
      "Verwalte deine Dotfiles mit GNU Stow in einer übersichtlichen Desktop-App für Linux und macOS. Sieh jede Verknüpfung, bevor sich etwas ändert.",
  },
  nav: {
    features: "Funktionen",
    pricing: "Preis",
    faq: "FAQ",
    download: "Download",
    otherLanguage: "English",
    lightMode: "Zum hellen Modus wechseln",
    darkMode: "Zum dunklen Modus wechseln",
  },
  footer: {
    imprint: "Impressum",
    privacy: "Datenschutz",
    terms: "AGB",
    lostKey: "Schlüssel verloren?",
  },
  buy: `Für ${PRICE} kaufen`,
  downloadFree: "Kostenlos laden",
  hero: {
    titleStart: "Deine Dotfiles,",
    titleAccent: "sichtbar.",
    lead: "Eine freundliche Desktop-App für GNU Stow. Sieh jedes Paket, prüfe jede Verknüpfung vorab und überschreibe nie versehentlich eine Datei.",
  },
  mock: {
    import: "+ Importieren",
    packages: "Pakete",
    git: "Git",
    settings: "Einstellungen",
    linked: "✓ Verknüpft",
    notLinked: "Nicht verknüpft",
    link: "Verknüpfen…",
    unlink: "Lösen…",
  },
  features: {
    title: "Warum StowGUI",
    items: [
      { title: "Erst ansehen", text: "Sieh jede Verschiebung, Verknüpfung und jeden Konflikt, bevor sich etwas ändert." },
      { title: "Weiterhin Stow", text: "Deine Dotfiles bleiben ein normaler Stow-Ordner. Das Terminal funktioniert wie gewohnt." },
      { title: "Import in einem Schritt", text: "Hol eine bestehende Konfiguration wie ~/.config/nvim in deine Dotfiles und verknüpfe sie zurück." },
      { title: "Nichts wird überschrieben", text: "Vorhandene Dateien werden nie still ersetzt. Vor jedem Verschieben gibt es ein Backup." },
      { title: "Linux und macOS", text: "Eine App und eine Lizenz für beide Systeme." },
      { title: "Zwei Stile", text: "Wähle einen schlichten Standardstil oder den kantigen Arcubic-Stil, hell oder dunkel." },
    ],
  },
  steps: {
    title: "So funktioniert’s",
    items: [
      { title: "Dotfiles-Ordner wählen", text: "StowGUI zeigt deine Pakete und welche davon verknüpft sind." },
      { title: "Vorschau", text: "Prüfe jede Verknüpfung und jeden Konflikt vor dem Anwenden." },
      { title: "Anwenden", text: "GNU Stow verknüpft. Du kannst es jederzeit rückgängig machen." },
    ],
  },
  pricing: {
    title: "Preis",
    price: PRICE,
    once: "einmalig",
    points: [
      `Auf bis zu ${MAX_COMPUTERS} Computern nutzbar`,
      "Alle 1.x-Updates inklusive",
      "Funktioniert offline",
      "Der Schlüssel kommt direkt nach der Zahlung per E-Mail",
    ],
    free: "Der kostenlose Download zeigt deine Pakete und Vorschauen. Mit dem Kauf schaltest du Anwenden, Importieren und Rückgängig frei.",
    vat: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
  },
  faq: {
    title: "FAQ",
    items: [
      {
        q: "Brauche ich GNU Stow?",
        a: "Ja. StowGUI nutzt das Stow auf deinem Computer. Installiere es über deinen Paketmanager oder Homebrew.",
      },
      {
        q: "Kann ich weiter das Terminal nutzen?",
        a: "Ja. StowGUI führt kein eigenes Format ein. Dein Dotfiles-Ordner funktioniert wie bisher mit stow-Befehlen.",
      },
      {
        q: "Was passiert auf einem neuen Computer?",
        a: `Gib dort einfach deinen Schlüssel ein. Nutzt du schon ${MAX_COMPUTERS} Computer, wird der am längsten nicht genutzte abgemeldet.`,
      },
      {
        q: "Ich habe meinen Schlüssel verloren.",
        a: "Fordere ihn mit der E-Mail-Adresse, mit der du bezahlt hast, erneut an. Wir schicken ihn sofort.",
        link: "/license",
      },
      {
        q: "Bekomme ich mein Geld zurück?",
        a: "Nein. Der Schlüssel wird direkt nach der Zahlung geliefert, und du stimmst beim Kauf zu, dass dein Widerrufsrecht damit erlischt. Probier vorher den kostenlosen Download aus, ob StowGUI zu dir passt. Funktioniert StowGUI nicht wie beschrieben, schreib uns und wir beheben den Fehler oder erstatten dir den Kaufpreis.",
      },
    ],
  },
  download: {
    title: "StowGUI herunterladen",
    lead: "Kostenlos herunterladen. Mit einem Schlüssel kannst du Änderungen anwenden.",
    linux: "Linux",
    macos: "macOS",
    getRelease: "Neueste Version laden",
    stowTitle: "Zuerst GNU Stow installieren",
    stowLead: "StowGUI braucht GNU Stow auf deinem Computer.",
  },
  success: {
    title: "Danke!",
    lead: "Dein Lizenzschlüssel ist auf dem Weg in dein E-Mail-Postfach. Er kommt meist innerhalb einer Minute an.",
    next: "Lade StowGUI herunter, öffne Einstellungen → Lizenz und füge deinen Schlüssel ein.",
    noMail: "Nach ein paar Minuten keine E-Mail? Schau in den Spam-Ordner oder fordere sie erneut an.",
    resend: "Schlüssel erneut senden",
  },
  license: {
    title: "Schlüssel verloren?",
    lead: "Gib die E-Mail-Adresse ein, mit der du bezahlt hast. Wir schicken deinen Schlüssel dorthin.",
    email: "E-Mail-Adresse",
    submit: "Schlüssel senden",
    sent: "Wenn es zu dieser Adresse einen Kauf gibt, ist der Schlüssel unterwegs.",
    error: "Das hat nicht geklappt. Bitte versuch es gleich noch einmal oder schreib uns.",
    unavailable: "Schlüsselanfragen sind noch nicht verfügbar. Bitte schreib uns.",
  },
  notFound: {
    title: "Seite nicht gefunden",
    back: "Zur Startseite",
  },
  imprint: {
    title: "Impressum",
    provider: "Anbieter dieser Website ist:",
    owner: "Inhaber",
    country: "Deutschland",
    phone: "Telefon",
    email: "E-Mail",
    companyNumber: "Unternehmensnummer (UNR.S)",
    tradeRegister: "Handelsregister",
    responsible: "Verantwortlich nach § 18 Abs. 2 MStV",
    vat: "Kleinunternehmer gemäß § 19 UStG, es wird keine Umsatzsteuer berechnet.",
    dispute:
      "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
  },
  privacy: {
    title: "Datenschutzerklärung",
    sections: [
      {
        heading: "Verantwortlicher",
        paragraphs: [
          "Trainvent, Inhaber Leon Marquardt, Ravensbergerstraße 75, 33602 Bielefeld, support@trainvent.com.",
        ],
      },
      {
        heading: "Besuch dieser Website",
        paragraphs: [
          "Diese Website wird über GitHub Pages (GitHub Inc., USA) bereitgestellt. Beim Aufruf einer Seite verarbeitet GitHub deine IP-Adresse und technische Anfragedaten, um die Seite auszuliefern und den Dienst zu schützen (Art. 6 Abs. 1 lit. f DSGVO). GitHub ist nach dem EU-US Data Privacy Framework zertifiziert.",
          "Wir verwenden keine Cookies, keine Analyse und kein Tracking. Deine Wahl zwischen hellem und dunklem Modus wird nur in deinem Browser gespeichert.",
        ],
      },
      {
        heading: "Kauf von StowGUI",
        paragraphs: [
          "Zahlungen wickelt Stripe Payments Europe Ltd., Irland, ab. Stripe verarbeitet Name, E-Mail-Adresse, Rechnungsadresse und Zahlungsdaten zur Zahlungsabwicklung und Betrugsvermeidung (Art. 6 Abs. 1 lit. b und c DSGVO).",
          "Um deine Lizenz auszuliefern und zu verwalten, speichern wir deine E-Mail-Adresse, die Kaufreferenz und deinen Lizenzschlüssel. Das läuft bei Cloudflare, Inc. (USA, EU-US Data Privacy Framework). Die E-Mail mit dem Schlüssel versenden wir über Brevo (Sendinblue SAS, Frankreich).",
          "Kaufbelege bewahren wir so lange auf, wie es das Steuerrecht verlangt (bis zu 10 Jahre).",
        ],
      },
      {
        heading: "Nutzung der App",
        paragraphs: [
          "Die App prüft gelegentlich deine Lizenz und sendet dabei eine anonyme Geräte-ID, damit dein Schlüssel auf mehreren Computern funktioniert. Außerdem sucht sie nach Updates. Deine Dotfiles verlassen nie deinen Computer.",
        ],
      },
      {
        heading: "Deine Rechte",
        paragraphs: [
          "Du kannst Auskunft, Berichtigung, Löschung, Einschränkung oder eine Kopie deiner Daten verlangen und der Verarbeitung widersprechen. Schreib dazu an support@trainvent.com. Du kannst dich außerdem bei einer Datenschutzaufsichtsbehörde beschweren, zum Beispiel bei der LDI NRW.",
        ],
      },
    ],
  },
  terms: {
    title: "AGB und Lizenzbedingungen",
    sections: [
      {
        heading: "1. Anbieter",
        paragraphs: [
          "StowGUI wird verkauft von Trainvent, Inhaber Leon Marquardt, Ravensbergerstraße 75, 33602 Bielefeld (\"wir\").",
        ],
      },
      {
        heading: "2. Kauf",
        paragraphs: [
          `StowGUI kostet einmalig ${PRICE}. Der Vertrag kommt mit Abschluss der Zahlung zustande. Wir senden deinen Lizenzschlüssel direkt danach an die angegebene E-Mail-Adresse.`,
        ],
      },
      {
        heading: "3. Lizenz",
        paragraphs: [
          `Du darfst StowGUI gleichzeitig auf bis zu ${MAX_COMPUTERS} Computern nutzen. Die Lizenz gilt für alle 1.x-Versionen. Du darfst deinen Schlüssel nicht weiterverkaufen, weitergeben oder veröffentlichen und die App nicht über das gesetzlich Erlaubte hinaus zurückentwickeln.`,
        ],
      },
      {
        heading: "4. Widerrufsbelehrung",
        paragraphs: [
          "Verbraucher haben ein Widerrufsrecht. Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.",
          "Um dein Widerrufsrecht auszuüben, musst du uns (Trainvent, Ravensbergerstraße 75, 33602 Bielefeld, support@trainvent.com, +49 160 3455942) mittels einer eindeutigen Erklärung, zum Beispiel per E-Mail, über deinen Entschluss informieren. Du kannst dafür das untenstehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Zur Wahrung der Frist reicht es aus, dass du die Mitteilung vor Ablauf der Frist absendest.",
          "Wenn du widerrufst, erstatten wir dir alle Zahlungen unverzüglich und spätestens binnen vierzehn Tagen über dasselbe Zahlungsmittel. Dein Lizenzschlüssel wird deaktiviert.",
          "Vorzeitiges Erlöschen: Das Widerrufsrecht erlischt, sobald wir mit der Lieferung der digitalen Inhalte (Versand des Lizenzschlüssels) begonnen haben, nachdem du beim Kauf ausdrücklich zugestimmt hast, dass wir vor Ablauf der Widerrufsfrist beginnen, und bestätigt hast, dass du dadurch dein Widerrufsrecht verlierst.",
        ],
      },
      {
        heading: "Muster-Widerrufsformular",
        paragraphs: [
          "An Trainvent, Ravensbergerstraße 75, 33602 Bielefeld, support@trainvent.com: Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über den Kauf der folgenden digitalen Inhalte: StowGUI-Lizenz. Bestellt am: … Name: … Anschrift: … Datum: …",
        ],
      },
      {
        heading: "5. Gewährleistung und Haftung",
        paragraphs: [
          "Es gelten die gesetzlichen Gewährleistungsrechte. Wir haften unbeschränkt bei Vorsatz, grober Fahrlässigkeit und bei Verletzung von Leben, Körper oder Gesundheit. Bei leichter Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den vorhersehbaren, typischen Schaden. Bitte sichere deine Konfigurationsdateien regelmäßig.",
        ],
      },
      {
        heading: "6. Schlussbestimmungen",
        paragraphs: [
          "Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Für Verbraucher in der EU bleiben die zwingenden Verbraucherschutzvorschriften ihres Wohnsitzlandes unberührt.",
        ],
      },
    ],
  },
};

export default de;
