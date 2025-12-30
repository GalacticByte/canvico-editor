import React, { useEffect, useRef } from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import { CanvicoEditor } from "canvico-editor";
import styles from "./demo.module.css"; // Import CSS Module

function EditorDemo() {
    useEffect(() => {
        // Ensure the code runs only on the client side
        if (typeof window !== "undefined") {
            try {
                new CanvicoEditor({
                    containerSelector: `.${styles["canvico-container"]}`, // Use the unique class name with bracket notation
                    imageFileInputSelector: ".input-upload-file",
                    resetEditsButtonSelector: "#resetEdit",
                    clearCanvasButtonSelector: "#cleanAll",
                    saveButtonSelector: "#saveBtn",
                    modules: {
                        resize: {
                            widthInputSelector: "#widthInput",
                            heightInputSelector: "#heightInput",
                            lockAspectRatioSelector: "#keepAspectRatio",
                        },
                        crop: {
                            activateButtonSelector: "#cropBtn",
                            applyButtonSelector: "#applyBtn",
                            frameColor: "#d84cb9",
                            outsideOverlayColor: "rgba(0,0,0,0.2)",
                        },
                    },
                });
            } catch (error) {
                console.error("Failed to initialize CanvicoEditor:", error);
            }
        }
    }, []);

    return (
        <>
            {/* The <Head> component is not needed for CSS Modules */}
            <div className={styles.demoContainer}>
                <header className={styles.header}>
                    <h1 className={styles.headerTitle}>Canvico Editor</h1>
                    <p className={styles.headerDesc}>A simple and powerful in-browser image editor, built with TypeScript and Canvas API. Try it out below!</p>
                </header>
                <main className={styles.mainLayout}>
                    <aside className={styles.toolsContainer}>
                        {/* Main Actions Group */}
                        <div className={styles.controlGroup}>
                            <span className={styles.groupLabel}>Main Actions</span>
                            <div className={styles.groupContent}>
                                <div className={styles.fileInputContainer}>
                                    <label className={styles.fileInputLabel}>Choose File</label>
                                    <input type="file" accept="image/*" className={`${styles.fileInput} input-upload-file`} />
                                </div>
                                <button id="saveBtn" className={styles.saveButton}>
                                    Save
                                </button>
                                <div className={styles.separator}></div>
                                <button id="resetEdit" className={styles.controlButton}>
                                    Reset
                                </button>
                                <button id="cleanAll" className={styles.controlButton}>
                                    Clear All
                                </button>
                            </div>
                        </div>

                        {/* Tools Group */}
                        <div className={styles.controlGroup}>
                            <span className={styles.groupLabel}>Tools</span>

                            {/* Crop Module Sub-group */}
                            <div className={styles.moduleSubGroup}>
                                <h5 className={styles.subGroupLabel}>Cropping</h5>
                                <div className={styles.groupContent}>
                                    <button id="cropBtn" className={styles.controlButton}>
                                        Activate
                                    </button>
                                    <button id="applyBtn" className={styles.controlButton}>
                                        Apply
                                    </button>
                                </div>
                            </div>

                            {/* Resize Module Sub-group */}
                            <div className={styles.moduleSubGroup}>
                                <h5 className={styles.subGroupLabel}>Resizing</h5>
                                <div className={styles.groupContent}>
                                    <label htmlFor="widthInput" className={styles.controlLabel}>
                                        Width:
                                    </label>
                                    <input type="text" id="widthInput" min="1" className={styles.sizeInput} />
                                    <label htmlFor="heightInput" className={styles.controlLabel}>
                                        Height:
                                    </label>
                                    <input type="text" id="heightInput" min="1" className={styles.sizeInput} />
                                    <label htmlFor="keepAspectRatio" className={styles.checkboxLabel}>
                                        <input type="checkbox" id="keepAspectRatio" defaultChecked className={styles.checkboxInput} />
                                        <span className={styles.customCheckbox}></span>
                                        <span>Keep aspect ratio</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </aside>
                    <div className={styles["canvico-container"]}>{/* The editor will be mounted here */}</div>
                </main>
            </div>
        </>
    );
}

export default function DemoPage() {
    return (
        <Layout title="Demo" description="Live demo of Canvico Editor">
            <EditorDemo />
        </Layout>
    );
}
