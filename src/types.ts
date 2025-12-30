/**
 * This file contains all the core type definitions and interfaces used throughout the CanvicoEditor application.
 * It serves as a single source of truth for the shapes of objects like configuration options and modules.
 */

/**
 * Configuration options for the ResizeModule.
 */
export type ResizeModuleConfig = {
    /** CSS selector for the width input field. */
    widthInputSelector: string;
    /** CSS selector for the height input field. */
    heightInputSelector: string;
    /** Optional CSS selector for the "keep aspect ratio" checkbox. */
    lockAspectRatioSelector?: string;
};

/**
 * Configuration options for the CropModule.
 */
export type CropModuleConfig = {
    /** CSS selector for the button that activates crop mode. */
    activateButtonSelector: string;
    /** CSS selector for the button that applies the crop. */
    applyButtonSelector: string;
    /** Optional color for the crop selection border. */
    frameColor?: string;
    /** Optional color for the semi-transparent overlay outside the crop area. */
    outsideOverlayColor?: string;
};

/**
 * A container for all module-specific configuration options.
 */
export type ModuleConfig = {
    /** Configuration for the Resize module. */
    resize?: ResizeModuleConfig;
    /** Configuration for the Crop module. */
    crop?: CropModuleConfig;
};

/**
 * The main configuration object for the CanvicoEditor.
 */
export type CanvicoEditorConfig = {
    /** CSS selector for the element that will contain the editor's canvas. */
    containerSelector: string;
    /** CSS selector for the file input used to load images. */
    imageFileInputSelector: string;
    /** CSS selector for the button that resets the image to its original state. */
    resetEditsButtonSelector: string;
    /** CSS selector for the button that saves/downloads the current image. */
    saveButtonSelector: string;
    /** CSS selector for the button that clears the canvas and resets the editor. */
    clearCanvasButtonSelector: string;
    /** Optional maximum allowed file size in megabytes (MB). */
    maxFileSizeMB?: number;
    /** Optional container for all module configurations. */
    modules?: ModuleConfig;
};

/**
 * The interface that all editor modules must implement.
 */

export interface IModule {
    /** Initializes the module, binding events to its control elements. */
    init(): void;

    /** Cleans up all resources and event listeners used by the module. */
    destroy(): void;

    /** Called when the module becomes active, enabling its specific functionality (e.g., drawing a crop box). */
    activate(): void;

    /** Called when the module is deactivated, cleaning up its active state. */
    deactivate(): void;

    /** Returns the unique name of the module (e.g., 'resize', 'crop'). */
    getName(): string;

    /** Optional method for drawing a module-specific overlay on the canvas (e.g., a crop rectangle or resize handles). */
    drawOverlay?(): void;
}

/**
 * A generic type for an event handler function that accepts a DOM Event.
 */
export type ModuleEventHandler = (event: Event) => void;
