# Emotion CSS-in-JS Guide

This project uses [Emotion](https://emotion.sh/) with the **css prop approach** for styling, which allows you to write CSS in JavaScript and import colors/values from any JS package!

## What Changed

✅ **Added Emotion package**: `@emotion/react`  
✅ **Configured Vite & TypeScript** to use Emotion's JSX runtime  
✅ **Created a theme system** (`src/theme.ts`) that imports colors from `@leafygreen-ui/palette`  
✅ **Migrated all CSS** to use the `css` prop  
✅ **Removed old CSS files**: `App.css` and `index.css`

## Key Benefits

### 1. Import Colors from Any JS Package

You can now import colors from any JavaScript package and use them in your styles:

```tsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { palette } from '@leafygreen-ui/palette';

const buttonStyle = css`
  background-color: ${palette.blue.base};
  color: ${palette.white};
`;

function MyButton() {
  return <button css={buttonStyle}>Click me</button>;
}
```

### 2. Centralized Theme System

All design tokens are now in `src/theme.ts`:

```tsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { theme } from './theme';

const cardStyle = css`
  background-color: ${theme.colors.background.elevated};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
`;

function Card() {
  return <div css={cardStyle}>Content</div>;
}
```

### 3. TypeScript Support

Full TypeScript support with autocomplete for your theme values and the `css` prop.

### 4. Dynamic Styling

Easily create dynamic styles based on props or state:

```tsx
const buttonStyle = (variant: 'primary' | 'danger') => css`
  background-color: ${variant === 'primary' ? palette.blue.base : palette.red.base};
  color: ${palette.white};
`;

function Button({ variant }: { variant: 'primary' | 'danger' }) {
  return <button css={buttonStyle(variant)}>Click me</button>;
}
```

## Usage Examples

### Basic CSS Prop

```tsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { theme } from './theme';

const containerStyle = css`
  background-color: ${theme.colors.background.app};
  padding: ${theme.spacing.lg};
`;

function Container() {
  return <div css={containerStyle}>Content</div>;
}
```

### Inline CSS Prop

```tsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { palette } from '@leafygreen-ui/palette';

function MyComponent() {
  return (
    <div css={css`
      color: ${palette.blue.base};
      padding: 1rem;
      &:hover {
        color: ${palette.blue.dark1};
      }
    `}>
      Hello World
    </div>
  );
}
```

### Style Composition

```tsx
const baseStyle = css`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
`;

const primaryStyle = css`
  ${baseStyle}
  background-color: ${palette.blue.base};
  color: ${palette.white};
`;
```

### Global Styles

Global styles are defined in `src/GlobalStyles.tsx` using Emotion's `Global` component.

## Important: JSX Pragma

When using the `css` prop, you need to add this comment at the top of your file:

```tsx
/** @jsxImportSource @emotion/react */
```

This tells TypeScript/Babel to use Emotion's JSX runtime, which enables the `css` prop.

## File Structure

```
src/
├── theme.ts              # Theme configuration with imported colors
├── GlobalStyles.tsx      # Global styles (body, scrollbar, etc.)
├── App.styles.tsx        # CSS objects for App components
├── emotion.d.ts          # TypeScript declarations for Emotion
└── examples/
    └── EmotionUsageExamples.tsx  # More usage examples
```

## Pattern: Style Files

Export css objects from separate style files:

```tsx
// Button.styles.tsx
import { css } from '@emotion/react';
import { theme } from './theme';

export const buttonStyle = css`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.primary};
`;

export const buttonStyle = (variant: 'primary' | 'secondary') => css`
  padding: ${theme.spacing.md};
  background-color: ${variant === 'primary' 
    ? theme.colors.primary 
    : theme.colors.secondary
  };
`;
```

Then use in components:

```tsx
// Button.tsx
/** @jsxImportSource @emotion/react */
import { buttonStyle } from './Button.styles';

export function Button() {
  return <button css={buttonStyle}>Click me</button>;
}
```

## Adding More Color Packages

You can install any color package and use it in your theme:

```bash
# Examples:
pnpm add @radix-ui/colors
pnpm add tailwindcss
pnpm add open-color
```

Then import in your theme:

```tsx
// theme.ts
import { blue } from '@radix-ui/colors';
import colors from 'tailwindcss/colors';
import { palette } from '@leafygreen-ui/palette';

export const theme = {
  colors: {
    primary: palette.blue.base,
    secondary: colors.purple[600],
    accent: blue.blue9,
    // ...
  }
};
```

And use them anywhere:

```tsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { theme } from './theme';

const myStyle = css`
  color: ${theme.colors.primary};
  background: ${theme.colors.accent};
`;
```

## Resources

- [Emotion Documentation](https://emotion.sh/docs/introduction)
- [CSS Prop](https://emotion.sh/docs/css-prop)
- [Composition](https://emotion.sh/docs/composition)
- [TypeScript](https://emotion.sh/docs/typescript)

## Tips & Best Practices

### 1. Use Functions for Dynamic Styles

```tsx
const buttonStyle = (isActive: boolean) => css`
  background-color: ${isActive ? palette.green.base : palette.gray.base};
`;

<button css={buttonStyle(isActive)}>Click me</button>
```

### 2. Compose Styles with Arrays

```tsx
const styles = [baseStyle, isActive && activeStyle];
<div css={styles}>Content</div>
```

### 3. Keep Styles Close to Components

For component-specific styles, keep them in the same file or a `.styles.tsx` file next to the component.

### 4. Extract Reusable Styles

Put commonly used styles in `App.styles.tsx` or create a `common.styles.tsx` file.

See the existing components (`ToolSelector`, `ResponseDisplay`, `UIRenderer`) for examples!

