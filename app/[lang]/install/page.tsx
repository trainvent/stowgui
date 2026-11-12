import { Button, CodeBlock } from "@trainvent/arcubic";
import SiteHeader from "../../components/SiteHeader";
import { APP_ID, ICON_URL, RELEASES_URL } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";
import { resolveLang, type LangParams } from "@/lib/params";

const APPIMAGE = "~/Applications/StowGUI.AppImage";
const ICON = `~/.local/share/icons/${APP_ID}.png`;

const UBUNTU_COMMANDS = {
  store: `mkdir -p ~/Applications\nmv ~/Downloads/StowGUI-*-x86_64.AppImage ${APPIMAGE}`,
  executable: `chmod +x ${APPIMAGE}`,
  menu: `mkdir -p ~/.local/share/icons ~/.local/share/applications
wget -qO ${ICON} ${ICON_URL}
cat > ~/.local/share/applications/${APP_ID}.desktop <<EOF
[Desktop Entry]
Type=Application
Name=StowGUI
Comment=Link your dotfiles with GNU Stow
Exec=${APPIMAGE.replace("~", "$HOME")}
Icon=${ICON.replace("~", "$HOME")}
Terminal=false
Categories=Utility;
StartupWMClass=${APP_ID}
EOF`,
};

export async function generateMetadata(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return pageMetadata(locale, "/install", dict.install.title, dict.install.lead);
}

export default async function InstallPage(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  const text = dict.install;
  const steps = text.steps;
  return (
    <>
      <SiteHeader locale={locale} dict={dict} currentPath="/install" />
      <main className="narrow">
        <h1>{text.title}</h1>
        <p className="lead">{text.lead}</p>
        <h2>{text.ubuntu}</h2>
        <ol className="install-steps">
          <li>
            <h3>{steps.download.title}</h3>
            <p>{steps.download.text}</p>
            <Button size="3" asChild>
              <a href={RELEASES_URL}>{dict.download.getRelease}</a>
            </Button>
          </li>
          {(["store", "executable", "menu"] as const).map((step) => (
            <li key={step}>
              <h3>{steps[step].title}</h3>
              <p>{steps[step].text}</p>
              <CodeBlock language="bash" code={UBUNTU_COMMANDS[step]} />
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
