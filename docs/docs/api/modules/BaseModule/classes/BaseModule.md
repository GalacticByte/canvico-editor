# Abstract Class: BaseModule

Base class for all editor modules. It provides a centralized way to manage
event listeners, ensuring they are properly cleaned up when a module is destroyed.

## Extended by

- [`CropModule`](../../CropModule/classes/CropModule.md)
- [`ResizeModule`](../../ResizeModule/classes/ResizeModule.md)

## Implements

- [`IModule`](../../../types/interfaces/IModule.md)

## Constructors

### Constructor

> **new BaseModule**(`name`): `BaseModule`

#### Parameters

##### name

`string`

The unique name for the module.

#### Returns

`BaseModule`

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

## Methods

### activate()

> `abstract` **activate**(): `void`

Activates the module, enabling its specific functionality.
Each module must implement this method.

#### Returns

`void`

#### Implementation of

[`IModule`](../../../types/interfaces/IModule.md).[`activate`](../../../types/interfaces/IModule.md#activate)

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

***

### deactivate()

> `abstract` **deactivate**(): `void`

Deactivates the module, disabling its functionality and cleaning up its active state.
Each module must implement this method.

#### Returns

`void`

#### Implementation of

[`IModule`](../../../types/interfaces/IModule.md).[`deactivate`](../../../types/interfaces/IModule.md#deactivate)

***

### destroy()

> **destroy**(): `void`

Cleans up all resources used by the module.
This method iterates over all registered event listeners and removes them.

#### Returns

`void`

#### Implementation of

[`IModule`](../../../types/interfaces/IModule.md).[`destroy`](../../../types/interfaces/IModule.md#destroy)

***

### getName()

> **getName**(): `string`

Returns the unique name of the module.

#### Returns

`string`

The name of the module.

#### Implementation of

[`IModule`](../../../types/interfaces/IModule.md).[`getName`](../../../types/interfaces/IModule.md#getname)

***

### init()

> `abstract` **init**(): `void`

Initializes the module. Each module must implement this method
to register its necessary event listeners using the `addEventListener` helper.

#### Returns

`void`

#### Implementation of

[`IModule`](../../../types/interfaces/IModule.md).[`init`](../../../types/interfaces/IModule.md#init)
