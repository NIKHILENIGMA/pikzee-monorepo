# UI Library

A shared component library for the Pikzee built with [shadcn/ui](https://ui.shadcn.com/).

## Overview

This library provides a collection of reusable UI components based on shadcn/ui, ensuring consistency and maintainability across the Pikzee applications.

## Features

- **Shadcn/ui Components**: Modern, accessible, and composable React components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **TypeScript**: Full type safety and IntelliSense support
- **Accessible**: WCAG 2.1 Level AA compliant components
- **Customizable**: Easily themeable and extendable components

## Installation

```bash
npm install @pikzee/ui
```

## Usage

Import components directly from the library:

```typescript
import { Button } from '@pikzee/ui';

export function MyComponent() {
  return <Button variant="primary">Click me</Button>;
}
```

## Available Components

- Button
- Card
- Dialog
- Input
- Label
- Select
- Tabs
- Toast
- Tooltip
- And more...

For a complete list of components and their usage, refer to [shadcn/ui documentation](https://ui.shadcn.com/).

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Run Tests

```bash
npm run test
```

## Contributing

Contributions are welcome! Please follow the existing patterns and ensure all components are properly documented and tested.

## License

MIT
