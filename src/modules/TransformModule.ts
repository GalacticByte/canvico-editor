import type { TransformDOMElements } from "../utils/dom-manager.js";
import { CanvasState } from "../state/CanvasState.js";
import { BaseModule } from "./BaseModule.js";

/**
 * Configuration options for the TransformModule.
 */
export interface TransformModuleOptions {
    state: CanvasState;
}

/**
 * A module for applying geometric transforms (rotate, flip)
 * to the current image.
 */
export class TransformModule extends BaseModule {
    private readonly rotateInput?: HTMLInputElement;
    private readonly flipHorizontalButton?: HTMLButtonElement;
    private readonly flipVerticalButton?: HTMLButtonElement;

    private readonly state: CanvasState;
    private isActive = false;

    constructor(elements: TransformDOMElements, options: TransformModuleOptions) {
        super("transform");

        this.state = options.state;
        this.rotateInput = elements.rotateInput;
        this.flipHorizontalButton = elements.flipHorizontalButton;
        this.flipVerticalButton = elements.flipVerticalButton;
    }

    public init(): void {
        // Rotate
        if (this.rotateInput) {
            this.addEventListener(this.rotateInput, "input", () => {
                if (!this.isActive) return;
                this.state.setTransformState({ rotate: this._readNumber(this.rotateInput!) });
            });
        }

        // Flip Horizontal
        if (this.flipHorizontalButton) {
            this.addEventListener(this.flipHorizontalButton, "click", () => {
                if (!this.isActive) return;
                const current = this.state.getTransformState();
                this.state.setTransformState({ flipH: !current.flipH });
            });
        }

        // Flip Vertical
        if (this.flipVerticalButton) {
            this.addEventListener(this.flipVerticalButton, "click", () => {
                if (!this.isActive) return;
                const current = this.state.getTransformState();
                this.state.setTransformState({ flipV: !current.flipV });
            });
        }
    }

    /**
     * Activates the module. Captures the current image as the base for transformations.
     */
    public activate(): void {
        this.isActive = true;
        this._syncControlsWithState();
    }

    /**
     * Deactivates the module.
     */
    public deactivate(): void {
        this.isActive = false;
    }

    /**
     * Synchronizes transform controls with the current store state.
     * Useful when state changes happen outside direct module interactions.
     */
    public syncControlsWithState(): void {
        this._syncControlsWithState();
    }

    private _readNumber(input: HTMLInputElement): number {
        const value = Number.parseFloat(input.value);
        return Number.isFinite(value) ? value : 0;
    }

    private _syncControlsWithState(): void {
        const current = this.state.getTransformState();
        if (this.rotateInput) this.rotateInput.value = current.rotate.toString();
    }
}
