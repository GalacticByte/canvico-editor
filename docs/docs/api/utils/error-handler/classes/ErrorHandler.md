# Class: ErrorHandler

A centralized class for handling errors that occur within the application.
By default, it logs errors to the console, but it can be extended
in the future to support other reporting mechanisms (e.g., sending to a logging service).

## Constructors

### Constructor

> **new ErrorHandler**(): `ErrorHandler`

#### Returns

`ErrorHandler`

## Methods

### handle()

> **handle**(`error`): `void`

Handles an error by logging it to the console.
This is the central place for logging errors for developers.

#### Parameters

##### error

`Error`

The error object to handle, which should include a message and preferably a stack trace.

#### Returns

`void`
