import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: "./src/index.ts",
            formats: ["es"],
            fileName: "index",
        },
        outDir: "dist",
        rollupOptions: {
            output: {
                preserveModules: true,
                entryFileNames: "[name].js",
            },
        },
    },
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
});
