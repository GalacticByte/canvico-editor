import type { CanvicoEditorErrorCallback, CanvicoEditorErrorReport, CanvicoEditorErrorSource } from "../types.js";

export type ErrorHandlerContext = {
    source: CanvicoEditorErrorSource;
    operation?: string;
};

export type ErrorHandlerOptions = {
    onError?: CanvicoEditorErrorCallback;
    logToConsole?: boolean;
};

const DEFAULT_ERROR_CONTEXT: ErrorHandlerContext = { source: "editor" };

/**
 * Centralized error handling for the editor runtime.
 * It can report errors to host application and optionally to the browser console.
 */
export class ErrorHandler {
    private readonly onError?: CanvicoEditorErrorCallback;
    private readonly logToConsole: boolean;

    constructor(options?: ErrorHandlerOptions) {
        this.onError = options?.onError;
        this.logToConsole = options?.logToConsole ?? true;
    }

    /**
     * Handles an error and reports it using configured channels.
     * Returns a normalized `Error` instance for callers that need it.
     */
    public handle(errorLike: unknown, context?: ErrorHandlerContext): Error {
        const resolvedContext = context ?? DEFAULT_ERROR_CONTEXT;
        const error = this._normalizeError(errorLike);
        const report: CanvicoEditorErrorReport = {
            error,
            source: resolvedContext.source,
            operation: resolvedContext.operation,
            timestamp: new Date(),
        };

        if (this.logToConsole) {
            const operationLabel = resolvedContext.operation ? `:${resolvedContext.operation}` : "";
            console.error(`[CanvicoEditor][${resolvedContext.source}${operationLabel}]`, error);
        }

        if (this.onError) {
            try {
                this.onError(report);
            } catch (callbackError) {
                if (this.logToConsole) {
                    console.error("[CanvicoEditor][error-handler:onError-callback]", callbackError);
                }
            }
        }

        return error;
    }

    private _normalizeError(errorLike: unknown): Error {
        if (errorLike instanceof Error) {
            return errorLike;
        }

        const message = typeof errorLike === "string" ? errorLike : "Unknown error";
        return new Error(message);
    }
}
