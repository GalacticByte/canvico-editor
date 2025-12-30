# Interface: CropModuleOptions

Configuration options for the CropModule.

## Properties

### applyButton

> **applyButton**: `HTMLElement`

***

### backgroundColor?

> `optional` **backgroundColor**: `string`

***

### borderColor?

> `optional` **borderColor**: `string`

***

### canvas

> **canvas**: `HTMLCanvasElement`

***

### cropButton

> **cropButton**: `HTMLElement`

***

### ctx

> **ctx**: `CanvasRenderingContext2D`

***

### getCurrentImage()

> **getCurrentImage**: () => `undefined` \| `HTMLImageElement`

#### Returns

`undefined` \| `HTMLImageElement`

***

### onCropApplied()

> **onCropApplied**: (`newImageDataUrl`) => `void`

#### Parameters

##### newImageDataUrl

`string`

#### Returns

`void`

***

### requestRedraw()?

> `optional` **requestRedraw**: () => `void`

#### Returns

`void`
