import type { CanvicoEditorConfig } from "../types.js";
import { ErrorHandler } from "./error-handler.js";
import { createDOMElementNotFoundError, createInvalidInputTypeError } from "./validation.js";

/**
 * Defines the core DOM elements required by the editor.
 */
export interface CoreDOMElements {
    container: HTMLElement;
    imageFileInput: HTMLInputElement;
    resetEditsButton: HTMLButtonElement;
    clearCanvasButton: HTMLButtonElement;
    saveButton: HTMLButtonElement;
}

/**
 * Defines the DOM elements for the Resize module.
 */
export interface ResizeDOMElements {
    widthInput: HTMLInputElement;
    heightInput: HTMLInputElement;
    lockAspectRatio?: HTMLInputElement;
}

/**
 * Defines the DOM elements for the Crop module.
 */
export interface CropDOMElements {
    activateButton: HTMLButtonElement;
    applyButton: HTMLButtonElement;
}

/**
 * Manages all DOM interactions for the CanvicoEditor.
 * It queries and validates the existence of all required and optional
 * elements upon instantiation, providing a single, reliable source of DOM nodes.
 */
export class DOMManager {
    /** Contains the core, always-required DOM elements. */
    public readonly elements: CoreDOMElements;

    /** Contains DOM elements for the resize module. Undefined if the module is not configured. */
    public readonly resizeElements?: ResizeDOMElements;

    /** Contains DOM elements for the crop module. Undefined if the module is not configured. */
    public readonly cropElements?: CropDOMElements;

    private errorHandler: ErrorHandler;

    /**
     * Creates an instance of DOMManager.
     * @param config - The main editor configuration object containing CSS selectors.
     * @param errorHandler - The error handler instance for reporting non-fatal errors.
     * @throws {Error} If a required DOM element cannot be found.
     */
    constructor(config: CanvicoEditorConfig, errorHandler: ErrorHandler) {
        this.errorHandler = errorHandler;
        this.elements = {
            container: this.queryAndValidate<HTMLElement>(config.containerSelector),
            imageFileInput: this.queryAndValidate<HTMLInputElement>(config.imageFileInputSelector, (el) => {
                if (el.type !== "file") {
                    throw createInvalidInputTypeError(config.imageFileInputSelector);
                }
            }),
            resetEditsButton: this.queryAndValidate<HTMLButtonElement>(config.resetEditsButtonSelector),
            clearCanvasButton: this.queryAndValidate<HTMLButtonElement>(config.clearCanvasButtonSelector),
            saveButton: this.queryAndValidate<HTMLButtonElement>(config.saveButtonSelector),
        };

        this.resizeElements = this.initializeModuleElements(config.modules?.resize, "Resize", (cfg) => {
            const elements: ResizeDOMElements = {
                widthInput: this.queryAndValidate<HTMLInputElement>(cfg.widthInputSelector),
                heightInput: this.queryAndValidate<HTMLInputElement>(cfg.heightInputSelector),
            };
            if (cfg.lockAspectRatioSelector) {
                elements.lockAspectRatio = this.queryAndValidate<HTMLInputElement>(cfg.lockAspectRatioSelector);
            }
            return elements;
        });
        this.cropElements = this.initializeModuleElements(config.modules?.crop, "Crop", (cfg) => ({
            activateButton: this.queryAndValidate<HTMLButtonElement>(cfg.activateButtonSelector),
            applyButton: this.queryAndValidate<HTMLButtonElement>(cfg.applyButtonSelector),
        }));
    }

    /**
     * Queries the document for an element and throws a detailed error if not found.
     * @template T - The expected HTML element type.
     * @param selector - The CSS selector for the element.
     * @param validator - Optional validation function to check specific element properties.
     * @returns The found element, correctly typed.
     * @throws {Error} If the element with the given selector does not exist in the DOM.
     */
    private queryAndValidate<T extends HTMLElement>(selector: string, validator?: (element: T) => void): T {
        const element = document.querySelector<T>(selector);
        if (!element) {
            throw createDOMElementNotFoundError(selector);
        }
        if (validator) {
            validator(element);
        }
        return element;
    }

    /**
     * Initializes DOM elements for a module using a provided extractor function.
     * @param config - The module configuration object.
     * @param moduleName - The name of the module for error logging.
     * @param extractor - A function that extracts and validates DOM elements from the config.
     * @returns An object with DOM elements or `undefined`.
     */
    private initializeModuleElements<TConfig, TResult>(config: TConfig | undefined, moduleName: string, extractor: (config: TConfig) => TResult): TResult | undefined {
        if (!config) return undefined;

        try {
            return extractor(config);
        } catch (error) {
            console.warn(`DOM elements for ${moduleName} module not found. The module will be disabled.`);
            this.errorHandler.handle(error as Error);
            return undefined;
        }
    }
}
