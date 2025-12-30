# Function: createMissingModuleSelectorsError()

> **createMissingModuleSelectorsError**(`moduleName`, `selectors`): `Error`

Creates a standardized error for when a module is configured with an incomplete set of selectors.

## Parameters

### moduleName

`string`

The name of the module (e.g., 'Resize', 'Crop').

### selectors

`string`[]

The list of required selector names for the module.

## Returns

`Error`

A new Error object with a descriptive message.
