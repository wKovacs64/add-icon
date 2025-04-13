# Iconify CLI

A command-line tool to download icons from the [Iconify Framework](https://iconify.design/) and
apply custom transformations.

## Installation

Add it to your project:

```bash
npm install iconify-cli
```

Or use it directly with npx without installing:

```bash
npx iconify-cli heroicons:arrow-up-circle
```

## Usage

### Basic Usage

Download an icon:

```bash
npx iconify-cli heroicons:arrow-up-circle
```

Specify an output directory:

```bash
npx iconify-cli heroicons:arrow-up-circle --output-dir ./my-icons
```

### Transformations

Apply built-in transformations:

```bash
# Remove width and height attributes
npx iconify-cli heroicons:arrow-up-circle --remove-size

# Optimize SVG with SVGO
npx iconify-cli heroicons:arrow-up-circle --optimize

# Minify SVG
npx iconify-cli heroicons:arrow-up-circle --minify

# Apply multiple transformations
npx iconify-cli heroicons:arrow-up-circle --remove-size --optimize --minify
```

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
import type { TransformArgs } from 'iconify-cli';

/**
 * Custom transform to add a title element to SVG
 * @param args - Transform arguments containing SVG content and icon information
 * @returns The transformed SVG
 */
export default function addTitle(args: TransformArgs): string {
  const titleElement = `<title>${args.iconName}</title>`;
  return args.svg.replace(/<svg([^>]*)>/, `<svg$1>${titleElement}`);
}
```

Then use it with the CLI:

```bash
# JavaScript transform
npx iconify-cli heroicons:arrow-up-circle --transform ./my-transform.js

# TypeScript transform
npx iconify-cli heroicons:arrow-up-circle --transform ./my-transform.ts
```

## Configuration File

You can create a configuration file (`iconify.config.js`) in your project root:

```js
import { transforms } from 'iconify-cli';

// Define custom transform
function addCustomAttribute(args) {
  return args.svg.replace(/<svg/, `<svg data-icon="${args.iconName}"`);
}

export default {
  outputDir: './assets/icons',
  transforms: [transforms.removeSize, transforms.optimizeSvg, addCustomAttribute],
};
```

## Using as a Library

You can also use iconify-cli as a library in your own projects:

### JavaScript

```js
import { downloadIcon, transforms } from 'iconify-cli';

// Create custom transform
function addCustomAttribute(args) {
  return args.svg.replace(/<svg/, `<svg data-custom="${args.prefix}"`);
}

// Download an icon with transforms
async function downloadCustomIcon() {
  const iconPath = await downloadIcon('heroicons:heart', {
    outputDir: './icons',
    transforms: [transforms.removeSize, transforms.optimizeSvg, addCustomAttribute],
  });

  console.log(`Icon saved to: ${iconPath}`);
}

downloadCustomIcon();
```

### TypeScript

```ts
import { downloadIcon, transforms, type TransformArgs } from 'iconify-cli';

// Create custom transform
const addCustomAttribute = (args: TransformArgs): string => {
  return args.svg.replace(/<svg/, `<svg data-custom="${args.prefix}"`);
};

// Download an icon with transforms
async function downloadCustomIcon(): Promise<void> {
  try {
    const iconPath = await downloadIcon('heroicons:heart', {
      outputDir: './icons',
      transforms: [transforms.removeSize, transforms.optimizeSvg, addCustomAttribute],
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
