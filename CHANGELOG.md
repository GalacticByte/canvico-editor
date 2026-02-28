# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-28

### Added

- New `transform` module (rotate + horizontal/vertical flip).
- Centralized canvas state store (`CanvasState`) backed by a reducer (`EditorReducer`) and typed actions.
- Touch support for crop interactions (`touchstart`/`touchmove`/`touchend`/`touchcancel`) in addition to mouse input.
- Strict module selector mode via `strictModuleSelectors` configuration (fail-fast on invalid module selectors).
- Structured runtime error reporting:
    - `onError` callback in `CanvicoEditorConfig`
    - `logErrorsToConsole` toggle
    - contextual report payload (`error`, `source`, `operation`, `timestamp`)

### Changed

- Refactored rendering flow toward a state -> render model, with CanvasState as the primary source of truth for image and edit data, while module activation lifecycle remains managed by the editor/modules.
- Updated module activation flow: crop mode now locks resize/transform interactions until crop is exited or applied.
- Simplified module responsibilities and internal APIs across `resize`, `crop`, and `transform`.
- Extended configuration with `transform` selectors (`types` + `DOMManager`).
- Standardized validation error names (`Canvico...Error`) for easier filtering/monitoring.
- Hardened store boundaries: `CanvasState` getters now return read-only copies instead of internal state references.
- Simplified editor state model by removing transient UI/session flags from reducer state.
- Resize aspect-ratio logic now uses output/document image space; canvas remains a fit-to-container preview.
- Validation accepts `image/jpeg`, `image/png`, and `image/webp` (animated `image/gif` excluded).

### Fixed

- Crop and export now operate in output-resolution space (full-res), with preview-to-output coordinate mapping.
- Improved control-state consistency when switching between modes.
- Reduced unnecessary redraws via state-change deduplication and render scheduling.
- Fixed listener lifecycle in `destroy()` (remove only internal listeners, no DOM node replacement side effects).
- Fixed async image workflow edge cases: canceled stale operations after destroy and prevented unresolved image-apply promises.
- Fixed crop-rect normalization near canvas edges to preserve minimum size constraints.
- Fixed touch-cancel crop behavior by finalizing interaction with rect normalization.
- Fixed transform UI sync so `rotateInput` reflects store resets even outside activation flow.

### Notes

- No breaking changes for existing `resize`/`crop`/`transform` configuration.
- New error-reporting options are optional and backward-compatible.

## [1.0.1] - 2025-12-30

### Added

- Initial public release of the library
- Core API for initializing the application
