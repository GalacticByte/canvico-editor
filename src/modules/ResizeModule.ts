import { ErrorHandler } from "./../utils/error-handler.js";
import type { ResizeDOMElements } from "../utils/dom-manager.js";
import { CanvasState } from "../state/CanvasState.js";
import { BaseModule } from "./BaseModule.js";

/**
 * Configuration options for the ResizeModule.
 */
export interface ResizeModuleOptions {
    state: CanvasState;
    errorHandler: ErrorHandler;
}

/**
 * A module responsible for handling output image dimensions based on user input.
 * The editor computes preview canvas size separately from this module.
 */
export class ResizeModule extends BaseModule {
    // --- PROPERTIES ---

    private readonly widthInput: HTMLInputElement;
    private readonly heightInput: HTMLInputElement;
    private readonly lockAspectRatio?: HTMLInputElement;

    private readonly state: CanvasState;

    private readonly errorHandler: ErrorHandler;
    private isActive = false;

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

        this.state = options.state;
        this.errorHandler = options.errorHandler;
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

        const img = this.state.getCurrent();
        if (!img) {
            return;
        }

        const resizeState = this.state.getResizeState();
        const currentWidth = resizeState.width > 0 ? resizeState.width : img.width;
        const currentHeight = resizeState.height > 0 ? resizeState.height : img.height;

        this.widthInput.value = currentWidth.toString();
        this.heightInput.value = currentHeight.toString();
        if (this.lockAspectRatio) {
            this.lockAspectRatio.checked = resizeState.lockAspectRatio;
        }
    }

    /**
     * Deactivates the resize functionality.
     */
    public deactivate(): void {
        this.isActive = false;
    }

    /**
     * Central function to read inputs, calculate dimensions, and update output state.
     * @param changedDim - The dimension ('width' or 'height') that initiated the change. If undefined, it's assumed the change came from the aspect ratio toggle.
     */
    private _updateCanvasAndInputs(changedDim?: "width" | "height"): void {
        try {
            if (!this.isActive) return;

            const img = this.state.getCurrent();
            if (!img) {
                return;
            }

            let w = Number.parseInt(this.widthInput.value, 10) || 0;
            let h = Number.parseInt(this.heightInput.value, 10) || 0;

            if (this.lockAspectRatio?.checked) {
                // Keep ratio in output/document space based on the current image dimensions.
                // Preview canvas size may differ because it is fit to the container.
                const ratio = img.width / img.height;

                // If an input is being changed while the lock is on, that input is the source of truth.
                if (changedDim === "width") {
                    h = w > 0 ? Math.round(w / ratio) : 0;
                    this.heightInput.value = h.toString();
                } else if (changedDim === "height") {
                    w = h > 0 ? Math.round(h * ratio) : 0;
                    this.widthInput.value = w.toString();
                } else {
                    // This block is for when the checkbox is just checked.
                    // We check if the current dimensions are proportional. If not, we enforce the ratio.
                    // We use the current width as the source of truth and recalculate the height,
                    // as requested in the user scenario.
                    const currentRatio = h > 0 ? w / h : 0;
                    // Using a small tolerance for floating point comparisons
                    if (Math.abs(currentRatio - ratio) > 0.01) {
                        h = w > 0 ? Math.round(w / ratio) : 0;
                        this.heightInput.value = h.toString();
                    }
                }
            }

            if (w <= 0 || h <= 0) {
                return;
            }

            this.state.setResizeState({ width: w, height: h, lockAspectRatio: !!this.lockAspectRatio?.checked });
        } catch (error) {
            this.errorHandler.handle(error, { source: "resize", operation: "update-canvas-and-inputs" });
        }
    }
}
