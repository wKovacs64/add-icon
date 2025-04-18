# @wkovacs64/add-icon

A command-line tool to download icons from the [Iconify Framework](https://iconify.design/) and
apply custom transformations.

> [!WARNING]
> This is "vibe coded" AI slop. I did not write any of this code by hand. Use at your own risk.

## Installation

Add it to your project:

```bash
npm install @wkovacs64/add-icon
```

Or use it directly with npx without installing:

```bash
npx @wkovacs64/add-icon <icon>... [options]
```

## Usage

### Basic Usage

Download a single icon to the specified directory:

```bash
npx @wkovacs64/add-icon heroicons:arrow-up-circle --output-dir ./app/assets/svg-icons
```

Download multiple icons in one command:

```bash
npx @wkovacs64/add-icon heroicons:arrow-up-circle mdi:home lucide:github --output-dir ./app/assets/svg-icons
```

### Transformations

The tool fetches SVG icons directly from the Iconify API with width and height attributes removed
automatically. You can optionally provide a transform file using either JavaScript or TypeScript
containing custom transformations for more advanced modifications.

#### TypeScript Transform Example

```ts
// my-transform.ts
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
npx @wkovacs64/add-icon heroicons:arrow-up-circle --transform ./my-transform.ts
```

### Configuration File

You can create a configuration file in your project root, using either JavaScript
(`add-icon.config.js`) or TypeScript (`add-icon.config.ts`).

#### TypeScript Configuration Example

```ts
import type { Config, TransformArgs, TransformFunction } from '@wkovacs64/add-icon';

// Define custom transform
function addCustomAttribute(args: TransformArgs): string {
  return args.svg.replace(/<svg/, `<svg data-icon="${args.iconName}"`);
}

const config = {
  outputDir: './assets/icons',
  transforms: [addCustomAttribute],
} satisfies Config;

export default config;
```

## License

MIT
