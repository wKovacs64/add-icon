# @wkovacs64/add-icon

A command-line tool to download icons from the [Iconify Framework](https://iconify.design/) and
apply custom transformations.

## Installation

Add it to your project:

```bash
npm install @wkovacs64/add-icon
```

Or use it directly with npx without installing:

```bash
npx @wkovacs64/add-icon heroicons:arrow-up-circle
```

## Usage

### Basic Usage

Download an icon:

```bash
npx @wkovacs64/add-icon heroicons:arrow-up-circle
```

Specify an output directory:

```bash
npx @wkovacs64/add-icon heroicons:arrow-up-circle --output-dir ./my-icons
```

### Transformations

The tool fetches SVG icons directly from the Iconify API with width and height attributes removed automatically. You can add custom transformations for more advanced modifications.

### Custom Transformations

You can write custom transforms in either JavaScript or TypeScript!

#### JavaScript Transform

Create a custom transform file (e.g., `my-transform.js`):

```js
/**
 * Custom transform to add a title element to SVG
 * @param {Object} args - Transform arguments
 * @param {string} args.svg - SVG content
 * @param {string} args.iconName - Icon name (e.g., 'heroicons:arrow-up-circle')
 * @param {string} args.prefix - Icon set prefix (e.g., 'heroicons')
 * @param {string} args.name - Icon name without prefix (e.g., 'arrow-up-circle')
 * @returns {string} - Transformed SVG
 */
export default function addTitle(args) {
  const titleElement = `<title>${args.iconName}</title>`;
  return args.svg.replace(/<svg([^>]*)>/, `<svg$1>${titleElement}`);
}
```

#### TypeScript Transform

Create a custom transform file (e.g., `my-transform.ts`):

```ts
import type { TransformArgs } from '@wkovacs64/add-icon';

/**
 * Custom transform to add a title element to SVG
 * @param args - Transform arguments containing SVG content and icon information
 * @returns The transformed SVG
 */
export default function addTitle(args: TransformArgs): string {
  const titleElement = `<title>${args.iconSet}:${args.iconName}</title>`;
  return args.svg.replace(/<svg([^>]*)>/, `<svg$1>${titleElement}`);
}
```

Then use it with the CLI:

```bash
# JavaScript transform
npx @wkovacs64/add-icon heroicons:arrow-up-circle --transform ./my-transform.js

# TypeScript transform
npx @wkovacs64/add-icon heroicons:arrow-up-circle --transform ./my-transform.ts
```

## Configuration File

You can create a configuration file in your project root, using either JavaScript (`add-icon.config.js`) or TypeScript (`add-icon.config.ts`).

### JavaScript Configuration

```js
// Define custom transform
function addCustomAttribute(args) {
  return args.svg.replace(/<svg/, `<svg data-icon="${args.iconName}"`);
}

export default {
  outputDir: './assets/icons',
  transforms: [addCustomAttribute],
};
```

### TypeScript Configuration

```ts
import type { IconifyConfig, TransformArgs } from '@wkovacs64/add-icon';

// Define custom transform
function addCustomAttribute(args: TransformArgs): string {
  return args.svg.replace(/<svg/, `<svg data-icon="${args.iconName}"`);
}

const config: IconifyConfig = {
  outputDir: './assets/icons',
  transforms: [addCustomAttribute],
};

export default config;
```

## Using as a Library

You can also use iconify-cli as a library in your own projects:

### JavaScript

```js
import { downloadIcon } from '@wkovacs64/add-icon';

// Create custom transform
function addCustomAttribute(args) {
  return args.svg.replace(/<svg/, `<svg data-custom="${args.iconSet}"`);
}

// Download an icon with transforms
async function downloadCustomIcon() {
  const iconPath = await downloadIcon('heroicons:heart', {
    outputDir: './icons',
    transforms: [addCustomAttribute],
  });

  console.log(`Icon saved to: ${iconPath}`);
}

downloadCustomIcon();
```

### TypeScript

```ts
import { downloadIcon, type TransformArgs } from '@wkovacs64/add-icon';

// Create custom transform
const addCustomAttribute = (args: TransformArgs): string => {
  return args.svg.replace(/<svg/, `<svg data-custom="${args.iconSet}"`);
};

// Download an icon with transforms
async function downloadCustomIcon(): Promise<void> {
  try {
    const iconPath = await downloadIcon('heroicons:heart', {
      outputDir: './icons',
      transforms: [addCustomAttribute],
    });

    console.log(`Icon saved to: ${iconPath}`);
  } catch (error) {
    console.error(
      'Error downloading icon:',
      error instanceof Error ? error.message : String(error),
    );
  }
}

downloadCustomIcon();
```

## License

MIT
