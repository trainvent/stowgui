import { Badge, Button, Card } from "@trainvent/arcubic";
import Link from "next/link";
import AppMock from "../components/AppMock";
import ReleaseAction from "../components/ReleaseAction";
import SiteHeader from "../components/SiteHeader";
import { RELEASED } from "@/lib/config";
import { localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { resolveLang, type LangParams } from "@/lib/params";

export async function generateMetadata(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return { ...pageMetadata(locale, "/", dict.meta.title, dict.meta.description), title: { absolute: dict.meta.title } };
}

export default async function Home(props: LangParams) {
  const { locale, dict } = await resolveLang(props);
  return (
    <>
      <SiteHeader locale={locale} dict={dict} />
      <main>
        <section className="hero">
          <div>
            {!RELEASED && <Badge size="2" className="coming-soon">{dict.comingSoon}</Badge>}
            <h1>
              {dict.hero.titleStart} <span>{dict.hero.titleAccent}</span>
            </h1>
            <p className="lead">{dict.hero.lead}</p>
            <div className="actions">
              <ReleaseAction dict={dict} />
              {RELEASED && (
                <Button size="3" variant="outline" asChild>
                  <Link href={localePath(locale, "/download")}>{dict.downloadFree}</Link>
                </Button>
              )}
            </div>
          </div>
          <AppMock text={dict.mock} />
        </section>

        <section id="features">
          <h2>{dict.features.title}</h2>
          <div className="card-grid">
            {dict.features.items.map((item) => (
              <Card key={item.title} className="feature">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2>{dict.steps.title}</h2>
          <ol className="steps">
            {dict.steps.items.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="pricing">
          <h2>{dict.pricing.title}</h2>
          <Card className="pricing">
            <div>
              <div className="price">
                {dict.pricing.price} <small>{dict.pricing.once}</small>
              </div>
              <ul className="checks">
                {dict.pricing.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="pricing-side">
              <ReleaseAction dict={dict} />
              <p>{RELEASED ? dict.pricing.free : dict.notifyHint}</p>
              <small>{dict.pricing.vat}</small>
            </div>
          </Card>
        </section>

        <section id="faq">
          <h2>{dict.faq.title}</h2>
          <div className="faq">
            {dict.faq.items.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>
                  {item.a}
                  {"link" in item && (
                    <>
                      {" "}
                      <Link href={localePath(locale, item.link)}>{dict.license.submit}</Link>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
