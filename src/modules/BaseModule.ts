import type { IModule, ModuleEventHandler } from "../types.js";

/**
 * Base class for all editor modules. It provides a centralized way to manage
 * event listeners, ensuring they are properly cleaned up when a module is destroyed.
 */
export abstract class BaseModule implements IModule {
    /** The unique name of the module (e.g., 'crop', 'resize'). */
    private readonly name: string;
    /**
     * Stores all registered event listeners for this module.
     * Each entry contains the element, event type, and the handler function,
     * allowing for easy removal in the `destroy` method.
     */
    protected eventHandlers: Array<{
        element: HTMLElement;
        type: string;
        handler: ModuleEventHandler;
    }> = [];

    /**
     * @param name - The unique name for the module.
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Initializes the module. Each module must implement this method
     * to register its necessary event listeners using the `addEventListener` helper.
     */
    public abstract init(): void;

    /**
     * Activates the module, enabling its specific functionality.
     * Each module must implement this method.
     */
    public abstract activate(): void;

    /**
     * Deactivates the module, disabling its functionality and cleaning up its active state.
     * Each module must implement this method.
     */
    public abstract deactivate(): void;

    /**
     * Returns the unique name of the module.
     * @returns The name of the module.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Cleans up all resources used by the module.
     * This method iterates over all registered event listeners and removes them.
     */
    public destroy(): void {
        this.eventHandlers.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.eventHandlers = [];
    }

    /**
     * A helper method to attach an event listener to an element and track it for later removal.
     * @param el The element to attach the listener to (e.g., HTMLElement, HTMLInputElement).
     * @param type The event name (e.g., "click", "mousedown", "input").
     * @param handler The event handler function.
     */
    protected addEventListener(el: HTMLElement, type: string, handler: ModuleEventHandler): void {
        el.addEventListener(type, handler);
        this.eventHandlers.push({ element: el, type, handler });
    }
}
