import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx("hero hero--primary", styles.heroBanner)}>
            <div className="container">
                <Heading as="h1" className="hero__title">
                    {siteConfig.title}
                </Heading>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link className="button button--secondary button--lg" to="/docs/intro">
                        Read docs
                    </Link>
                </div>
            </div>
        </header>
    );
}

function HomepageCustomization() {
    return (
        <section className="padding-vert--xl customization-section">
            <div className="container">
                <div className="row">
                    <div className="col col--8 col--offset-2">
                        <div className="text--center">
                            <h2 className="margin-bottom--lg">Designed for Flexibility</h2>
                            <p className="hero__subtitle">The editor is designed to be highly flexible. The provided demo page showcases just one possible layout, but you are not limited to it. You can place the image container and any tool panels anywhere in your HTML structure. Use your own CSS to style them and create a layout that perfectly fits the needs of your application. This allows for seamless integration into any existing design.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout title={`${siteConfig.title}`} description="Description will go into a meta tag in <head />">
            <HomepageHeader />
            <main>
                <HomepageCustomization />
                <HomepageFeatures />
            </main>
        </Layout>
    );
}
