# Function: createFeatureNotSupportedError()

> **createFeatureNotSupportedError**(`featureName`): `Error`

Creates a standardized error for when a required browser feature is not supported.

## Parameters

### featureName

`string`

The name of the required feature (e.g., 'FileReader').

## Returns

`Error`

A new Error object with a descriptive message.
