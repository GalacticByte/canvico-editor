import type { CropDOMElements } from "../utils/dom-manager.js";
import { CanvasState, CropHandle, CropRect } from "../state/CanvasState.js";
import { BaseModule } from "./BaseModule.js";

// --- TYPE DEFINITIONS ---

/**
 * Configuration options for the CropModule.
 */
export interface CropModuleOptions {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    state: CanvasState;
    onCropApplied: () => void;
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
 * A module for cropping images on the canvas. It provides a draggable and resizable
 * rectangle to define the crop area.
 */

export class CropModule extends BaseModule {
    // --- PROPERTIES ---

    /** Core Dependencies */
    private readonly canvas: HTMLCanvasElement;

    private readonly ctx: CanvasRenderingContext2D;

    private readonly applyButton: HTMLElement;

    private readonly state: CanvasState;

    private readonly onCropAppliedCallback: () => void;

    // Configuration
    private readonly frameColor: string;
    private readonly outsideOverlayColor: string;

    private readonly HANDLE_SIZE = 8;
    private readonly MIN_CROP_SIZE = this.HANDLE_SIZE * 2;

    private isLocalActive = false;
    private dragging = false;
    private dragOffsetX = 0;
    private dragOffsetY = 0;
    private activeHandle: CropHandle = null;
    private shiftPressed = false;
    private lastMouseX = 0;
    private lastMouseY = 0;
    private previousTouchAction = "";

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

        this.state = options.state;
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
        this.addEventListener(this.canvas, "mousedown", this._onMouseDown);
        this.addEventListener(this.canvas, "mousemove", this._onMouseMove);
        this.addEventListener(globalThis, "mouseup", this._onMouseUp);
        this.addEventListener(globalThis, "keydown", this._onKeyDown);
        this.addEventListener(globalThis, "keyup", this._onKeyUp);
        this.addEventListener(this.canvas, "touchstart", this._onTouchStart, { passive: false });
        this.addEventListener(this.canvas, "touchmove", this._onTouchMove, { passive: false });
        this.addEventListener(globalThis, "touchend", this._onTouchEnd, { passive: false });
        this.addEventListener(globalThis, "touchcancel", this._onTouchCancel, { passive: false });
    }

    /**
     * Cleans up resources and event listeners.
     */
    public destroy(): void {
        this.deactivate(); // Reset crop state before final listener cleanup
        super.destroy();
    }

    // --- PUBLIC API & STATE MANAGEMENT ---

    /**
     * Activates the crop module, making it ready for user interaction.
     */
    public activate(): void {
        this._enableCropMode();
    }

    /**
     * Deactivates the crop module.
     */
    public deactivate(): void {
        this._disableCropMode();
    }

    /**
     * Enables crop mode.
     * This initializes the crop rectangle to a default size.
     */
    private _enableCropMode(): void {
        // Prevent double activation which causes event listener leaks and crashes
        if (this.isLocalActive || !this.state.getCurrent()) {
            return;
        }
        this.isLocalActive = true;
        this.dragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.activeHandle = null;
        this.shiftPressed = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.previousTouchAction = this.canvas.style.touchAction;
        this.canvas.style.touchAction = "none";

        // Always reset crop rectangle to fit the CURRENT canvas size (with a small margin).
        // We do not restore previous rects because the image might have been transformed (rotated/resized).
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        // Use 60% of the smaller dimension to ensure it fits safely and is a square
        const size = Math.min(cw, ch) * 0.6;

        this.state.setCropState({
            active: true,
            rect: { x: (cw - size) / 2, y: (ch - size) / 2, w: size, h: size },
        });
    }

    /**
     * Disables crop mode.
     * This resets the module's state.
     */
    private _disableCropMode(): void {
        if (!this.isLocalActive && !this.state.getCropState().active) return;

        this.isLocalActive = false;
        this.dragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.activeHandle = null;
        this.shiftPressed = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.canvas.style.touchAction = this.previousTouchAction;
        const rect = this._getCropRect();
        this.state.setCropState({ active: false, rect: { ...rect } });

        // Restore default cursor
        this.canvas.style.cursor = "default";
    }

    // --- EVENT HANDLERS ---

    /**
     * Handles the keydown event, specifically for the Shift key to toggle aspect ratio lock.
     * @internal
     */
    private readonly _onKeyDown = (e: KeyboardEvent): void => {
        if (!this.state.getCropState().active) {
            return;
        }
        if (e.key === "Shift") {
            this.shiftPressed = true;
            // Recalculate current drag with square constraint.
            if (this.dragging) {
                this._handleDrag(this.lastMouseX, this.lastMouseY);
            }
        }
    };

    /**
     * Handles the keyup event, specifically for the Shift key to toggle aspect ratio lock.
     * @param e - The keyboard event.
     */
    private readonly _onKeyUp = (e: KeyboardEvent): void => {
        if (e.key === "Shift" && this.state.getCropState().active) {
            this.shiftPressed = false;
            // Recalculate current drag without square constraint.
            if (this.dragging) {
                this._handleDrag(this.lastMouseX, this.lastMouseY);
            }
        }
    };

    /**
     * Handles the mousedown event to initiate dragging or resizing of the crop rectangle.
     * @param event - The mouse event.
     */
    private readonly _onMouseDown = (event: MouseEvent): void => {
        const cropState = this.state.getCropState();
        if (!cropState.active) return;

        const mx = event.offsetX;
        const my = event.offsetY;

        const activeHandle = this._detectHandle(mx, my);

        // Start dragging if a handle or the rectangle itself is clicked
        if (activeHandle) {
            const rect = this._getCropRect();
            this.dragging = true;
            this.activeHandle = activeHandle;
            this.dragOffsetX = activeHandle === "rect" ? mx - rect.x : 0;
            this.dragOffsetY = activeHandle === "rect" ? my - rect.y : 0;
        }
    };

    /**
     * Handles the mousemove event to update the crop rectangle during drag/resize and to update the cursor style.
     * @param event - The mouse event.
     */
    private readonly _onMouseMove = (event: MouseEvent): void => {
        const cropState = this.state.getCropState();
        if (!cropState.active) {
            return;
        }
        this.lastMouseX = event.offsetX;
        this.lastMouseY = event.offsetY;

        // If not dragging, just update the cursor based on position
        if (!this.dragging || !this.activeHandle) {
            const handle = this._detectHandle(event.offsetX, event.offsetY);
            this._updateCursor(handle);
            return;
        }
        // If dragging, handle the drag/resize logic
        this._handleDrag(this.lastMouseX, this.lastMouseY);
    };

    /**
     * Handles the mouseup event to finalize the drag/resize operation and normalize the crop rectangle.
     */
    private readonly _onMouseUp = (): void => {
        const cropState = this.state.getCropState();
        if (!cropState.active || !this.dragging) {
            return;
        }
        this.dragging = false;
        this.activeHandle = null;

        this._normalizeCropRect();
    };

    private readonly _onTouchStart = (event: TouchEvent): void => {
        const cropState = this.state.getCropState();
        if (!cropState.active) {
            return;
        }

        const point = this._getTouchPoint(event);
        if (!point) {
            return;
        }
        event.preventDefault();

        const activeHandle = this._detectHandle(point.x, point.y);
        if (activeHandle) {
            const rect = this._getCropRect();
            this.dragging = true;
            this.activeHandle = activeHandle;
            this.dragOffsetX = activeHandle === "rect" ? point.x - rect.x : 0;
            this.dragOffsetY = activeHandle === "rect" ? point.y - rect.y : 0;
            this.lastMouseX = point.x;
            this.lastMouseY = point.y;
        }
    };

    private readonly _onTouchMove = (event: TouchEvent): void => {
        const cropState = this.state.getCropState();
        if (!cropState.active) {
            return;
        }

        const point = this._getTouchPoint(event);
        if (!point) {
            return;
        }
        event.preventDefault();

        this.lastMouseX = point.x;
        this.lastMouseY = point.y;

        if (!this.dragging || !this.activeHandle) {
            return;
        }
        this._handleDrag(this.lastMouseX, this.lastMouseY);
    };

    private readonly _onTouchEnd = (event: TouchEvent): void => {
        const cropState = this.state.getCropState();
        if (!cropState.active || !this.dragging) {
            return;
        }
        event.preventDefault();
        this.dragging = false;
        this.activeHandle = null;

        this._normalizeCropRect();
    };

    private readonly _onTouchCancel = (event: TouchEvent): void => {
        const cropState = this.state.getCropState();
        if (!cropState.active || !this.dragging) {
            return;
        }
        event.preventDefault();
        this.dragging = false;
        this.activeHandle = null;

        this._normalizeCropRect();
    };

    // --- PRIVATE LOGIC ---

    /**
     * Handles the dragging logic for resizing and moving the crop rectangle.
     * @param mx - The current mouse X position.
     * @param my - The current mouse Y position.
     */
    private _handleDrag(mx: number, my: number): void {
        if (!this.activeHandle) {
            return;
        }
        const nextRect = this.activeHandle === "rect"
            ? this._moveRect(this._getCropRect(), mx, my, this.dragOffsetX, this.dragOffsetY)
            : this._resizeRect(this._getCropRect(), mx, my, this.activeHandle as Handle, this.shiftPressed);

        this._setCropRect(nextRect);
    }

    /**
     * Normalizes the crop rectangle after a drag/resize operation.
     * Ensures width and height are positive and clamps the rectangle to canvas boundaries.
     */
    private _normalizeCropRect(): void {
        const cropRect = { ...this._getCropRect() };
        const canvasWidth = Math.max(1, this.canvas.width);
        const canvasHeight = Math.max(1, this.canvas.height);
        const minWidth = Math.min(this.MIN_CROP_SIZE, canvasWidth);
        const minHeight = Math.min(this.MIN_CROP_SIZE, canvasHeight);
        const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

        // Ensure width and height are positive
        if (cropRect.w < 0) {
            cropRect.x += cropRect.w;
            cropRect.w = Math.abs(cropRect.w);
        }
        if (cropRect.h < 0) {
            cropRect.y += cropRect.h;
            cropRect.h = Math.abs(cropRect.h);
        }

        // Clamp position first so minimum size can still be enforced near canvas edges.
        cropRect.x = clamp(cropRect.x, 0, canvasWidth - minWidth);
        cropRect.y = clamp(cropRect.y, 0, canvasHeight - minHeight);

        // Then clamp dimensions to [min, available-space].
        const maxWidth = canvasWidth - cropRect.x;
        const maxHeight = canvasHeight - cropRect.y;
        cropRect.w = clamp(cropRect.w, minWidth, maxWidth);
        cropRect.h = clamp(cropRect.h, minHeight, maxHeight);

        this._setCropRect(cropRect);
    }

    /**
     * Applies the crop and provides the new image data URL to the callback.
     */
    private readonly _applyCrop = (): void => {
        const rect = this._getCropRect();
        if (!this.state.getCropState().active || rect.w === 0 || rect.h === 0) {
            this.deactivate();
            return;
        }

        // Notify the editor to apply the crop based on the current state
        this.onCropAppliedCallback();
    };

    // --- DRAWING & HELPER METHODS ---

    /**
     * Draws the crop overlay, including the semi-transparent mask, border, and handles.
     */
    public drawOverlay(): void {
        if (!this.state.getCropState().active) {
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
    private _detectHandle(mx: number, my: number): CropHandle {
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
    private _getVisualRect(): CropRect {
        const { x, y, w, h } = this._getCropRect();
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
    private _updateCursor(handle: CropHandle): void {
        if (handle === "rect") {
            this.canvas.style.cursor = "move";
        } else if (handle) {
            this.canvas.style.cursor = "crosshair";
        } else {
            this.canvas.style.cursor = "default";
        }
    }

    private _getCropRect(): CropRect {
        return this.state.getCropState().rect;
    }

    private _setCropRect(rect: CropRect): void {
        this.state.setCropState({ rect });
    }

    private _getTouchPoint(event: TouchEvent): { x: number; y: number } | null {
        const touch = event.touches[0] || event.changedTouches[0];
        if (!touch) {
            return null;
        }

        const bounds = this.canvas.getBoundingClientRect();
        if (bounds.width <= 0 || bounds.height <= 0) {
            return null;
        }

        const scaleX = this.canvas.width / bounds.width;
        const scaleY = this.canvas.height / bounds.height;
        return {
            x: (touch.clientX - bounds.left) * scaleX,
            y: (touch.clientY - bounds.top) * scaleY,
        };
    }

    private _moveRect(rect: CropRect, mx: number, my: number, dragOffsetX: number, dragOffsetY: number): CropRect {
        return {
            ...rect,
            x: mx - dragOffsetX,
            y: my - dragOffsetY,
        };
    }

    private _resizeRect(rect: CropRect, mx: number, my: number, handle: Handle, keepSquare: boolean): CropRect {
        let { x, y, w, h } = rect;

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

        return keepSquare ? this._asSquareRect(x, y, w, h) : { x, y, w, h };
    }

    private _asSquareRect(x: number, y: number, w: number, h: number): CropRect {
        const absW = Math.abs(w);
        const absH = Math.abs(h);
        const signW = w < 0 ? -1 : 1;
        const signH = h < 0 ? -1 : 1;

        if (absW > absH) {
            h = signH * absW;
        } else {
            w = signW * absH;
        }

        return { x, y, w, h };
    }
}
