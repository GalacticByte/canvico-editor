# Type Alias: CanvicoEditorConfig

> **CanvicoEditorConfig** = `object`

The main configuration object for the CanvicoEditor.

## Properties

### clearCanvasButtonSelector

> **clearCanvasButtonSelector**: `string`

CSS selector for the button that clears the canvas and resets the editor.

***

### containerSelector

> **containerSelector**: `string`

CSS selector for the element that will contain the editor's canvas.

***

### imageFileInputSelector

> **imageFileInputSelector**: `string`

CSS selector for the file input used to load images.

***

### maxFileSizeMB?

> `optional` **maxFileSizeMB**: `number`

Optional maximum allowed file size in megabytes (MB).

***

### modules?

> `optional` **modules**: [`ModuleConfig`](ModuleConfig.md)

Optional container for all module configurations.

***

### resetEditsButtonSelector

> **resetEditsButtonSelector**: `string`

CSS selector for the button that resets the image to its original state.

***

### saveButtonSelector

> **saveButtonSelector**: `string`

CSS selector for the button that saves/downloads the current image.
