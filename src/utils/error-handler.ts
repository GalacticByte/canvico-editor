/**
 * A centralized class for handling errors that occur within the application.
 * By default, it logs errors to the console, but it can be extended
 * in the future to support other reporting mechanisms (e.g., sending to a logging service).
 */
export class ErrorHandler {
    /**
     * Handles an error by logging it to the console.
     * This is the central place for logging errors for developers.
     * @param error - The error object to handle, which should include a message and preferably a stack trace.
     */
    public handle(error: Error): void {
        // We log the entire error object to provide the most detail in the console.
        console.error(error);
    }
}
