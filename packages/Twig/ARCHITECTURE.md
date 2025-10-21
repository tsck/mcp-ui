# Twig Augmenter Architecture

## Problem Solved

The original implementation tried to import component files directly in `index.ts` to get component references. This caused the server to crash because component files import browser-only libraries (like `@lg-charts/core`) that don't exist in Node.js.

## Solution

Separate concerns between build-time and runtime:

1. **Component files** (`.tsx`) - Only used during build process, contain browser-only imports
2. **Transform files** (`.transform.ts`) - Server-side code, imported in `index.ts`
3. **Registry** - Uses bundle names (strings) instead of component references

## Architecture Flow

### Build Time

```
Component files (*.tsx)
    ↓
Entry Generator discovers components
    ↓
Generates temporary entry files with React boilerplate
    ↓
esbuild bundles each component
    ↓
Outputs bundles to bundles/ directory
    ↓
Cleans up temporary files
```

### Runtime

```
Tool result arrives with URI
    ↓
Registry looks up augmenter by URI
    ↓
Loads pre-built bundle from disk (by bundleName)
    ↓
Executes transformData function (if provided)
    ↓
Generates HTML with embedded bundle + props
    ↓
Returns UI resource to client
```

## Key Design Decisions

### 1. Bundle Name as String

Instead of:

```typescript
register({ component: MyComponent }); // ❌ Imports component, crashes server
```

We use:

```typescript
register({ bundleName: "myComponent" }); // ✅ Just a string, no imports
```

### 2. Separate Transform Files

Transform functions are kept in `.transform.ts` files so they can be imported server-side without pulling in browser dependencies.

```
myComponent.tsx           # Browser-only (charts, UI libs)
myComponent.transform.ts  # Server-only (JSON parsing, data transforms)
```

### 3. No Component Imports in index.ts

The main export file (`index.ts`) never imports component files. It only imports transform files and uses string-based bundle names.

## File Responsibilities

| File                 | Runs On           | Purpose                               |
| -------------------- | ----------------- | ------------------------------------- |
| `*.tsx`              | Browser (bundled) | React components, UI rendering        |
| `*.transform.ts`     | Server            | Data transformation logic             |
| `augmenter-utils.ts` | Server            | Bundle loading, HTML generation       |
| `entry-generator.ts` | Build script      | Discover components, generate entries |
| `index.ts`           | Server            | Register augmenters, export API       |

## Benefits

✅ **No runtime crashes** - Server never tries to import browser-only code  
✅ **Fast builds** - Components discovered automatically  
✅ **Type-safe** - Full TypeScript support throughout  
✅ **Cached bundles** - Loaded once, reused for all requests  
✅ **Clean separation** - Build-time vs runtime concerns clearly separated
