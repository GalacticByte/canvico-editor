# Class: CropModule

A module for cropping images on the canvas. It provides a draggable and resizable
rectangle to define the crop area.

## Extends

- [`BaseModule`](../../BaseModule/classes/BaseModule.md)

## Constructors

### Constructor

> **new CropModule**(`opts`): `CropModule`

Creates an instance of the CropModule.

#### Parameters

##### opts

[`CropModuleOptions`](../interfaces/CropModuleOptions.md)

The options for configuring the crop module.

#### Returns

`CropModule`

#### Overrides

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`constructor`](../../BaseModule/classes/BaseModule.md#constructor)

## Properties

### eventHandlers

> `protected` **eventHandlers**: `object`[] = `[]`

Stores all registered event listeners for this module.
Each entry contains the element, event type, and the handler function,
allowing for easy removal in the `destroy` method.

#### element

> **element**: `HTMLElement`

#### handler

> **handler**: [`EventHandler`](../../../types/type-aliases/EventHandler.md)

#### type

> **type**: `string`

#### Inherited from

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`eventHandlers`](../../BaseModule/classes/BaseModule.md#eventhandlers)

## Methods

### activate()

> **activate**(): `void`

Activates the crop module, making it ready for user interaction.

#### Returns

`void`

#### Overrides

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`activate`](../../BaseModule/classes/BaseModule.md#activate)

***

### addEventListener()

> `protected` **addEventListener**(`el`, `type`, `handler`): `void`

A helper method to attach an event listener to an element and track it for later removal.

#### Parameters

##### el

`HTMLElement`

The element to attach the listener to (e.g., HTMLElement, HTMLInputElement).

##### type

`string`

The event name (e.g., "click", "mousedown", "input").

##### handler

[`EventHandler`](../../../types/type-aliases/EventHandler.md)

The event handler function.

#### Returns

`void`

#### Inherited from

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`addEventListener`](../../BaseModule/classes/BaseModule.md#addeventlistener)

***

### deactivate()

> **deactivate**(): `void`

Deactivates the crop module.

#### Returns

`void`

#### Overrides

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`deactivate`](../../BaseModule/classes/BaseModule.md#deactivate)

***

### destroy()

> **destroy**(): `void`

Cleans up resources and event listeners.

#### Returns

`void`

#### Overrides

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`destroy`](../../BaseModule/classes/BaseModule.md#destroy)

***

### disableCropMode()

> **disableCropMode**(): `void`

Disables crop mode.
This resets the module's state and removes all event listeners related to cropping.
Disables crop mode, resetting state and removing event listeners.

#### Returns

`void`

***

### drawOverlay()

> **drawOverlay**(): `void`

Draws the crop overlay, including the semi-transparent mask, border, and handles.

#### Returns

`void`

***

### enableCropMode()

> **enableCropMode**(): `void`

Enables crop mode.
This initializes the crop rectangle to a default size and adds all necessary event listeners for interaction.
Enables crop mode, initializing the crop rectangle and adding event listeners.

#### Returns

`void`

***

### getName()

> **getName**(): `string`

Returns the unique name of the module.

#### Returns

`string`

The name of the module.

#### Inherited from

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`getName`](../../BaseModule/classes/BaseModule.md#getname)

***

### init()

> **init**(): `void`

Initializes the module by attaching event listeners.

#### Returns

`void`

#### Overrides

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`init`](../../BaseModule/classes/BaseModule.md#init)

***

### isCropModeActive()

> **isCropModeActive**(): `boolean`

Checks if the crop mode is currently active.

#### Returns

`boolean`

True if crop mode is active, false otherwise.

***

### onKeyDown()

> **onKeyDown**(`e`): `void`

**`Internal`**

Handles the keydown event, specifically for the Shift key to toggle aspect ratio lock.

#### Parameters

##### e

`KeyboardEvent`

#### Returns

`void`
