# Interface: IModule

The interface that all editor modules must implement.

## Methods

### activate()

> **activate**(): `void`

Called when the module becomes active, enabling its specific functionality (e.g., drawing a crop box).

#### Returns

`void`

***

### deactivate()

> **deactivate**(): `void`

Called when the module is deactivated, cleaning up its active state.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Cleans up all resources and event listeners used by the module.

#### Returns

`void`

***

### drawOverlay()?

> `optional` **drawOverlay**(): `void`

Optional method for drawing a module-specific overlay on the canvas (e.g., a crop rectangle or resize handles).

#### Returns

`void`

***

### getName()

> **getName**(): `string`

Returns the unique name of the module (e.g., 'resize', 'crop').

#### Returns

`string`

***

### init()

> **init**(): `void`

Initializes the module, binding events to its control elements.

#### Returns

`void`
