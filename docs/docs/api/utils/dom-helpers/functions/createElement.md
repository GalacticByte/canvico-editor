# Function: createElement()

> **createElement**\<`K`\>(`tagName`, `options?`): `HTMLElementTagNameMap`\[`K`\]

Creates an HTML element with specified options.

## Type Parameters

### K

`K` *extends* keyof `HTMLElementTagNameMap`

## Parameters

### tagName

`K`

The tag name of the element to create.

### options?

Optional configuration for the element.

#### attributes?

\{\[`key`: `string`\]: `string`; \}

An object of attributes to set on the element.

#### classes?

`string`[]

An array of CSS classes to add to the element.

#### innerText?

`string`

The inner text to set for the element.

## Returns

`HTMLElementTagNameMap`\[`K`\]

The created HTML element.
