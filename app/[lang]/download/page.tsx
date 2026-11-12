import { Button, Card, CodeBlock } from "@trainvent/arcubic";
import SiteHeader from "../../components/SiteHeader";
import ReleaseAction from "../../components/ReleaseAction";
import { RELEASED, RELEASED_PLATFORMS, RELEASES_URL } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";
import { resolveLang, type LangParams } from "@/lib/params";

const STOW_INSTALL = {
  linux: "sudo apt install stow   # Ubuntu\nsudo dnf install stow   # Fedora\nsudo pacman -S stow     # Arch",
  macos: "brew install stow",
};

export async function generateMetadata(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return pageMetadata(locale, "/download", dict.download.title, dict.download.lead);
}

export default async function DownloadPage(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  const text = dict.download;
  return (
    <>
      <SiteHeader locale={locale} dict={dict} currentPath="/download" />
      <main className="narrow">
        <h1>{text.title}</h1>
        <p className="lead">{RELEASED ? text.lead : dict.notifyHint}</p>
        {!RELEASED && <ReleaseAction dict={dict} />}
        {RELEASED && <div className="card-grid two">
          {(["linux", "macos"] as const).map((os) => (
            <Card key={os} className="download">
              <h3>{text[os]}</h3>
              {RELEASED_PLATFORMS.includes(os) ? (
                <Button size="3" asChild>
                  <a href={RELEASES_URL}>{text.getRelease}</a>
                </Button>
              ) : (
                <Button size="3" disabled>{dict.comingSoon}</Button>
              )}
            </Card>
          ))}
        </div>}
        <h2>{text.stowTitle}</h2>
        <p>{text.stowLead}</p>
        <div className="card-grid two">
          <CodeBlock filename={text.linux} language="bash" code={STOW_INSTALL.linux} />
          <CodeBlock filename={text.macos} language="bash" code={STOW_INSTALL.macos} />
        </div>
      </main>
    </>
  );
}
