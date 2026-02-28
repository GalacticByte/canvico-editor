export type ResizeState = {
    width: number;
    height: number;
    lockAspectRatio: boolean;
};

export type TransformState = {
    rotate: number;
    flipH: boolean;
    flipV: boolean;
};

export type CropHandle = "nw" | "ne" | "sw" | "se" | "rect" | null;

export type CropRect = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export type CropState = {
    active: boolean;
    rect: CropRect;
};

export type EditorMode = "edit" | "crop";

export type CanvasStateChange = "image" | "resize" | "transform" | "crop" | "mode" | "clear";

export type CanvasAction =
    | { type: "mode/set"; mode: EditorMode }
    | { type: "image/setInitial"; image: HTMLImageElement }
    | { type: "image/setCurrent"; image: HTMLImageElement }
    | { type: "image/resetToInitial" }
    | { type: "editor/clear" }
    | { type: "resize/patch"; patch: Partial<ResizeState> }
    | { type: "transform/patch"; patch: Partial<TransformState> }
    | { type: "crop/patch"; patch: Partial<CropState> };

export type EditorSnapshot = {
    initialImage?: HTMLImageElement;
    currentImage?: HTMLImageElement;
    mode: EditorMode;
    resizeState: ResizeState;
    transformState: TransformState;
    cropState: CropState;
};

export function createInitialEditorSnapshot(): EditorSnapshot {
    return {
        initialImage: undefined,
        currentImage: undefined,
        mode: "edit",
        resizeState: createDefaultResizeState(),
        transformState: createDefaultTransformState(),
        cropState: createDefaultCropState(),
    };
}

export function reduceEditorState(snapshot: EditorSnapshot, action: CanvasAction): { snapshot: EditorSnapshot; change: CanvasStateChange | null } {
    switch (action.type) {
        case "mode/set":
            if (snapshot.mode === action.mode) {
                return { snapshot, change: null };
            }
            return {
                snapshot: { ...snapshot, mode: action.mode },
                change: "mode",
            };

        case "image/setInitial":
            return {
                snapshot: {
                    ...snapshot,
                    initialImage: action.image,
                    currentImage: action.image,
                    mode: "edit",
                    resizeState: createDefaultResizeState(action.image.width, action.image.height),
                    transformState: createDefaultTransformState(),
                    cropState: createDefaultCropState(),
                },
                change: "image",
            };

        case "image/setCurrent":
            if (snapshot.currentImage === action.image) {
                return { snapshot, change: null };
            }
            return {
                snapshot: {
                    ...snapshot,
                    currentImage: action.image,
                },
                change: "image",
            };

        case "image/resetToInitial":
            if (!snapshot.initialImage) {
                return { snapshot, change: null };
            }
            return {
                snapshot: {
                    ...snapshot,
                    currentImage: snapshot.initialImage,
                    mode: "edit",
                    resizeState: createDefaultResizeState(snapshot.initialImage.width, snapshot.initialImage.height),
                    transformState: createDefaultTransformState(),
                    cropState: createDefaultCropState(),
                },
                change: "image",
            };

        case "editor/clear":
            return {
                snapshot: createInitialEditorSnapshot(),
                change: "clear",
            };

        case "resize/patch":
            if (!canApplyResizePatch(snapshot)) {
                return { snapshot, change: null };
            }
            return applyResizePatch(snapshot, action.patch);

        case "transform/patch":
            if (!canApplyTransformPatch(snapshot)) {
                return { snapshot, change: null };
            }
            return applyTransformPatch(snapshot, action.patch);

        case "crop/patch":
            if (!canApplyCropPatch(snapshot, action.patch)) {
                return { snapshot, change: null };
            }
            return applyCropPatch(snapshot, action.patch);
    }
}

function canApplyResizePatch(snapshot: EditorSnapshot): boolean {
    return snapshot.mode !== "crop";
}

function canApplyTransformPatch(snapshot: EditorSnapshot): boolean {
    return snapshot.mode !== "crop";
}

function canApplyCropPatch(snapshot: EditorSnapshot, patch: Partial<CropState>): boolean {
    if (snapshot.mode === "crop") {
        return true;
    }

    return patch.active === false;
}

function applyResizePatch(snapshot: EditorSnapshot, patch: Partial<ResizeState>): { snapshot: EditorSnapshot; change: CanvasStateChange | null } {
    const nextResize = { ...snapshot.resizeState, ...patch };
    if (isResizeStateEqual(nextResize, snapshot.resizeState)) {
        return { snapshot, change: null };
    }
    return {
        snapshot: { ...snapshot, resizeState: nextResize },
        change: "resize",
    };
}

function applyTransformPatch(snapshot: EditorSnapshot, patch: Partial<TransformState>): { snapshot: EditorSnapshot; change: CanvasStateChange | null } {
    const nextTransform = { ...snapshot.transformState, ...patch };
    if (isTransformStateEqual(nextTransform, snapshot.transformState)) {
        return { snapshot, change: null };
    }
    return {
        snapshot: { ...snapshot, transformState: nextTransform },
        change: "transform",
    };
}

function applyCropPatch(snapshot: EditorSnapshot, patch: Partial<CropState>): { snapshot: EditorSnapshot; change: CanvasStateChange | null } {
    const nextCrop = { ...snapshot.cropState, ...patch };
    if (isCropStateEqual(nextCrop, snapshot.cropState)) {
        return { snapshot, change: null };
    }
    return {
        snapshot: { ...snapshot, cropState: nextCrop },
        change: "crop",
    };
}

function isResizeStateEqual(a: ResizeState, b: ResizeState): boolean {
    return a.width === b.width && a.height === b.height && a.lockAspectRatio === b.lockAspectRatio;
}

function isTransformStateEqual(a: TransformState, b: TransformState): boolean {
    return a.rotate === b.rotate && a.flipH === b.flipH && a.flipV === b.flipV;
}

function isCropStateEqual(a: CropState, b: CropState): boolean {
    return (
        a.active === b.active &&
        a.rect.x === b.rect.x &&
        a.rect.y === b.rect.y &&
        a.rect.w === b.rect.w &&
        a.rect.h === b.rect.h
    );
}

function createDefaultResizeState(width: number = 0, height: number = 0): ResizeState {
    return {
        width,
        height,
        lockAspectRatio: false,
    };
}

function createDefaultTransformState(): TransformState {
    return {
        rotate: 0,
        flipH: false,
        flipV: false,
    };
}

function createDefaultCropState(): CropState {
    return {
        active: false,
        rect: { x: 0, y: 0, w: 0, h: 0 },
    };
}
