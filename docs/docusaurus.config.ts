import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: "Canvico Editor",
    tagline: "A simple and extensible image editor based on TypeScript and the Canvas API. Modular and easy to integrate.",
    favicon: "img/canvico-logo.svg",
    trailingSlash: true,

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: "https://galacticbyte.github.io",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/canvico-editor/",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "GalacticByte",
    projectName: "canvico-editor",
    deploymentBranch: "gh-pages",

    onBrokenLinks: "throw",

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            {
                docs: {
                    sidebarPath: "./sidebars.ts",
                    editUrl: "https://github.com/GalacticByte/canvico-editor/tree/main/docs/",
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    plugins: [
        [
            "docusaurus-plugin-typedoc",
            {
                // Points to the main project's tsconfig.json
                tsconfig: "../tsconfig.json",
                // Points to the library's source code
                entryPoints: ["../src/index.ts"],
                entryPointStrategy: "expand",
                // Where to generate the API documentation .md files
                out: "docs/api",
                // New option to control navigation and naming
                navigation: {
                    includeGroups: true,
                },
                // Exclude private members from the documentation
                excludePrivate: true,
                // Hide "Defined in" links throughout the API documentation
                disableSources: true,
            },
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        // image: "img/docusaurus-social-card.jpg",
        colorMode: {
            respectPrefersColorScheme: true,
        },
        navbar: {
            title: "Canvico Editor",
            logo: {
                alt: "Canvico Editor Logo",
                src: "img/canvico-logo.svg",
            },
            items: [
                {
                    type: "doc",
                    position: "left",
                    docId: "intro", // Points directly to the intro.md file
                    label: "Docs",
                },
                {
                    to: "/demo/", // Link to the static demo
                    label: "Demo",
                    position: "left",
                },
                {
                    href: "https://github.com/GalacticByte/Canvico-Editor",
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Learn",
                    items: [
                        {
                            label: "Docs",
                            to: "/docs/intro",
                        },
                    ],
                },

                {
                    title: "More",
                    items: [
                        {
                            label: "GitHub",
                            href: "https://github.com/GalacticByte/canvico-editor",
                        },
                        {
                            label: "Demo",
                            to: "/demo/",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Canvico Editor.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
