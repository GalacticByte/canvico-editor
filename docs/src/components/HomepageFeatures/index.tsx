import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
    title: string;
    Svg: React.ComponentType<React.ComponentProps<"svg">>;
    description: ReactNode;
};

const FeatureList: FeatureItem[] = [
    {
        title: "Easy to Integrate",
        Svg: require("@site/static/img/canvico-integration.svg").default,
        description: <>Get started in minutes with a simple API. It only takes a few lines of code to add a powerful image editor to your website or application.</>,
    },
    {
        title: "Modular Architecture",
        Svg: require("@site/static/img/modular-system-concept.svg").default,
        description: <>Need more features? The modular architecture makes it easy to extend the editor with your own tools, like filters, watermarks, or drawing utilities.</>,
    },
    {
        title: "Modern Tech Stack",
        Svg: require("@site/static/img/developer-coding.svg").default,
        description: <>Built with TypeScript and the native Canvas API, Canvico Editor is lightweight, performant, and fully prepared for modern web projects.</>,
    },
];

function Feature({ title, Svg, description }: FeatureItem) {
    return (
        <div className={clsx("col col--4")}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img" />
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): ReactNode {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
