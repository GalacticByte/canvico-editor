import { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import { CanvicoEditor } from "canvico-editor";
import styles from "./demo.module.css"; // Import CSS Module

function EditorDemo() {
    const [activeTab, setActiveTab] = useState<"crop" | "transform" | "resize">("crop");
    const [lastError, setLastError] = useState<string | null>(null);

    useEffect(() => {
        // Ensure the code runs only on the client side
        if (typeof globalThis === "undefined") {
            return;
        }

        try {
            const editor = new CanvicoEditor({
                containerSelector: `.${styles["canvico-container"]}`, // Use the unique class name with bracket notation
                imageFileInputSelector: ".input-upload-file",
                resetEditsButtonSelector: "#resetEdit",
                clearCanvasButtonSelector: "#cleanAll",
                saveButtonSelector: "#saveBtn",
                maxFileSizeMB: 5,
                logErrorsToConsole: true,
                onError: ({ error, source, operation, timestamp }) => {
                    // Integrate with your logger/monitoring tool here
                    console.error("[CanvicoEditor]", timestamp.toISOString(), source, operation, error);
                },
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
                    transform: {
                        rotateInputSelector: "#rotateDeg",
                        flipHorizontalButtonSelector: "#flipH",
                        flipVerticalButtonSelector: "#flipV",
                    },
                },
            });

            return () => {
                editor.destroy();
            };
        } catch (error) {
            console.error("Failed to initialize CanvicoEditor:", error);
            setLastError(error instanceof Error ? error.message : "Unknown initialization error.");
        }
    }, []);

    return (
        <>
            {/* The <Head> component is not needed for CSS Modules */}
            <div className={styles.demoContainer}>
                <header className={styles.header}>
                    <h1 className={styles.headerTitle}>Canvico Editor</h1>
                    <p className={styles.headerDesc}>A simple and powerful in-browser image editor, built with TypeScript and Canvas API. Try it out below!</p>
                    {lastError && <output className={styles.errorNotice}>Last handled error: {lastError}</output>}
                </header>
                <main className={styles.mainLayout}>
                    <aside className={styles.toolsContainer}>
                        {/* Main Actions Group */}
                        <div className={styles.controlGroup}>
                            <span className={styles.groupLabel}>Main Actions</span>
                            <div className={styles.groupContent}>
                                <div className={styles.fileInputContainer}>
                                    <label htmlFor="fileInput" className={styles.fileInputLabel}>
                                        Choose File
                                    </label>
                                    <input type="file" id="fileInput" accept="image/*" className={`${styles.fileInput} input-upload-file`} />
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

                            <div className={styles.tabs}>
                                <button type="button" className={`${styles.tabButton} ${activeTab === "crop" ? styles.tabButtonActive : ""}`} onClick={() => setActiveTab("crop")}>
                                    Cropping
                                </button>
                                <button type="button" className={`${styles.tabButton} ${activeTab === "transform" ? styles.tabButtonActive : ""}`} onClick={() => setActiveTab("transform")}>
                                    Transform
                                </button>
                                <button type="button" className={`${styles.tabButton} ${activeTab === "resize" ? styles.tabButtonActive : ""}`} onClick={() => setActiveTab("resize")}>
                                    Resizing
                                </button>
                            </div>

                            <div className={styles.tabContent}>
                                <div className={`${styles.tabPane} ${activeTab === "crop" ? "" : styles.tabPaneHidden}`}>
                                    <div className={styles.tabSection}>
                                        <span className={styles.sectionLabel}>Cropping</span>
                                        <div className={styles.groupContent}>
                                            <button id="cropBtn" className={styles.controlButton}>
                                                Activate
                                            </button>
                                            <button id="applyBtn" className={styles.controlButton}>
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${styles.tabPane} ${activeTab === "transform" ? "" : styles.tabPaneHidden}`}>
                                    <div className={styles.tabSection}>
                                        <span className={styles.sectionLabel}>Rotate</span>
                                        <div className={styles.groupContent}>
                                            <label htmlFor="rotateDeg" className={styles.controlLabel}>
                                                Rotate (deg):
                                            </label>
                                            <input type="number" id="rotateDeg" min="-180" max="180" defaultValue={0} className={styles.sizeInput} />
                                        </div>
                                    </div>

                                    <div className={styles.tabSection}>
                                        <span className={styles.sectionLabel}>Flip</span>
                                        <div className={styles.groupContent}>
                                            <button id="flipH" className={styles.controlButton}>
                                                Flip H
                                            </button>
                                            <button id="flipV" className={styles.controlButton}>
                                                Flip V
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${styles.tabPane} ${activeTab === "resize" ? "" : styles.tabPaneHidden}`}>
                                    <div className={styles.tabSection}>
                                        <span className={styles.sectionLabel}>Resizing</span>
                                        <div className={styles.groupContent}>
                                            <label htmlFor="widthInput" className={styles.controlLabel}>
                                                Width:
                                            </label>
                                            <input type="text" id="widthInput" min="1" className={styles.sizeInput} />
                                            <label htmlFor="heightInput" className={styles.controlLabel}>
                                                Height:
                                            </label>
                                            <input type="text" id="heightInput" className={styles.sizeInput} />
                                            <label htmlFor="keepAspectRatio" className={styles.checkboxLabel}>
                                                <input type="checkbox" id="keepAspectRatio" defaultChecked className={styles.checkboxInput} />
                                                <span className={styles.customCheckbox}></span>
                                                <span>Keep aspect ratio</span>
                                            </label>
                                        </div>
                                    </div>
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
