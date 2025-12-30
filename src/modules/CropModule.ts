import type { CropDOMElements } from "../utils/dom-manager.js";
import { BaseModule } from "./BaseModule.js";

// --- TYPE DEFINITIONS ---

/**
 * Configuration options for the CropModule.
 */
export interface CropModuleOptions {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    getCurrentImage: () => HTMLImageElement | undefined;
    requestRedraw?: () => void;
    onCropApplied: (newImageDataUrl: string) => void;
    frameColor?: string;
    outsideOverlayColor?: string;
}

/**
 * Enum representing the four resize handles of the crop rectangle.
 */

enum Handle {
    NW = "nw",
    NE = "ne",
    SW = "sw",
    SE = "se",
}

/**
 * Represents a rectangle with position (x, y) and dimensions (w, h).
 */

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * A module for cropping images on the canvas. It provides a draggable and resizable
 * rectangle to define the crop area.
 */

export class CropModule extends BaseModule {
    // --- PROPERTIES ---

    /** Core Dependencies */
    private canvas: HTMLCanvasElement;

    private ctx: CanvasRenderingContext2D;

    private applyButton: HTMLElement;

    private getCurrentImage: () => HTMLImageElement | undefined;

    private requestRedraw?: () => void;

    private onCropAppliedCallback: (newImageDataUrl: string) => void;

    // Configuration
    private frameColor: string;
    private outsideOverlayColor: string;

    private readonly HANDLE_SIZE = 8;
    private readonly MIN_CROP_SIZE = this.HANDLE_SIZE * 2;

    // State

    private cropMode = false;

    private cropRect: Rect = { x: 0, y: 0, w: 0, h: 0 };

    private dragging = false;
    private dragOffsetX = 0;
    private dragOffsetY = 0;
    /** The handle currently being dragged, or "rect" for the whole rectangle. */
    private activeHandle: Handle | "rect" | null = null;
    private shiftPressed = false;
    private lastMouseX = 0;
    private lastMouseY = 0;

    // --- CONSTRUCTOR & LIFECYCLE METHODS ---

    /**
     * Creates an instance of the CropModule.
     * @param elements - The DOM elements used by the module.
     * @param options - The options for configuring the crop module.
     */
    constructor(elements: CropDOMElements, options: CropModuleOptions) {
        super("crop");
        this.canvas = options.canvas;
        this.ctx = options.ctx;

        this.getCurrentImage = options.getCurrentImage;
        this.requestRedraw = options.requestRedraw;
        this.onCropAppliedCallback = options.onCropApplied;

        this.applyButton = elements.applyButton;
        this.frameColor = options.frameColor || "red";
        this.outsideOverlayColor = options.outsideOverlayColor || "rgba(0, 0, 0, 0.2)";
    }

    /**
     * Initializes the module by attaching event listeners.
     */
    public init(): void {
        this.addEventListener(this.applyButton, "click", this._applyCrop);
    }

    /**
     * Cleans up resources and event listeners.
     */
    public destroy(): void {
        this.deactivate(); // Ensure all listeners are removed
        super.destroy();
    }

    // --- PUBLIC API & STATE MANAGEMENT ---

    /**
     * Activates the crop module, making it ready for user interaction.
     */
    public activate(): void {
        this.enableCropMode();
    }

    /**
     * Deactivates the crop module.
     */
    public deactivate(): void {
        this.disableCropMode();
    }

    /**
     * Checks if the crop mode is currently active.
     * @returns True if crop mode is active, false otherwise.
     */
    public isCropModeActive(): boolean {
        return this.cropMode;
    }

    /**
     * Enables crop mode.
     * This initializes the crop rectangle to a default size and adds all necessary event listeners for interaction.
     * Enables crop mode, initializing the crop rectangle and adding event listeners.
     */
    public enableCropMode(): void {
        if (!this.getCurrentImage() || this.cropMode) {
            return;
        }

        this.cropMode = true;

        // Initialize crop rectangle: centered, half of canvas size
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        this.cropRect = { x: cw / 4, y: ch / 4, w: cw / 2, h: ch / 2 };
        this.shiftPressed = false;

        // Add event listeners
        this.canvas.addEventListener("mousedown", this._onMouseDown);
        this.canvas.addEventListener("mousemove", this._onMouseMove);
        window.addEventListener("mouseup", this._onMouseUp);
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);

        this.requestRedraw?.();
    }

    /**
     * Disables crop mode.
     * This resets the module's state and removes all event listeners related to cropping.
     * Disables crop mode, resetting state and removing event listeners.
     */
    public disableCropMode(): void {
        if (!this.cropMode) return;

        this.cropMode = false;
        this.dragging = false;
        this.activeHandle = null;

        // Remove event listeners
        this.canvas.removeEventListener("mousedown", this._onMouseDown);
        this.canvas.removeEventListener("mousemove", this._onMouseMove);
        window.removeEventListener("mouseup", this._onMouseUp);
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);

        // Restore default cursor
        this.canvas.style.cursor = "default";

        this.requestRedraw?.();
    }

    // --- EVENT HANDLERS ---

    /**
     * Handles the keydown event, specifically for the Shift key to toggle aspect ratio lock.
     * @internal
     */
    public onKeyDown = (e: KeyboardEvent): void => {
        if (e.key === "Shift") {
            this.shiftPressed = true;
            // Redraw with aspect ratio constraint if currently dragging
            if (this.dragging) {
                this._handleDrag(this.lastMouseX, this.lastMouseY);
            }
        }
    };

    /**
     * Handles the keyup event, specifically for the Shift key to toggle aspect ratio lock.
     * @param e - The keyboard event.
     */
    private _onKeyUp = (e: KeyboardEvent): void => {
        if (e.key === "Shift" && this.cropMode) {
            this.shiftPressed = false;
            // Redraw without aspect ratio constraint if currently dragging
            if (this.dragging) {
                this._handleDrag(this.lastMouseX, this.lastMouseY);
            }
        }
    };

    /**
     * Handles the mousedown event to initiate dragging or resizing of the crop rectangle.
     * @param event - The mouse event.
     */
    private _onMouseDown = (event: MouseEvent): void => {
        if (!this.cropMode) return;

        const mx = event.offsetX;
        const my = event.offsetY;

        this.activeHandle = this._detectHandle(mx, my);

        // Start dragging if a handle or the rectangle itself is clicked
        if (this.activeHandle) {
            this.dragging = true;
            if (this.activeHandle === "rect") {
                this.dragOffsetX = mx - this.cropRect.x;
                this.dragOffsetY = my - this.cropRect.y;
            }
        }
    };

    /**
     * Handles the mousemove event to update the crop rectangle during drag/resize and to update the cursor style.
     * @param event - The mouse event.
     */
    private _onMouseMove = (event: MouseEvent): void => {
        this.lastMouseX = event.offsetX;
        this.lastMouseY = event.offsetY;

        // If not dragging, just update the cursor based on position
        if (!this.cropMode || !this.dragging || !this.activeHandle) {
            if (this.cropMode) {
                const handle = this._detectHandle(event.offsetX, event.offsetY);
                this._updateCursor(handle);
            }
            return;
        }
        // If dragging, handle the drag/resize logic
        this._handleDrag(this.lastMouseX, this.lastMouseY);
    };

    /**
     * Handles the mouseup event to finalize the drag/resize operation and normalize the crop rectangle.
     */
    private _onMouseUp = (): void => {
        if (!this.cropMode || !this.dragging) {
            return;
        }
        this.dragging = false;
        this.activeHandle = null;

        this._normalizeCropRect();

        this.requestRedraw?.();
    };

    // --- PRIVATE LOGIC ---

    /**
     * Handles the dragging logic for resizing and moving the crop rectangle.
     * @param mx - The current mouse X position.
     * @param my - The current mouse Y position.
     */
    private _handleDrag(mx: number, my: number): void {
        let { x, y, w, h } = this.cropRect;

        if (this.activeHandle === "rect") {
            x = mx - this.dragOffsetX;
            y = my - this.dragOffsetY;
        } else {
            const handle = this.activeHandle;
            switch (handle) {
                case Handle.NW:
                    w += x - mx;
                    h += y - my;
                    x = mx;
                    y = my;
                    break;
                case Handle.NE:
                    w = mx - x;
                    h += y - my;
                    y = my;
                    break;
                case Handle.SW:
                    w += x - mx;
                    h = my - y;
                    x = mx;
                    break;
                case Handle.SE:
                    w = mx - x;
                    h = my - y;
                    break;
            }

            if (this.shiftPressed) {
                const absW = Math.abs(w);
                const absH = Math.abs(h);
                const signW = w < 0 ? -1 : 1;
                const signH = h < 0 ? -1 : 1;

                if (absW > absH) {
                    h = signH * absW;
                } else {
                    w = signW * absH;
                }
            }
        }

        this.cropRect = { x, y, w, h };
        this.requestRedraw?.();
    }

    /**
     * Normalizes the crop rectangle after a drag/resize operation.
     * Ensures width and height are positive and clamps the rectangle to canvas boundaries.
     */
    private _normalizeCropRect(): void {
        // Ensure width and height are positive
        if (this.cropRect.w < 0) {
            this.cropRect.x += this.cropRect.w;
            this.cropRect.w = Math.abs(this.cropRect.w);
        }
        if (this.cropRect.h < 0) {
            this.cropRect.y += this.cropRect.h;
            this.cropRect.h = Math.abs(this.cropRect.h);
        }

        // Enforce minimum size
        if (this.cropRect.w < this.MIN_CROP_SIZE) this.cropRect.w = this.MIN_CROP_SIZE;
        if (this.cropRect.h < this.MIN_CROP_SIZE) this.cropRect.h = this.MIN_CROP_SIZE;

        // Clamp to canvas boundaries
        this.cropRect.x = Math.max(0, this.cropRect.x);
        this.cropRect.y = Math.max(0, this.cropRect.y);
        if (this.cropRect.x + this.cropRect.w > this.canvas.width) {
            this.cropRect.w = this.canvas.width - this.cropRect.x;
        }
        if (this.cropRect.y + this.cropRect.h > this.canvas.height) {
            this.cropRect.h = this.canvas.height - this.cropRect.y;
        }
    }

    /**
     * Applies the crop and provides the new image data URL to the callback.
     */
    private _applyCrop = (): void => {
        const img = this.getCurrentImage();
        if (!img || !this.cropMode || this.cropRect.w === 0 || this.cropRect.h === 0) {
            this.deactivate();
            return;
        }

        // Use a normalized rectangle for cropping
        const { x, y, w, h } = this._getVisualRect();

        // Map canvas coordinates to the original image's coordinates.
        // This is crucial if the displayed image is scaled to fit the canvas.
        const scaleX = img.naturalWidth / this.canvas.width;
        const scaleY = img.naturalHeight / this.canvas.height;

        const sx = x * scaleX;
        const sy = y * scaleY;
        const sw = w * scaleX;
        const sh = h * scaleY;

        if (sw <= 0 || sh <= 0) {
            console.error("Crop dimensions are invalid for applying crop.");
            this.deactivate();
            return;
        }

        // Create an off-screen canvas to draw the cropped image
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = sw;
        offscreenCanvas.height = sh;
        const offCtx = offscreenCanvas.getContext("2d");

        if (!offCtx) {
            console.error("Failed to get 2D context for offscreen canvas");
            return;
        }

        // Draw the cropped portion of the original image onto the off-screen canvas
        offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

        // Pass the new image data URL to the callback
        this.onCropAppliedCallback(offscreenCanvas.toDataURL());

        // The main application will handle deactivating the module after the new image is loaded.
    };

    // --- DRAWING & HELPER METHODS ---

    /**
     * Draws the crop overlay, including the semi-transparent mask, border, and handles.
     */
    public drawOverlay(): void {
        if (!this.cropMode) {
            return;
        }

        const { x, y, w, h } = this._getVisualRect();

        this.ctx.save();

        // Draw the dimmed background using the "evenodd" rule
        this.ctx.fillStyle = this.outsideOverlayColor;
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.canvas.width, this.canvas.height); // Entire area
        this.ctx.rect(x, y, w, h); // Cutout (crop)
        this.ctx.fill("evenodd"); // Fill with cutout

        // Draw the crop rectangle border
        this.ctx.strokeStyle = this.frameColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, w, h);

        // Draw the handles
        this.ctx.fillStyle = this.frameColor;
        for (const handle of Object.values(Handle)) {
            const { x: hx, y: hy } = this._getVisualHandleCoord(handle);
            this.ctx.fillRect(hx - this.HANDLE_SIZE / 2, hy - this.HANDLE_SIZE / 2, this.HANDLE_SIZE, this.HANDLE_SIZE);
        }

        this.ctx.restore();
    }

    /**
     * Detects if the mouse is over a handle or the crop rectangle itself.
     * @param mx - The mouse X position.
     * @param my - The mouse Y position.
     * @returns The active handle, "rect" if inside the rectangle, otherwise null.
     */
    private _detectHandle(mx: number, my: number): Handle | "rect" | null {
        // Check handles first
        for (const handle of Object.values(Handle)) {
            const { x, y } = this._getVisualHandleCoord(handle);
            if (Math.abs(mx - x) <= this.HANDLE_SIZE && Math.abs(my - y) <= this.HANDLE_SIZE) {
                return handle;
            }
        }

        // Then check if inside the rectangle (but not on a handle)
        const { x, y, w, h } = this._getVisualRect();
        if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
            return "rect";
        }

        return null;
    }

    /**
     * Gets the visual representation of the crop rectangle, ensuring positive width and height.
     * @returns A rectangle with positive dimensions for drawing and hit detection.
     */
    private _getVisualRect(): Rect {
        const { x, y, w, h } = this.cropRect;
        return {
            x: w > 0 ? x : x + w,
            y: h > 0 ? y : y + h,
            w: Math.abs(w),
            h: Math.abs(h),
        };
    }

    /**
     * Calculates the visual coordinates of a specific resize handle.
     * @param handle - The handle to get coordinates for.
     * @returns The visual coordinates of the handle.
     */
    private _getVisualHandleCoord(handle: Handle): { x: number; y: number } {
        const { x, y, w, h } = this._getVisualRect();

        switch (handle) {
            case Handle.NW:
                return { x, y };
            case Handle.NE:
                return { x: x + w, y };
            case Handle.SW:
                return { x, y: y + h };
            case Handle.SE:
                return { x: x + w, y: y + h };
        }
    }

    /**
     * Updates the canvas cursor style based on the handle being hovered over.
     * @param handle - The handle currently under the cursor.
     */
    private _updateCursor(handle: Handle | "rect" | null): void {
        if (handle === "rect") {
            this.canvas.style.cursor = "move";
        } else if (handle) {
            this.canvas.style.cursor = "crosshair";
        } else {
            this.canvas.style.cursor = "default";
        }
    }
}
