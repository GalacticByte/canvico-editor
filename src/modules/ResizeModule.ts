import { ErrorHandler } from "./../utils/error-handler.js";
import type { ResizeDOMElements } from "../utils/dom-manager.js";
import { BaseModule } from "./BaseModule.js";

/**
 * Configuration options for the ResizeModule.
 */
export interface ResizeModuleOptions {
    container: HTMLElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    getCurrentImage: () => HTMLImageElement | undefined;
    onRequestRedraw?: () => void;
    onCanvasResized?: (scaleX: number, scaleY: number) => void;
}

/**
 * A module responsible for handling image and canvas resizing based on user input.
 * It maintains aspect ratio if requested and ensures the canvas fits within its container.
 */
export class ResizeModule extends BaseModule {
    // --- PROPERTIES ---

    private widthInput: HTMLInputElement;
    private heightInput: HTMLInputElement;
    private lockAspectRatio?: HTMLInputElement;

    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private getCurrentImage: () => HTMLImageElement | undefined;
    private onRequestRedraw?: () => void;
    private onCanvasResized?: (scaleX: number, scaleY: number) => void;

    private errorHandler: ErrorHandler;
    private isActive: boolean = false;

    /**
     * Creates an instance of the ResizeModule.
     * @param elements - The DOM elements used by the module.
     * @param options - Configuration and dependencies for the module.
     */
    constructor(elements: ResizeDOMElements, options: ResizeModuleOptions) {
        super("resize");
        this.widthInput = elements.widthInput;
        this.heightInput = elements.heightInput;
        this.lockAspectRatio = elements.lockAspectRatio;

        this.container = options.container;
        this.canvas = options.canvas;
        this.ctx = options.ctx;
        this.getCurrentImage = options.getCurrentImage;
        this.onRequestRedraw = options.onRequestRedraw;
        this.onCanvasResized = options.onCanvasResized;

        this.errorHandler = new ErrorHandler();
    }

    /**
     * Initializes the module by attaching event listeners to the input elements.
     */
    public init(): void {
        this.addEventListener(this.widthInput, "input", () => this._updateCanvasAndInputs("width"));
        this.addEventListener(this.heightInput, "input", () => this._updateCanvasAndInputs("height"));
        if (this.lockAspectRatio) {
            this.addEventListener(this.lockAspectRatio, "change", () => this._updateCanvasAndInputs());
        }
    }

    /**
     * Activates the resize functionality.
     */
    public activate(): void {
        this.isActive = true;
    }

    /**
     * Deactivates the resize functionality.
     */
    public deactivate(): void {
        this.isActive = false;
    }

    /**
     * Central function to read inputs, calculate dimensions, and update the canvas.
     * @param changedDim - The dimension ('width' or 'height') that initiated the change. If undefined, it's assumed the change came from the aspect ratio toggle.
     */
    private _updateCanvasAndInputs(changedDim?: "width" | "height"): void {
        try {
            if (!this.isActive) return;

            const img = this.getCurrentImage();
            if (!img) {
                return;
            }

            let w = parseInt(this.widthInput.value, 10) || 0;
            let h = parseInt(this.heightInput.value, 10) || 0;

            if (this.lockAspectRatio?.checked) {
                const ratio = img.width / img.height;

                /**
                 * If not specified which dimension changed (e.g., from the aspect ratio toggle),
                 * default to width as the source of truth.
                 */
                const sourceDim = changedDim || "width";

                if (sourceDim === "width") {
                    h = w > 0 ? Math.round(w / ratio) : 0;
                    this.heightInput.value = h.toString();
                } else {
                    // sourceDim === "height"
                    w = h > 0 ? Math.round(h * ratio) : 0;
                    this.widthInput.value = w.toString();
                }
            }

            if (w <= 0 || h <= 0) {
                return;
            }

            this._redrawCanvas(img, w, h);
        } catch (error) {
            this.errorHandler.handle(error as Error);
        }
    }

    /**
     * Handles the actual resizing and redrawing of the canvas.
     * @param img - The image to be redrawn.
     * @param newWidth - The target width for the image.
     * @param newHeight - The target height for the image.
     */
    private _redrawCanvas(img: HTMLImageElement, newWidth: number, newHeight: number): void {
        const oldCanvasWidth = this.canvas.width;
        const oldCanvasHeight = this.canvas.height;

        // Calculate the scale to fit the canvas to the container
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;
        const scaleToFitContainer = Math.min(containerWidth / newWidth, containerHeight / newHeight, 1);

        const finalCanvasWidth = newWidth * scaleToFitContainer;
        const finalCanvasHeight = newHeight * scaleToFitContainer;

        // Set the new canvas size
        this.canvas.width = finalCanvasWidth;
        this.canvas.height = finalCanvasHeight;

        // Notify other modules about the resize
        if (oldCanvasWidth > 0 && oldCanvasHeight > 0 && this.onCanvasResized) {
            const actualScaleX = finalCanvasWidth / oldCanvasWidth;
            const actualScaleY = finalCanvasHeight / oldCanvasHeight;
            this.onCanvasResized(actualScaleX, actualScaleY);
        }

        // Clear and redraw the image at the new size
        this.ctx.clearRect(0, 0, finalCanvasWidth, finalCanvasHeight);
        this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, finalCanvasWidth, finalCanvasHeight);

        // Request a redraw of overlays (e.g., crop handles, text)
        this.onRequestRedraw?.();
    }
}
