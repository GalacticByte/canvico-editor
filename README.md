# Canvico Editor

[![NPM Version](https://img.shields.io/npm/v/canvico-editor.svg)](https://www.npmjs.com/package/canvico-editor)

A simple and extensible image editor built with TypeScript and the Canvas API. Designed with modularity and developer experience in mind, it separates DOM logic from business logic, provides strong typing, and includes robust error handling. Easily integrable into web projects.

## Features

- **Canvas Editing Core**: Load, resize, crop, rotate, flip, and export images in-browser.
- **Cross-Input Crop UX**: Crop interactions support mouse and touch input.
- **Modular Design**: Resize, Crop, and Transform are isolated modules for easier maintenance and extension.
- **State-Driven Architecture**: Central `CanvasState` store with reducer-based updates for predictable editor behavior.
- **Type-Safe API**: Fully typed configuration and public interfaces for better DX in TypeScript projects.
- **Input Validation**: Built-in file type and file size checks before processing.
- **Structured Error Reporting**: Optional `onError` callback with contextual metadata (`source`, `operation`, `timestamp`).
- **Flexible Logging**: Toggle internal console logging with `logErrorsToConsole`.
- **Lifecycle-Safe Cleanup**: `destroy()` removes internal listeners and avoids leaking host app handlers.

Behavior note:
Resize values and aspect-ratio lock work in output image space (`currentImage` dimensions), while the on-screen canvas is a fit-to-container preview.

Supported input formats:
`image/jpeg`, `image/png`, `image/webp`.

## Installation

Install the package using npm:

```bash
npm install canvico-editor
```

## Quick Start

```javascript
import { CanvicoEditor } from "canvico-editor";

const canvico = new CanvicoEditor({
    containerSelector: `.canvico-container`,
    imageFileInputSelector: ".input-upload-file",
    resetEditsButtonSelector: "#resetEdit",
    clearCanvasButtonSelector: "#cleanAll",
    saveButtonSelector: "#saveBtn",
    maxFileSizeMB: 5,
    strictModuleSelectors: true, // optional: fail fast on invalid module selectors
    logErrorsToConsole: true,
    onError: ({ error, source, operation, timestamp }) => {
        // Integrate with your logger/monitoring tool here
        console.error("[CanvicoEditor]", timestamp.toISOString(), source, operation, error);
    },
    modules: {
        resize: {
            widthInputSelector: "#widthInput",
            heightInputSelector: "#heightInput",
            lockAspectRatioSelector: "#keepAspectRatio",
        },
        crop: {
            activateButtonSelector: "#cropBtn",
            applyButtonSelector: "#applyBtn",
            frameColor: "#d84cb9",
            outsideOverlayColor: "rgba(0,0,0,0.2)",
        },
        transform: {
            rotateInputSelector: "#rotateDeg",
            flipHorizontalButtonSelector: "#flipH",
            flipVerticalButtonSelector: "#flipV",
        },
    },
});

// In SPA/framework apps, clean up on unmount:
// canvico.destroy();
```

## Documentation

For the full API documentation, including all available options, methods, and modules, please visit the [documentation page](https://galacticbyte.github.io/canvico-editor/).

## Browser Support

| Chrome | Firefox | Safari | Edge |
| :----: | :-----: | :----: | :--: |
|  Yes   |   Yes   |  Yes   | Yes  |

## Contributing

First off, thank you for considering contributing to Canvico Editor! It's people like you that make the open-source community such a great place.

Canvico Editor is an open-source project with a modular architecture, and we welcome any form of contribution. All help, from reporting bugs to adding new features (like custom modules), is highly appreciated.

If you have an idea for an improvement or have found a bug, the best way to contribute is by opening an "issue" or creating a "pull request". For detailed information on how you can help, please see the contribution guide: [CONTRIBUTING.md](https://galacticbyte.github.io/canvico-editor/docs/CONTRIBUTING/).

## License

This project is available under the MIT license.
