import type { SidebarsConfig, SidebarItem } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

const apiSidebar = require("./docs/api/typedoc-sidebar.cjs");

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function renameApiLabels(items: SidebarItem[]): SidebarItem[] {
    return items.map((item) => {
        if (typeof item === "string") {
            return item;
        }
        if (item.label && item.type && (item.type === "category" || item.type === "doc" || item.type === "link")) {
            // Specjalny przypadek dla 'index' -> 'Overview'
            const newLabel = item.label === "index" ? "Overview" : capitalize(item.label);
            if (item.type === "category" && Array.isArray(item.items)) {
                return {
                    ...item,
                    label: newLabel,
                    items: renameApiLabels(item.items),
                };
            }
            return { ...item, label: newLabel };
        }
        return item;
    });
}
const sidebars: SidebarsConfig = {
    // By default, Docusaurus generates a sidebar from the docs folder structure
    tutorialSidebar: [
        // Explicitly link to your main documentation files
        {
            type: "category",
            label: "Introduction",
            items: [
                {
                    type: "doc",
                    id: "intro",
                    label: "Introduction",
                },
            ],
        },
        {
            type: "doc",
            id: "CONTRIBUTING",
            label: "Contributing",
        },
        {
            type: "category",
            label: "API Reference",
            link: {
                type: "generated-index",
            },
            items: renameApiLabels(apiSidebar),
        },
    ],

    // But you can create a sidebar manually
    /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;
