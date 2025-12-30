# Class: ResizeModule

A module responsible for handling image and canvas resizing based on user input.
It maintains aspect ratio if requested and ensures the canvas fits within its container.

## Extends

- [`BaseModule`](../../BaseModule/classes/BaseModule.md)

## Constructors

### Constructor

> **new ResizeModule**(`options`): `ResizeModule`

Creates an instance of the ResizeModule.

#### Parameters

##### options

`ResizeModuleOptions`

Configuration options for the module.

#### Returns

`ResizeModule`

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

Activates the resize functionality.

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

Deactivates the resize functionality.

#### Returns

`void`

#### Overrides

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`deactivate`](../../BaseModule/classes/BaseModule.md#deactivate)

***

### destroy()

> **destroy**(): `void`

Cleans up all resources used by the module.
This method iterates over all registered event listeners and removes them.

#### Returns

`void`

#### Inherited from

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`destroy`](../../BaseModule/classes/BaseModule.md#destroy)

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

Initializes the module by attaching event listeners to the input elements.

#### Returns

`void`

#### Overrides

[`BaseModule`](../../BaseModule/classes/BaseModule.md).[`init`](../../BaseModule/classes/BaseModule.md#init)
