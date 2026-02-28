import type { CanvicoEditorConfig, IModule } from "./types.js";
import { ErrorHandler } from "./utils/error-handler.js";
import { DOMManager } from "./utils/dom-manager.js";
import { validateFile, createCanvasContextError, createImageLoadError, createImageSaveError, createFeatureNotSupportedError } from "./utils/validation.js";
import { CanvasState, type CanvasStateChange, type CropRect } from "./state/CanvasState.js";

// Modules
import { ResizeModule } from "./modules/ResizeModule.js";
import { CropModule } from "./modules/CropModule.js";
import { TransformModule } from "./modules/TransformModule.js";

enum ModuleName {
    RESIZE = "resize",
    CROP = "crop",
    TRANSFORM = "transform",
}

export class CanvicoEditor {
    /** Manages all DOM element interactions and selections. */
    private readonly dom: DOMManager;

    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    /** Central shared document state. */
    private readonly state: CanvasState = new CanvasState();

    /** A map holding all registered and initialized modules. */
    private readonly modules: Map<string, IModule> = new Map();
    private resizeModule?: ResizeModule;
    private cropModule?: CropModule;
    private transformModule?: TransformModule;

    /** Handles and logs errors that occur within the editor. */
    private readonly errorHandler: ErrorHandler;

    /** The configuration options passed to the editor upon instantiation. */
    private readonly config: CanvicoEditorConfig;

    private readonly DEFAULT_MODULE: ModuleName | null = null;
    private activeModuleName: ModuleName | null = null;
    private renderScheduled = false;
    private cleanupCallbacks: Array<() => void> = [];
    private isDestroyed = false;
    private asyncOperationVersion = 0;

    /**
     * Creates an instance of CanvasImageEditor.
     * @param config - The configuration object for the editor.
     * @throws {Error} If a required feature like FileReader is not supported by the browser.
     */
    constructor(config: CanvicoEditorConfig) {
        this.config = config;
        this.errorHandler = new ErrorHandler({
            onError: config.onError,
            logToConsole: config.logErrorsToConsole,
        });

        if (!globalThis.FileReader) {
            const error = createFeatureNotSupportedError("FileReader API is not supported by this browser.");
            this.errorHandler.handle(error, { source: "validation", operation: "constructor:file-reader-check" });
            throw error;
        }

        this.dom = new DOMManager(config, this.errorHandler);
        [this.canvas, this.ctx] = this._initializeCanvas();
        this._registerModules();
        this._bindGlobalEvents();

        const unsubscribe = this.state.subscribe((change) => this._onStateChange(change));
        this.cleanupCallbacks.push(unsubscribe);
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
        if (this.isDestroyed) {
            return;
        }
        this.isDestroyed = true;
        this._cancelPendingAsyncOperations();

        this._setActiveModule(null, false, true);

        this.cleanupCallbacks.forEach((cleanup) => cleanup());
        this.cleanupCallbacks = [];

        this.modules.forEach((module) => module.destroy());
        this.modules.clear();
    }

    /**
     * Resets the current image to its original state, discarding all changes.
     */
    private _resetImage(): void {
        if (!this.state.getInitial()) {
            return;
        }
        this.state.resetToInitial();
        this._setActiveModule(this.DEFAULT_MODULE, false, true);
    }

    /**
     * Clears the canvas and resets the entire editor state, including loaded images and module states.
     */
    private _cleanAll(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.width = 0;
        this.canvas.height = 0;

        this.state.clear();

        if (this.dom.resizeElements) {
            this.dom.resizeElements.widthInput.value = "";
            this.dom.resizeElements.heightInput.value = "";
            if (this.dom.resizeElements.lockAspectRatio) {
                this.dom.resizeElements.lockAspectRatio.checked = false;
            }
        }

        this.dom.elements.imageFileInput.value = "";
        this._setActiveModule(null, false, true);
    }

    /**
     * Triggers a download of the current canvas content as a PNG image.
     */
    private _saveImage(): void {
        if (!this.state.getCurrent()) {
            this.errorHandler.handle(createImageSaveError(), { source: "editor", operation: "save-image:no-image" });
            return;
        }

        const exportDataUrl = this._exportCurrentViewDataUrl();
        if (!exportDataUrl) {
            this.errorHandler.handle(createImageSaveError(), { source: "editor", operation: "save-image:export-failed" });
            return;
        }

        const link = document.createElement("a");
        const originalFile = this.dom.elements.imageFileInput.files?.[0];
        const baseName = originalFile ? originalFile.name.replace(/\.[^/.]+$/, "") : "image";
        link.download = `${baseName}-edited.png`;
        link.href = exportDataUrl;
        link.click();
    }

    // --- Initialization Methods ---

    /**
     * Binds event listeners to the main control elements like file input, save, and reset buttons.
     */
    private _bindGlobalEvents(): void {
        this._addManagedListener(this.dom.elements.imageFileInput, "change", (e: Event) => this._loadImage(e));
        this._addManagedListener(this.dom.elements.resetEditsButton, "click", () => this._resetImage());
        this._addManagedListener(this.dom.elements.clearCanvasButton, "click", () => this._cleanAll());
        this._addManagedListener(this.dom.elements.saveButton, "click", () => this._saveImage());
    }

    // --- Core Drawing & State Logic ---

    /**
     * Initializes and registers all available modules based on the provided options.
     */
    private _registerModules(): void {
        if (this.dom.resizeElements) {
            const resizeModule = new ResizeModule(this.dom.resizeElements, {
                state: this.state,
                errorHandler: this.errorHandler,
            });
            this.modules.set(ModuleName.RESIZE, resizeModule);
            this.resizeModule = resizeModule;
        }

        if (this.dom.cropElements && this.config.modules?.crop) {
            const cropModule = new CropModule(this.dom.cropElements, {
                canvas: this.canvas,
                ctx: this.ctx,
                frameColor: this.config.modules.crop.frameColor,
                outsideOverlayColor: this.config.modules.crop.outsideOverlayColor,
                state: this.state,
                onCropApplied: () => this._handleCropApplied(),
            });

            this.modules.set(ModuleName.CROP, cropModule);
            this.cropModule = cropModule;

            this._addManagedListener(this.dom.cropElements.activateButton, "click", () => this._enterCropMode());
        }

        if (this.dom.transformElements) {
            const transformModule = new TransformModule(this.dom.transformElements, {
                state: this.state,
            });
            this.modules.set(ModuleName.TRANSFORM, transformModule);
            this.transformModule = transformModule;
        }

        this.modules.forEach((module) => module.init());
        this._setActiveModule(this.DEFAULT_MODULE, false, true);
    }

    private _addManagedListener(target: EventTarget, type: string, handler: EventListenerOrEventListenerObject): void {
        target.addEventListener(type, handler);
        this.cleanupCallbacks.push(() => target.removeEventListener(type, handler));
    }

    private _getOutputDimensions(img: HTMLImageElement): { width: number; height: number } {
        const resizeState = this.state.getResizeState();
        const width = resizeState.width > 0 ? resizeState.width : img.width;
        const height = resizeState.height > 0 ? resizeState.height : img.height;

        return {
            width: Math.max(1, Math.round(width)),
            height: Math.max(1, Math.round(height)),
        };
    }

    private _getPreviewDimensions(outputWidth: number, outputHeight: number): { width: number; height: number } {
        const containerWidth = Math.max(this.dom.elements.container.clientWidth, 1);
        const containerHeight = Math.max(this.dom.elements.container.clientHeight, 1);
        const scale = Math.min(containerWidth / outputWidth, containerHeight / outputHeight, 1);

        return {
            width: Math.max(1, Math.round(outputWidth * scale)),
            height: Math.max(1, Math.round(outputHeight * scale)),
        };
    }

    /**
     * Resets the canvas to display the given image, scaled to fit the container.
     * This should ONLY be called when loading a new image or explicitly resetting the view.
     */
    private _resetCanvasView(image: HTMLImageElement): void {
        const { width: outputWidth, height: outputHeight } = this._getOutputDimensions(image);
        const { width: previewWidth, height: previewHeight } = this._getPreviewDimensions(outputWidth, outputHeight);

        this.canvas.width = previewWidth;
        this.canvas.height = previewHeight;

        if (this.dom.resizeElements) {
            this.dom.resizeElements.widthInput.value = outputWidth.toString();
            this.dom.resizeElements.heightInput.value = outputHeight.toString();
        }

        this._requestRender();
    }

    /**
     * Sets which module is currently active.
     * Crop mode disables interactions with the remaining modules until exited or applied.
     */
    private _setActiveModule(moduleName: ModuleName | null, shouldToggle: boolean = true, force: boolean = false): void {
        let newActiveModuleName = moduleName;

        if (shouldToggle && this.activeModuleName === moduleName && moduleName !== this.DEFAULT_MODULE) {
            newActiveModuleName = this.DEFAULT_MODULE;
        }

        if (!force && this.activeModuleName === newActiveModuleName) {
            return;
        }

        this.activeModuleName = newActiveModuleName;
        const hasImage = Boolean(this.state.getCurrent());

        if (this.activeModuleName === ModuleName.CROP && hasImage) {
            this.state.setMode("crop");
            this.resizeModule?.deactivate();
            this.transformModule?.deactivate();
            this.cropModule?.activate();
            this._toggleNonCropInteractions(false);
        } else {
            this.state.setMode("edit");
            this.cropModule?.deactivate();
            this._toggleNonCropInteractions(true);

            if (hasImage) {
                this.resizeModule?.activate();
                this.transformModule?.activate();
            } else {
                this.resizeModule?.deactivate();
                this.transformModule?.deactivate();
            }
        }

        this._requestRender();
    }

    /**
     * Disables or enables UI elements for Resize and Transform modules.
     */
    private _toggleNonCropInteractions(enable: boolean): void {
        const disabled = !enable;

        if (this.dom.resizeElements) {
            this.dom.resizeElements.widthInput.disabled = disabled;
            this.dom.resizeElements.heightInput.disabled = disabled;
            if (this.dom.resizeElements.lockAspectRatio) {
                this.dom.resizeElements.lockAspectRatio.disabled = disabled;
            }
        }

        if (this.dom.transformElements) {
            const t = this.dom.transformElements;
            if (t.rotateInput) t.rotateInput.disabled = disabled;
            if (t.flipHorizontalButton) t.flipHorizontalButton.disabled = disabled;
            if (t.flipVerticalButton) t.flipVerticalButton.disabled = disabled;
        }

        this.dom.elements.clearCanvasButton.disabled = disabled;
        this.dom.elements.resetEditsButton.disabled = disabled;
    }

    // --- Event Handlers & Callbacks ---

    /**
     * Handles the file input change event to load, validate, and display an image.
     */
    private _loadImage(event: Event): void {
        if (this.isDestroyed) {
            return;
        }

        try {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) {
                return;
            }

            validateFile(file, this.config.maxFileSizeMB || 5);

            const operationVersion = this._beginAsyncOperation();
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!this._isAsyncOperationActive(operationVersion)) {
                    return;
                }

                const result = e.target?.result;
                if (typeof result !== "string") {
                    this.errorHandler.handle(createImageLoadError("Unexpected image format from FileReader."), {
                        source: "editor",
                        operation: "load-image:reader-result",
                    });
                    return;
                }

                const img = new Image();
                img.onload = () => {
                    if (!this._isAsyncOperationActive(operationVersion)) {
                        return;
                    }

                    try {
                        this.state.setInitial(img);
                        this._setActiveModule(this.DEFAULT_MODULE, false, true);
                    } catch (error) {
                        this.errorHandler.handle(error, { source: "state", operation: "load-image:set-initial" });
                    }
                };
                img.onerror = () => {
                    if (!this._isAsyncOperationActive(operationVersion)) {
                        return;
                    }
                    this.errorHandler.handle(createImageLoadError("Error reading image file."), { source: "editor", operation: "load-image:image-read" });
                };
                img.src = result;
            };
            reader.onerror = () => {
                if (!this._isAsyncOperationActive(operationVersion)) {
                    return;
                }
                this.errorHandler.handle(createImageLoadError("Error reading file with FileReader."), { source: "editor", operation: "load-image:file-reader" });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            this.errorHandler.handle(error, { source: "validation", operation: "load-image:validate-file" });
        }
    }

    /**
     * Callback for the CropModule after a crop is applied.
     */
    private _handleCropApplied(): void {
        const dataUrl = this._bakeCrop();
        if (dataUrl) {
            void this._applyCropAndExit(dataUrl);
        }
    }

    private async _applyCropAndExit(newImageDataUrl: string): Promise<void> {
        try {
            await this._applyImageDataUrl(newImageDataUrl);
        } catch (error) {
            if (!this._isAbortError(error)) {
                this.errorHandler.handle(error, { source: "editor", operation: "apply-crop:apply-image" });
            }
            return;
        }

        if (this.isDestroyed) {
            return;
        }

        this._setActiveModule(this.DEFAULT_MODULE, false, true);
        const croppedImage = this.state.getCurrent();
        if (croppedImage) {
            const { lockAspectRatio } = this.state.getResizeState();
            this.state.setResizeState({
                width: croppedImage.width,
                height: croppedImage.height,
                lockAspectRatio,
            });
        }
        this.state.setTransformState({ rotate: 0, flipH: false, flipV: false });
        this.transformModule?.activate();
    }

    private _applyImageDataUrl(dataUrl: string): Promise<void> {
        const operationVersion = this._beginAsyncOperation();

        return new Promise((resolve, reject) => {
            const newImg = new Image();
            newImg.onload = () => {
                if (!this._isAsyncOperationActive(operationVersion)) {
                    reject(this._createAbortError("Image apply operation was canceled."));
                    return;
                }
                this.state.setCurrent(newImg);
                resolve();
            };
            newImg.onerror = () => {
                if (!this._isAsyncOperationActive(operationVersion)) {
                    reject(this._createAbortError("Image apply operation was canceled."));
                    return;
                }
                reject(createImageLoadError("Error applying image data to canvas."));
            };
            newImg.src = dataUrl;
        });
    }

    private _onStateChange(change: CanvasStateChange): void {
        if (change === "clear") {
            this.transformModule?.syncControlsWithState();
            this._requestRender();
            return;
        }

        const img = this.state.getCurrent();
        if (!img) {
            this.transformModule?.syncControlsWithState();
            this._requestRender();
            return;
        }

        if (change === "image" || change === "resize") {
            if (change === "image") {
                this.transformModule?.syncControlsWithState();
            }
            this._resetCanvasView(img);
            return;
        }

        this._requestRender();
    }

    private _enterCropMode(): void {
        if (!this.state.getCurrent()) {
            return;
        }
        this._setActiveModule(ModuleName.CROP);
    }

    // --- Module Management ---

    private _requestRender(): void {
        if (this.isDestroyed) {
            return;
        }

        if (this.renderScheduled) {
            return;
        }

        this.renderScheduled = true;
        globalThis.requestAnimationFrame(() => {
            this.renderScheduled = false;
            if (this.isDestroyed) {
                return;
            }
            this._redraw();
        });
    }

    /**
     * Clears the canvas, redraws the base image, and then draws the overlay for the currently active module.
     */
    private _redraw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const img = this.state.getCurrent();
        if (!img) {
            return;
        }

        this._drawImageLayer(this.ctx, img, this.canvas.width, this.canvas.height);

        if (this.activeModuleName === ModuleName.CROP) {
            this.cropModule?.drawOverlay?.();
        }
    }

    private _drawImageLayer(targetCtx: CanvasRenderingContext2D, img: HTMLImageElement, targetWidth: number, targetHeight: number): void {
        const transformState = this.state.getTransformState();
        const cx = targetWidth / 2;
        const cy = targetHeight / 2;

        targetCtx.save();
        targetCtx.translate(cx, cy);
        targetCtx.rotate((transformState.rotate * Math.PI) / 180);
        targetCtx.scale(transformState.flipH ? -1 : 1, transformState.flipV ? -1 : 1);
        targetCtx.drawImage(img, -cx, -cy, targetWidth, targetHeight);
        targetCtx.restore();
    }

    private _exportCurrentViewDataUrl(): string | null {
        const img = this.state.getCurrent();
        if (!img) return null;
        const { width: outputWidth, height: outputHeight } = this._getOutputDimensions(img);

        const offscreen = document.createElement("canvas");
        offscreen.width = outputWidth;
        offscreen.height = outputHeight;
        const offscreenCtx = offscreen.getContext("2d");
        if (!offscreenCtx) return null;

        this._drawImageLayer(offscreenCtx, img, offscreen.width, offscreen.height);
        return offscreen.toDataURL("image/png");
    }

    /**
     * Creates a new image based on the current crop state.
     * Crop rectangle is defined in preview space and remapped to output space.
     */
    private _bakeCrop(): string | null {
        const img = this.state.getCurrent();
        const cropState = this.state.getCropState();
        if (!img || !cropState.active) return null;

        const rect = this._normalizeRect(cropState.rect);
        const previewWidth = this.canvas.width;
        const previewHeight = this.canvas.height;
        if (previewWidth <= 0 || previewHeight <= 0) return null;

        const { width: outputWidth, height: outputHeight } = this._getOutputDimensions(img);
        const scaleX = outputWidth / previewWidth;
        const scaleY = outputHeight / previewHeight;

        const sx = Math.max(0, Math.floor(rect.x * scaleX));
        const sy = Math.max(0, Math.floor(rect.y * scaleY));
        const maxW = outputWidth - sx;
        const maxH = outputHeight - sy;
        const sw = Math.min(Math.floor(rect.w * scaleX), Math.floor(maxW));
        const sh = Math.min(Math.floor(rect.h * scaleY), Math.floor(maxH));

        if (sw <= 0 || sh <= 0) return null;

        const transformedCanvas = document.createElement("canvas");
        transformedCanvas.width = outputWidth;
        transformedCanvas.height = outputHeight;
        const transformedCtx = transformedCanvas.getContext("2d");
        if (!transformedCtx) return null;
        this._drawImageLayer(transformedCtx, img, transformedCanvas.width, transformedCanvas.height);

        const offscreen = document.createElement("canvas");
        offscreen.width = sw;
        offscreen.height = sh;
        const offscreenCtx = offscreen.getContext("2d");
        if (!offscreenCtx) return null;

        offscreenCtx.drawImage(transformedCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
        return offscreen.toDataURL("image/png");
    }

    private _normalizeRect(rect: CropRect): CropRect {
        return {
            x: rect.w >= 0 ? rect.x : rect.x + rect.w,
            y: rect.h >= 0 ? rect.y : rect.y + rect.h,
            w: Math.abs(rect.w),
            h: Math.abs(rect.h),
        };
    }

    private _beginAsyncOperation(): number {
        this.asyncOperationVersion += 1;
        return this.asyncOperationVersion;
    }

    private _cancelPendingAsyncOperations(): void {
        this.asyncOperationVersion += 1;
    }

    private _isAsyncOperationActive(operationVersion: number): boolean {
        return !this.isDestroyed && operationVersion === this.asyncOperationVersion;
    }

    private _createAbortError(message: string): Error {
        const error = new Error(message);
        error.name = "AbortError";
        return error;
    }

    private _isAbortError(error: unknown): boolean {
        return error instanceof Error && error.name === "AbortError";
    }
}
