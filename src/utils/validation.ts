const PREFIX = "CanvicoEditor:";

function createEditorError(name: string, message: string): Error {
    const error = new Error(`${PREFIX} ${message}`);
    error.name = name;
    return error;
}

// --- ERROR FACTORY FUNCTIONS ---

/**
 * Creates a standardized error for when a required DOM element is not found.
 * * @param selector - The CSS selector that failed to find an element.
 * @returns {Error} A new Error object with a descriptive message.
 */
export function createDOMElementNotFoundError(selector: string): Error {
    return createEditorError("CanvicoDOMElementNotFoundError", `Required DOM element not found for selector: "${selector}".`);
}

/**
 * Creates a standardized error for when the main input element is not of `type="file"`.
 * @param {string} selector - The CSS selector used to find the input element.
 * @returns {Error} A new Error object with a descriptive message.
 */
export function createInvalidInputTypeError(selector: string): Error {
    return createEditorError("CanvicoInvalidInputTypeError", `Element for selector "${selector}" is not an <input type="file">.`);
}

/**
 * Creates a standardized error for file validation issues (e.g., wrong type, size).
 * @param {string} message - The specific reason why the file is invalid.
 * @returns {Error} A new Error object with a descriptive message.
 */
export function createInvalidFileError(message: string): Error {
    return createEditorError("CanvicoInvalidFileError", `Invalid file: ${message}`);
}

/**
 * Creates a standardized error for when an image fails to load from a file.
 * @param {string} [details="File could not be read"] - Specific details about the loading error.
 * @returns {Error} A new Error object with a descriptive message.
 */
export function createImageLoadError(details: string = "File could not be read"): Error {
    return createEditorError("CanvicoImageLoadError", `Image load error: ${details}`);
}

/**
 * Creates a standardized error for when the canvas 2D rendering context cannot be obtained.
 * @returns {Error} A new Error object with a descriptive message.
 */
export function createCanvasContextError(): Error {
    return createEditorError("CanvicoCanvasContextError", "2D context is not supported by the browser.");
}

/**
 * Creates a standardized error for when a save operation is attempted with no image loaded.
 * @returns {Error} A new Error object with a descriptive message.
 */
export function createImageSaveError(): Error {
    return createEditorError("CanvicoImageSaveError", "Cannot save because no image is loaded.");
}

/**
 * Creates a standardized error for when a required browser feature is not supported.
 * @param {string} featureName - The name of the required feature (e.g., 'FileReader').
 * @returns {Error} A new Error object with a descriptive message.
 */
export function createFeatureNotSupportedError(featureName: string): Error {
    return createEditorError("CanvicoFeatureNotSupportedError", `Required browser feature not supported: ${featureName}.`);
}

// --- VALIDATION FUNCTIONS ---

/**
 * Validates if the selected file is a supported image and within the size limit.
 * @param {File} file - The file to validate.
 * @param {number} maxFileSizeMB - The maximum allowed file size in megabytes.
 * @throws {Error} If the file type is unsupported or the file size exceeds the limit.
 */
export function validateFile(file: File, maxFileSizeMB: number): void {
    const maxFileSizeInBytes = maxFileSizeMB * 1024 * 1024;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
        throw createInvalidFileError(`Unsupported file type. Supported types are: ${validTypes.join(", ")}.`);
    }

    if (file.size > maxFileSizeInBytes) {
        throw createInvalidFileError(`File is too large. Maximum size is ${maxFileSizeMB}MB.`);
    }
}
