# Type Alias: CanvicoEditorOptions

> **CanvicoEditorOptions** = `object`

The main configuration object for the CanvicoEditor.

## Properties

### cleanAllSelector

> **cleanAllSelector**: `string`

CSS selector for the button that clears the canvas and resets the editor.

***

### containerSelector

> **containerSelector**: `string`

CSS selector for the element that will contain the editor's canvas.

***

### inputSelector

> **inputSelector**: `string`

CSS selector for the file input used to load images.

***

### maxFileSizeMB?

> `optional` **maxFileSizeMB**: `number`

Optional maximum allowed file size in megabytes (MB).

***

### modules?

> `optional` **modules**: [`ModuleOptions`](ModuleOptions.md)

Optional container for all module configurations.

***

### resetSelector

> **resetSelector**: `string`

CSS selector for the button that resets the image to its original state.

***

### saveSelector

> **saveSelector**: `string`

CSS selector for the button that saves/downloads the current image.
