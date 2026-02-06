# Boop Example

Simple example app to test the @shtbox/boop component.

## Setup

1. Install dependencies in the example folder:
```bash
cd example
npm install
```

2. Run the example (it will use the source files directly):
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Features Demonstrated

- Inline button placement
- Fixed button placement  
- Dark mode toggle
- Custom class names

## Notes

The example imports directly from the source files (`../src`) using a Vite alias, so you can test changes in real-time without rebuilding the package. To avoid Windows symlink restrictions, `@shtbox/boop` is not installed via `file:` in `package.json`.
