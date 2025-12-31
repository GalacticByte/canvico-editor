# Canvico Editor

[![NPM Version](https://img.shields.io/npm/v/canvico-editor.svg)](https://www.npmjs.com/package/canvico-editor)

A simple and extensible image editor built with TypeScript and the Canvas API. Designed with modularity and developer experience in mind, it separates DOM logic from business logic, provides strong typing, and includes robust error handling. Easily integrable into web projects.

## Features

-   **Image Loading**: Load images from a local file input.
-   **Resizing**: Dynamically resize the image with an option to keep the aspect ratio.
-   **Cropping**: User-friendly crop tool with a movable and resizable selection box.
-   **Saving**: Download the edited image as a PNG file.
-   **Modularity**: Easily extend the editor with new modules (e.g., filters, text, etc.).
-   **Robust Error Handling**: Centralized error management for consistent and descriptive messages.
-   **Strong Typing**: Fully typed API for improved Developer Experience.

## Installation

Install the package using npm:

```bash
npm install canvico-editor
```

## Quick Start

```javascript
import { CanvicoEditor } from "canvico-editor";

const canvico = new CanvicoEditor({
    containerSelector: `.canvico-containerr`,
    imageFileInputSelector: ".input-upload-file",
    resetEditsButtonSelector: "#resetEdit",
    clearCanvasButtonSelector: "#cleanAll",
    saveButtonSelector: "#saveBtn",
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
    },
});
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
