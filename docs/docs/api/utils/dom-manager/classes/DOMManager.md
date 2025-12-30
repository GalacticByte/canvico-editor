# Class: DOMManager

Manages all DOM interactions for the CanvicoEditor.
It queries and validates the existence of all required and optional
elements upon instantiation, providing a single, reliable source of DOM nodes.

## Constructors

### Constructor

> **new DOMManager**(`options`): `DOMManager`

Creates an instance of DOMManager.

#### Parameters

##### options

[`CanvicoEditorOptions`](../../../types/type-aliases/CanvicoEditorOptions.md)

The main editor configuration options containing CSS selectors.

#### Returns

`DOMManager`

#### Throws

If a required DOM element cannot be found.

## Properties

### cropElements?

> `readonly` `optional` **cropElements**: [`CropDOMElements`](../interfaces/CropDOMElements.md)

Contains DOM elements for the crop module. Undefined if the module is not configured.

***

### elements

> `readonly` **elements**: [`CoreDOMElements`](../interfaces/CoreDOMElements.md)

Contains the core, always-required DOM elements.

***

### resizeElements?

> `readonly` `optional` **resizeElements**: [`ResizeDOMElements`](../interfaces/ResizeDOMElements.md)

Contains DOM elements for the resize module. Undefined if the module is not configured.
