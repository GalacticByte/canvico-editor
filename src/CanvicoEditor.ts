import type { CanvicoEditorConfig, IModule } from "./types.js";
import { ErrorHandler } from "./utils/error-handler.js";
import { DOMManager } from "./utils/dom-manager.js";
import { validateFile, createCanvasContextError, createImageLoadError, createImageSaveError, createFeatureNotSupportedError } from "./utils/validation.js";

// Modules
import { ResizeModule } from "./modules/ResizeModule.js";
import { CropModule } from "./modules/CropModule.js";

enum ModuleName {
    RESIZE = "resize",
    CROP = "crop",
}

export class CanvicoEditor {
    /** Manages all DOM element interactions and selections. */
    private dom: DOMManager;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    /** The original, unmodified image loaded by the user. */
    private initialImage?: HTMLImageElement;
    /** The image currently being displayed and edited, including all modifications. */
    private currentImage?: HTMLImageElement;

    /** A map holding all registered and initialized modules. */
    private modules: Map<string, IModule> = new Map();

    /** Handles and logs errors that occur within the editor. */
    private errorHandler: ErrorHandler;

    /** The configuration options passed to the editor upon instantiation. */
    private config: CanvicoEditorConfig;

    private DEFAULT_MODULE: ModuleName | null = null;
    private activeModuleName: ModuleName | null = null;

    /**
     * Creates an instance of CanvasImageEditor.
     * @param config - The configuration object for the editor.
     * @throws {Error} If a required feature like FileReader is not supported by the browser.
     */
    constructor(config: CanvicoEditorConfig) {
        // Assign properties first, so they are available in case of an early error
        this.config = config;
        this.errorHandler = new ErrorHandler();

        if (!window.FileReader) {
            throw createFeatureNotSupportedError("FileReader API is not supported by this browser.");
        }

        // All initializations
        this.dom = new DOMManager(config, this.errorHandler); // Initialize and validate DOM elements
        [this.canvas, this.ctx] = this._initializeCanvas(); // Create canvas and get context 2d
        this._registerModules();
        this._bindGlobalEvents();
    }

    /**
     * Creates the canvas element and its 2D rendering context.
     * @returns A tuple containing the canvas and its context.
     * @throws {Error} If the 2D context cannot be created.
     */
    private _initializeCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw createCanvasContextError();
        }
        this.dom.elements.container.appendChild(canvas);

        return [canvas, ctx];
    }

    // --- Public API & User Actions ---

    /**
     * Cleans up all resources, event listeners, and modules to safely remove the editor instance.
     */
    public destroy(): void {
        // Deactivate any active module
        this._setActiveModule(null);

        // A simple way to remove all listeners is to replace the nodes.
        this.dom.elements.imageFileInput.replaceWith(this.dom.elements.imageFileInput.cloneNode(true));
        this.dom.elements.clearCanvasButton.replaceWith(this.dom.elements.clearCanvasButton.cloneNode(true));
        this.dom.elements.saveButton.replaceWith(this.dom.elements.saveButton.cloneNode(true));

        this.modules.forEach((module) => module.destroy());
        this.modules.clear();
    }

    /**
     * Resets the current image to its original state, discarding all changes.
     */
    private _resetImage(): void {
        if (this.initialImage) {
            this.currentImage = this.initialImage;
            this._resetCanvasView(this.initialImage);
            this._setActiveModule(this.DEFAULT_MODULE);
        }
    }

    /**
     * Clears the canvas and resets the entire editor state, including loaded images and module states.
     */
    private _cleanAll(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.width = 0;
        this.canvas.height = 0;

        this.initialImage = undefined;
        this.currentImage = undefined;

        // Reset input fields
        if (this.dom.resizeElements) {
            this.dom.resizeElements.widthInput.value = "";
            this.dom.resizeElements.heightInput.value = "";
            if (this.dom.resizeElements.lockAspectRatio) this.dom.resizeElements.lockAspectRatio.checked = false;
        }

        this.dom.elements.imageFileInput.value = "";

        this._setActiveModule(this.DEFAULT_MODULE);
    }

    /**
     * Triggers a download of the current canvas content as a PNG image.
     */
    private _saveImage(): void {
        if (!this.currentImage) {
            this.errorHandler.handle(createImageSaveError());
            return;
        }
        const link = document.createElement("a");
        const originalFile = this.dom.elements.imageFileInput.files?.[0];
        const baseName = originalFile ? originalFile.name.replace(/\.[^/.]+$/, "") : "image";
        link.download = `${baseName}-edited.png`;
        link.href = this.canvas.toDataURL("image/png");
        link.click();
    }

    // --- Initialization Methods ---

    /**
     * Binds event listeners to the main control elements like file input, save, and reset buttons.
     */
    private _bindGlobalEvents(): void {
        this.dom.elements.imageFileInput.addEventListener("change", (e: Event) => this._loadImage(e));

        // Bind module buttons
        if (this.dom.cropElements) {
            this.dom.cropElements.activateButton.addEventListener("click", () => this.currentImage && this._setActiveModule(ModuleName.CROP));
        }

        this.dom.elements.resetEditsButton.addEventListener("click", () => this._resetImage());
        this.dom.elements.clearCanvasButton.addEventListener("click", () => this._cleanAll());
        this.dom.elements.saveButton.addEventListener("click", () => this._saveImage());
    }

    // --- Core Drawing & State Logic ---

    /**
     * Initializes and registers all available modules based on the provided options.
     */
    private _registerModules(): void {
        // Register ResizeModule only if its essential inputs are provided
        if (this.dom.resizeElements) {
            const resizeModule = new ResizeModule(this.dom.resizeElements, {
                container: this.dom.elements.container,
                canvas: this.canvas,
                ctx: this.ctx,

                getCurrentImage: () => this.currentImage,
            });
            this.modules.set(ModuleName.RESIZE, resizeModule);
            this.DEFAULT_MODULE = ModuleName.RESIZE;
        }

        // Register CropModule only if its essential button is provided
        if (this.dom.cropElements && this.config.modules?.crop) {
            const cropModule = new CropModule(this.dom.cropElements, {
                canvas: this.canvas,
                ctx: this.ctx,
                frameColor: this.config.modules.crop.frameColor,
                outsideOverlayColor: this.config.modules.crop.outsideOverlayColor,
                requestRedraw: () => this._redraw(),
                getCurrentImage: () => this.currentImage,
                onCropApplied: (newImageDataUrl: string) => this._handleCropApplied(newImageDataUrl),
            });

            this.modules.set(ModuleName.CROP, cropModule);
        }

        // Initialize all registered modules
        this.modules.forEach((module) => module.init());
        console.log(this.modules);

        // Set the Resize module as active by default
        this._setActiveModule(this.DEFAULT_MODULE);
    }

    /**
     * Resets the canvas to display the given image, scaled to fit the container.
     * @param {HTMLImageElement} image - The image to display.
     * @internal
     */
    private _resetCanvasView(image: HTMLImageElement): void {
        this.currentImage = image;

        const containerWidth = this.dom.elements.container.clientWidth;
        const containerHeight = this.dom.elements.container.clientHeight;
        const scale = Math.min(containerWidth / image.width, containerHeight / image.height);

        const drawW = image.width * scale;
        const drawH = image.height * scale;

        this.canvas.width = drawW;
        this.canvas.height = drawH;

        this._redraw();

        if (this.dom.resizeElements) {
            this.dom.resizeElements.widthInput.value = Math.round(drawW).toString();
            this.dom.resizeElements.heightInput.value = Math.round(drawH).toString();
        }
    }

    /**
     * Sets which module is currently active, deactivating all others.
     * If the same module is activated again (and it's not the default), it toggles it off,
     * returning to the default module.
     * @param {ModuleName | null} moduleName - The name of the module to activate, or null to deactivate all.
     * @internal
     */
    private _setActiveModule(moduleName: ModuleName | null): void {
        let newActiveModuleName = moduleName;

        // If we try to activate a module that is already active (and it's not the default module),
        // we switch back to the default module. This creates a 'toggle' effect.
        if (this.activeModuleName === moduleName && moduleName !== this.DEFAULT_MODULE) {
            newActiveModuleName = this.DEFAULT_MODULE;
        }

        //  If the state doesn't change, do nothing.
        if (this.activeModuleName === newActiveModuleName) {
            return;
        }

        this.activeModuleName = newActiveModuleName;

        this.modules.forEach((module, name) => {
            if (name === this.activeModuleName) {
                module.activate();
            } else {
                module.deactivate();
            }
        });
        this._redraw();
    }

    // --- Event Handlers & Callbacks ---

    /**
     * Handles the file input change event to load, validate, and display an image.
     * @param {Event} event - The file input change event.
     * @internal
     */
    private _loadImage(event: Event): void {
        // If no file input element is available, do nothing
        try {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) {
                return;
            }

            validateFile(file, this.config.maxFileSizeMB || 5);

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        this.currentImage = img;
                        this.initialImage = img;

                        this._resetCanvasView(img);
                    } catch (error) {
                        this.errorHandler.handle(error as Error);
                    }
                };
                img.onerror = () => {
                    this.errorHandler.handle(createImageLoadError("Error reading image file."));
                };
                img.src = e.target!.result as string;
            };
            reader.onerror = () => {
                this.errorHandler.handle(createImageLoadError("Error reading file with FileReader."));
            };
            reader.readAsDataURL(file);
        } catch (error) {
            this.errorHandler.handle(error as Error);
        }
    }

    /**
     * Callback for the CropModule after a crop is applied. Updates the current image with the cropped version.
     * @param {string} newImageDataUrl - The data URL of the newly cropped image.
     * @internal
     */
    private _handleCropApplied(newImageDataUrl: string): void {
        const newImg = new Image();
        newImg.onload = () => {
            this.currentImage = newImg;

            this._setActiveModule(this.DEFAULT_MODULE);

            this._resetCanvasView(newImg);
        };
        newImg.src = newImageDataUrl;
    }

    // --- Module Management ---

    /**
     * Clears the canvas, redraws the base image, and then draws the overlay for the currently active module.
     * @internal
     */
    private _redraw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.currentImage) {
            return;
        }
        this.ctx.drawImage(this.currentImage, 0, 0, this.currentImage.width, this.currentImage.height, 0, 0, this.canvas.width, this.canvas.height);

        if (this.activeModuleName) {
            const activeModule = this.modules.get(this.activeModuleName);
            // The 'drawOverlay' method is optional, so we check for its existence before calling.
            activeModule?.drawOverlay?.();
        }
    }
}
