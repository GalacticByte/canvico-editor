/**
 * Creates an HTML element with specified options.
 * @template {keyof HTMLElementTagNameMap} K
 * @param tagName - The tag name of the element to create.
 * @param options - Optional configuration for the element.
 * @param options.classes - An array of CSS classes to add to the element.
 * @param options.attributes - An object of attributes to set on the element.
 * @param options.innerText - The inner text to set for the element.
 * @returns {HTMLElementTagNameMap[K]} The created HTML element.
 */

export function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options?: {
        classes?: string[];
        attributes?: { [key: string]: string };
        innerText?: string;
    }
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tagName);
    if (options?.classes) {
        options.classes.forEach((cls) => el.classList.add(cls));
    }
    if (options?.attributes) {
        Object.entries(options.attributes).forEach(([key, val]) => {
            el.setAttribute(key, val);
        });
    }
    if (options?.innerText) {
        el.innerText = options.innerText;
    }
    return el;
}

/**
 * Adds multiple CSS classes to an element at once.
 * @param el - The element to add classes to.
 * @param classes - An array of class names to add.
 */
export function addClasses(el: Element, classes: string[]): void {
    el.classList.add(...classes);
}

/**
 * Sets multiple attributes on an element at once.
 * @param {Element} el - The element to set attributes on.
 * @param {{ [key: string]: string }} attributes - An object where keys are attribute names and values are the attribute values.
 */
export function setAttributes(el: Element, attributes: { [key: string]: string }): void {
    Object.entries(attributes).forEach(([key, val]) => {
        el.setAttribute(key, val);
    });
}
