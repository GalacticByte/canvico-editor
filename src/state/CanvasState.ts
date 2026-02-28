import { createInitialEditorSnapshot, reduceEditorState } from "./EditorReducer.js";
import type {
    CanvasAction,
    CanvasStateChange,
    CropRect,
    CropState,
    EditorMode,
    EditorSnapshot,
    ResizeState,
    TransformState,
} from "./EditorReducer.js";

export type { CanvasAction, CanvasStateChange, CropHandle, CropRect, CropState, EditorMode, EditorSnapshot, ResizeState, TransformState } from "./EditorReducer.js";
export type ReadonlyResizeState = Readonly<ResizeState>;
export type ReadonlyTransformState = Readonly<TransformState>;
export type ReadonlyCropRect = Readonly<CropRect>;
export type ReadonlyCropState = Readonly<Omit<CropState, "rect">> & { readonly rect: ReadonlyCropRect };

/**
 * Store wrapper around the pure reducer.
 * It keeps listeners and exposes compatibility methods for modules.
 */
export class CanvasState {
    private snapshot: EditorSnapshot = createInitialEditorSnapshot();
    private listeners: Array<(change: CanvasStateChange) => void> = [];

    public getInitial(): HTMLImageElement | undefined {
        return this.snapshot.initialImage;
    }

    public getCurrent(): HTMLImageElement | undefined {
        return this.snapshot.currentImage;
    }

    public getMode(): EditorMode {
        return this.snapshot.mode;
    }

    public getResizeState(): ReadonlyResizeState {
        return { ...this.snapshot.resizeState };
    }

    public getTransformState(): ReadonlyTransformState {
        return { ...this.snapshot.transformState };
    }

    public getCropState(): ReadonlyCropState {
        const cropState = this.snapshot.cropState;
        return {
            ...cropState,
            rect: { ...cropState.rect },
        };
    }

    public dispatch(action: CanvasAction): void {
        const result = reduceEditorState(this.snapshot, action);
        if (!result.change) {
            return;
        }
        this.snapshot = result.snapshot;
        this._notifyListeners(result.change);
    }

    public setMode(mode: EditorMode): void {
        this.dispatch({ type: "mode/set", mode });
    }

    public setInitial(img: HTMLImageElement): void {
        this.dispatch({ type: "image/setInitial", image: img });
    }

    public setCurrent(img: HTMLImageElement): void {
        this.dispatch({ type: "image/setCurrent", image: img });
    }

    public resetToInitial(): void {
        this.dispatch({ type: "image/resetToInitial" });
    }

    public clear(): void {
        this.dispatch({ type: "editor/clear" });
    }

    public setResizeState(state: Partial<ResizeState>): void {
        this.dispatch({ type: "resize/patch", patch: state });
    }

    public setTransformState(state: Partial<TransformState>): void {
        this.dispatch({ type: "transform/patch", patch: state });
    }

    public setCropState(state: Partial<CropState>): void {
        this.dispatch({ type: "crop/patch", patch: state });
    }

    public subscribe(listener: (change: CanvasStateChange) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((registered) => registered !== listener);
        };
    }

    private _notifyListeners(change: CanvasStateChange): void {
        this.listeners.forEach((listener) => listener(change));
    }
}
