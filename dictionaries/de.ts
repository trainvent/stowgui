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
  comingSoon: "Bald verfügbar",
  notify: "Auf GitHub benachrichtigen lassen",
  notifyHint: "Beobachte das Repository auf GitHub und wähle „Releases“, um eine E-Mail zu bekommen, sobald StowGUI erscheint.",
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
      { title: "Anwenden", text: "GNU Stow verknüpft. Du kannst die Verknüpfungen später wieder lösen und Kopien am bisherigen Ort behalten." },
    ],
  },
  pricing: {
    title: "Preis",
    price: PRICE,
    once: "einmalig",
    points: [
      `Auf bis zu ${MAX_COMPUTERS} Computern nutzbar`,
      "Alle 1.x-Updates inklusive",
      "Online aktivieren; bis zu 30 Tage offline nutzen",
      "Der Schlüssel kommt direkt nach der Zahlung per E-Mail",
    ],
    free: "Pakete und Vorschauen kannst du kostenlos ansehen. Eine Lizenz schaltet Verknüpfen, Importieren und weitere Dateiänderungen frei. Verknüpfungen lösen kannst du auch ohne Lizenz.",
    vat: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
  },
  faq: {
    title: "FAQ",
    items: [
      {
        q: "Brauche ich GNU Stow?",
        a: "Ja. StowGUI nutzt das Stow auf deinem Computer. Installiere GNU Stow 2.4 oder neuer über deinen Paketmanager oder Homebrew.",
      },
      {
        q: "Kann ich weiter das Terminal nutzen?",
        a: "Ja. StowGUI führt kein eigenes Format ein. Dein Dotfiles-Ordner funktioniert wie bisher mit stow-Befehlen.",
      },
      {
        q: "Was passiert auf einem neuen Computer?",
        a: `Aktiviere dort deinen Schlüssel. Sind schon ${MAX_COMPUTERS} Computer aktiv, wird der Computer mit der am längsten zurückliegenden Prüfung freigegeben. Dort werden kostenpflichtige Änderungen bei der nächsten Online-Prüfung oder nach Ablauf der Offline-Frist gesperrt. Um selbst zu wählen, welcher Computer frei wird, deaktiviere ihn vorher unter Einstellungen → Lizenz auf einem deiner Computer.`,
      },
      {
        q: "Ich habe meinen Schlüssel verloren.",
        a: "Fordere ihn mit der E-Mail-Adresse, mit der du bezahlt hast, erneut an. Wir schicken ihn sofort.",
        link: "/license",
      },
      {
        q: "Darf ich meine Lizenz weiterverkaufen oder verschenken?",
        a: "Ja, vollständig. Stelle die Nutzung ein und lösche deine gespeicherten Schlüssel und Aktivierungstoken vor der Übertragung. Schreib an support@trainvent.com, damit wir die Übergabe und die Schlüsselwiederherstellung dem neuen Inhaber zuordnen können.",
      },
      {
        q: "Bekomme ich mein Geld zurück?",
        a: "Verbraucher haben grundsätzlich 14 Tage Zeit zum Widerruf. Bei sofortiger digitaler Lieferung erlischt dieses Recht nur, wenn die gesetzlichen Voraussetzungen erfüllt sind, darunter deine ausdrückliche Zustimmung und eine Vertragsbestätigung. Deine gesetzlichen Rechte bei Mängeln bleiben unberührt. Einzelheiten stehen in den AGB.",
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
    stowLead: "StowGUI braucht GNU Stow 2.4 oder neuer auf deinem Computer.",
  },
  success: {
    title: "Danke!",
    lead: "Dein Lizenzschlüssel ist auf dem Weg in dein E-Mail-Postfach. Er kommt meist innerhalb einer Minute an.",
    next: "Lade StowGUI herunter, öffne Einstellungen → Lizenz und aktiviere deinen Schlüssel online.",
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
          "Kauf- und Buchungsbelege bewahren wir für die jeweils geltenden gesetzlichen Fristen auf (Art. 6 Abs. 1 lit. c DSGVO). Lizenz- und aktuelle Aktivierungsdaten behalten wir, solange sie für die Bereitstellung deiner Lizenz, Support oder Rechtsansprüche benötigt werden. Danach werden sie gelöscht, soweit keine gesetzliche Aufbewahrungspflicht besteht.",
        ],
      },
      {
        heading: "Nutzung der App",
        paragraphs: [
          "Bei der Aktivierung oder Lizenzprüfung sendet die App deinen Lizenzschlüssel, eine zufällig erzeugte Installations-ID, deinen Computernamen und bei einer Verlängerung die Aktivierungs-ID an unseren Cloudflare-Dienst. Wir speichern die Zuordnung zur Lizenz, den in der App umbenennbaren Computernamen, den Aktivierungszeitpunkt und die letzte erfolgreiche Prüfung, um die Grenze von drei Computern einzuhalten und die Offline-Frist zu verlängern (Art. 6 Abs. 1 lit. b DSGVO). Diese IDs sind pseudonym, nicht anonym, weil die Lizenz deinem Kauf zugeordnet ist. Wir verwenden keinen Hardware-Fingerabdruck.",
          "Cloudflare verarbeitet außerdem deine IP-Adresse und technische Anfragedaten, um den Aktivierungsdienst bereitzustellen und zu schützen. Lizenzprüfungen im Hintergrund erfolgen höchstens einmal täglich; auch manuelle Aktivierungen und Prüfungen kontaktieren den Dienst. Jede erfolgreiche Prüfung ermöglicht bis zu 30 Tage Offline-Nutzung.",
          "Bei eingeschalteter Update-Prüfung ruft die App Versionsinformationen und Downloads von GitHub ab. GitHub erhält dabei deine IP-Adresse und technische Anfragedaten. Automatische Update-Prüfungen kannst du in den Einstellungen ausschalten. StowGUI lädt bei Lizenz- oder Update-Prüfungen keine verwalteten Konfigurationsdateien hoch.",
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
          "StowGUI wird von Trainvent, Inhaber Leon Marquardt, Ravensbergerstraße 75, 33602 Bielefeld, verkauft. Kontakt: support@trainvent.com.",
        ],
      },
      {
        heading: "2. Kauf und Lieferung",
        paragraphs: [
          `StowGUI kostet einmalig ${PRICE}, ohne Abonnement. Der Vertrag kommt mit Abschluss der Zahlung zustande. Nach erfolgreicher Zahlung senden wir den Lizenzschlüssel an die angegebene E-Mail-Adresse.`,
          "StowGUI ist eine Desktop-App für Linux und macOS und benötigt das separat installierte GNU Stow ab Version 2.4. Prüfe vor dem Kauf auf der Downloadseite, welche Builds verfügbar sind und welche Systemvoraussetzungen gelten. Mit dem kostenlosen Download kannst du Pakete und Vorschauen ansehen.",
        ],
      },
      {
        heading: "3. Nutzungsrecht",
        paragraphs: [
          `Du erhältst ein einfaches, zeitlich unbefristetes Nutzungsrecht für private und gewerbliche Zwecke auf bis zu ${MAX_COMPUTERS} aktiven Computern für einen Lizenzinhaber. Bei einer Organisation gilt die Lizenz für eine benannte Person. Alle 1.x-Versionen sind enthalten; spätere Hauptversionen sind nur enthalten, wenn dies ausdrücklich angegeben wird.`,
          "Du darfst deinen Schlüssel nicht veröffentlichen oder zur gemeinsamen Nutzung durch mehrere Lizenzinhaber weitergeben. Die vollständige Lizenz darfst du nach den folgenden Regeln übertragen. Zwingende gesetzliche Rechte, insbesondere zu zulässigen Sicherungskopien, zur Untersuchung und zur Interoperabilität, bleiben unberührt. Für Komponenten Dritter gelten deren eigene Lizenzbedingungen.",
        ],
      },
      {
        heading: "4. Aktivierung und Offline-Nutzung",
        paragraphs: [
          "Für die erste Aktivierung ist eine Internetverbindung erforderlich. Anschließend prüft die App die Lizenz im Hintergrund höchstens einmal täglich; du kannst sie auch manuell prüfen. Jede erfolgreiche Prüfung ermöglicht bis zu 30 Tage Offline-Nutzung. Nach Ablauf dieser Frist ist eine Online-Prüfung nötig, bevor du weitere kostenpflichtige Änderungen anwenden kannst.",
          `Sind bereits ${MAX_COMPUTERS} Computer aktiv, gibt eine weitere Aktivierung die Installation mit der am längsten zurückliegenden erfolgreichen Prüfung frei. Dort werden kostenpflichtige Änderungen bei der nächsten erfolgreichen Online-Prüfung oder nach Ablauf der bestehenden Offline-Frist gesperrt. Eine erneute Freischaltung erfordert eine ausdrückliche Aktivierung.`,
          "Ein wirksamer Widerruf oder eine vollständige Erstattung des Kaufpreises beendet das zugehörige Nutzungsrecht an den kostenpflichtigen Funktionen. Die Aktivierungsprüfung setzt dies bei der nächsten Online-Prüfung um. Pakete und Vorschauen ansehen, Verknüpfungen lösen und Kopien am bisherigen Ort behalten bleibt auch ohne aktive Lizenz möglich. Deine Dateien bleiben deine Dateien.",
          "Wenn wir den Aktivierungsdienst dauerhaft einstellen, stellen wir bestehenden Lizenzinhabern kostenlos ein Update oder eine andere Möglichkeit bereit, ihre lizenzierte Version ohne regelmäßige Online-Prüfung weiter zu nutzen. Damit versprechen wir keine neuen Funktionen oder Kompatibilität mit jedem zukünftigen Betriebssystem.",
        ],
      },
      {
        heading: "5. Lizenz übertragen oder weiterverkaufen",
        paragraphs: [
          "Du darfst die vollständige Lizenz an eine andere Person oder Organisation verkaufen oder verschenken. Die Übertragung umfasst sämtliche Rechte und enthaltenen Updates; Lizenz und Computerplätze dürfen nicht zwischen mehreren Inhabern aufgeteilt werden.",
          "Vor Abschluss der Übertragung muss der bisherige Inhaber die Nutzung der kostenpflichtigen Funktionen einstellen, seine lizenzierten Kopien entfernen und alle gespeicherten Lizenzschlüssel und Aktivierungstoken aus seinen Installationen und den von ihm kontrollierten Sicherungen löschen. Gesetzlich aufzubewahrende Kaufbelege darf er behalten, darin enthaltene Schlüssel oder Token aber nicht mehr nutzen. Offline-Token dürfen nach der Übertragung nicht mehr verwendet werden.",
          "Schreib an support@trainvent.com, um die Übergabe und die Zuordnung der Lizenz sowie der E-Mail-Adresse für die Schlüsselwiederherstellung zum neuen Inhaber zu veranlassen. Wir berechnen dafür keine Gebühr. Das bloße Weiterleiten eines Schlüssels ändert die Kaufadresse nicht und gibt bestehende Aktivierungen nicht frei. Der neue Inhaber erhält denselben Versionsumfang; durch die Übertragung beginnt die Widerrufsfrist des ursprünglichen Kaufs nicht neu. Zwingende gesetzliche Übertragungsrechte bleiben unberührt.",
        ],
      },
      {
        heading: "6. Widerrufsbelehrung",
        paragraphs: [
          "Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.",
          "Um dein Widerrufsrecht auszuüben, informiere Trainvent, Ravensbergerstraße 75, 33602 Bielefeld, support@trainvent.com, +49 160 3455942, mittels einer eindeutigen Erklärung, zum Beispiel per E-Mail, über deinen Entschluss. Du kannst das untenstehende Muster-Widerrufsformular verwenden, musst es aber nicht. Zur Wahrung der Frist reicht es aus, die Mitteilung vor Ablauf der Frist abzusenden.",
          "Wenn du widerrufst, erstatten wir dir alle im Rahmen des Vertrags erhaltenen Zahlungen unverzüglich und spätestens binnen vierzehn Tagen ab Eingang deines Widerrufs. Wir verwenden dasselbe Zahlungsmittel, sofern nicht ausdrücklich etwas anderes vereinbart wurde. Dir entstehen keine Erstattungsgebühren. Die zugehörige Lizenz wird deaktiviert.",
          "Bei kostenpflichtigen digitalen Inhalten ohne körperlichen Datenträger erlischt das Widerrufsrecht vorzeitig nur, wenn die Lieferung begonnen hat, nachdem du ausdrücklich dem Beginn vor Ablauf der Widerrufsfrist zugestimmt und deine Kenntnis bestätigt hast, dass du dadurch mit Beginn der Lieferung dein Widerrufsrecht verlierst, und wir die gesetzlich erforderliche Vertragsbestätigung bereitgestellt haben. Diese hält Zustimmung und Kenntnisbestätigung fest. Sind diese Voraussetzungen nicht erfüllt, beendet der sofortige Versand des Schlüssels allein das Widerrufsrecht nicht.",
        ],
      },
      {
        heading: "Muster-Widerrufsformular",
        paragraphs: [
          "An Trainvent, Ravensbergerstraße 75, 33602 Bielefeld, support@trainvent.com: Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden digitalen Inhalte: StowGUI-Lizenz. Bestellt am/erhalten am (*): … Name des/der Verbraucher(s): … Anschrift des/der Verbraucher(s): … Unterschrift des/der Verbraucher(s), nur bei Mitteilung auf Papier: … Datum: … (*) Unzutreffendes streichen.",
        ],
      },
      {
        heading: "7. Updates, Mängelrechte und Haftung",
        paragraphs: [
          "Gesetzliche Mängelrechte und Aktualisierungspflichten bleiben unberührt. Die Zusage aller 1.x-Versionen beschränkt keine zwingende Pflicht, erforderliche Aktualisierungen zur Aufrechterhaltung der Vertragsmäßigkeit einschließlich Sicherheitsupdates bereitzustellen. Schreib an support@trainvent.com, wenn StowGUI nicht wie vereinbart funktioniert.",
          "Wir haften unbeschränkt bei Vorsatz, grober Fahrlässigkeit, Verletzung von Leben, Körper oder Gesundheit und soweit zwingendes Recht dies verlangt. Bei leichter Fahrlässigkeit ist die Haftung im Übrigen auf die Verletzung wesentlicher Vertragspflichten und den vorhersehbaren, vertragstypischen Schaden begrenzt. Gesetzliche Produkthaftung und ausdrücklich übernommene Garantien bleiben unberührt. Erstelle vor Dateiänderungen unabhängige Sicherungen; dieser Hinweis beschränkt deine gesetzlichen Rechte nicht.",
        ],
      },
      {
        heading: "8. Anwendbares Recht",
        paragraphs: [
          "Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Verbraucher behalten den zwingenden Schutz des Rechts ihres gewöhnlichen Aufenthaltsstaates, soweit anwendbar. Zwingende Verbraucherrechte werden durch diese Bedingungen nicht eingeschränkt.",
        ],
      },
    ],
  },
};

export default de;
