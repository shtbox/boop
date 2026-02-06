# @shtbox/boop

Embeddable feedback widget for React websites. Built for Shtbox.io (ShotBox).

## Install

```bash
npm install @shtbox/boop
```

## Usage

```tsx
import { Boop } from "@shtbox/boop";

export const App = () => (
  <>
    {/* Basic: defaults only */}
    <Boop />

    {/* Advanced: grouped options */}
    <Boop
      options={{
        endpoint: "https://boop.shtbox.io",
        darkMode: true,
        mode: "widget",
        widgetOptions: {
          title: "Send feedback",
          button: { label: "Open widget" }
        },
        sidebarOptions: {
          title: "Send feedback",
          button: { label: "Open sidebar" }
        },
        behavior: { closeOnSubmit: true },
        style: {
          classNames: {
            root: "my-boop",
            panel: "my-boop-panel",
            button: "my-boop-button"
          }
        }
      }}
    />
  </>
);
```

> Breaking change: direct props were removed in favor of the `options` object.

## Provider (optional)

You can centralize defaults and update them per page/route with a provider. Component
`options` still work and override provider options.

```tsx
import { Boop, BoopProvider, useBoop } from "@shtbox/boop";

const Page = () => {
  const { updateOptions, submitFeedback } = useBoop();

  return (
    <>
      <button
        onClick={() =>
          updateOptions({
            widgetOptions: { button: { label: "Help" } }
          })
        }
      >
        Update label
      </button>
      <button
        onClick={() =>
          submitFeedback({
            message: "Love this!",
            email: "ada@example.com"
          })
        }
      >
        Send feedback
      </button>
    </>
  );
};

export const App = () => (
  <BoopProvider defaultOptions={{ style: { useDefaultStyles: true } }}>
    <Page />
    <Boop options={{ mode: "widget" }} />
  </BoopProvider>
);
```

## Props

`<Boop />` supports a single prop: `options?: BoopOptions`.

### BoopOptions

```
{
  endpoint?: string,
  darkMode?: boolean,
  mode?: "sidebar" | "widget",
  widgetOptions?: BoopVariantOptions,
  sidebarOptions?: BoopVariantOptions,
  behavior?: BoopBehaviorOptions,
  callbacks?: BoopCallbacks,
  style?: BoopStyleOptions,
  animation?: BoopAnimationOptions,
  backdrop?: BoopBackdropOptions,
  metadata?: Record<string, unknown>,
  slots?: BoopSlots
}
```

### BoopVariantOptions

```
{
  title?: string,
  labels?: BoopLabels,
  placeholders?: BoopPlaceholders,
  button?: {
    label?: string,
    placement?: "inline" | "fixed",
    fixedOffset?: { top?, right?, bottom?, left? }
  },
  panel?: {
    placement?: "center" | "fixed",
    fixedOffset?: { top?, right?, bottom?, left? },
    width?: number | string,
    maxHeight?: number | string
  },
  successMessage?: string,
  errorMessage?: string
}
```

When `mode` is `"widget"`, the panel defaults to `"fixed"` if the button is fixed or
`panel.fixedOffset` is set. If the panel is fixed and no `panel.fixedOffset` is
provided, the panel offset is derived from the button offset plus a 24px gap
(default button offset is 24px).

### BoopBehaviorOptions

```
{
  autoOpen?: boolean,
  closeOnSubmit?: boolean
}
```

### BoopCallbacks

```
{
  onOpen?: () => void,
  onClose?: () => void,
  onSubmitStart?: () => void,
  onValidationError?: (field, message) => void,
  onFieldChange?: (field, value) => void,
  onSubmitSuccess?: (response: Response) => void,
  onSubmitError?: (error: Error) => void
}
```

### BoopStyleOptions

```
{
  classNames?: BoopClassNames,
  styleOverrides?: Partial<Record<BoopStyleKey, CSSProperties>>,
  theme?: Record<string, string>,
  useDefaultStyles?: boolean
}
```

### BoopAnimationOptions

```
{
  enabled?: boolean,
  durationMs?: number,
  easing?: string,
  widget?: {
    fade?: boolean,
    slide?: boolean,
    grow?: boolean,
    slideDistance?: number,
    scale?: number
  },
  sidebar?: {
    slide?: boolean,
    slideDistance?: number | string
  }
}
```

Defaults to animated. Widgets fade, slide up, and grow in; sidebars slide in from the
right. Set `enabled: false` to disable animation.

### BoopBackdropOptions

```
{
  enabled?: boolean,
  fade?: boolean
}
```

`enabled: false` disables the dimmed backdrop. `fade` controls backdrop fade when
animations are enabled.

### BoopSlots

```
{
  footer?: ReactNode
}
```

### classNames

Use `options.style.classNames` to target these parts:

```
root, button, overlay, panel, header, form, field, textarea, submit, close, footer, attribution
```

### theme

Use `options.style.theme` to override CSS variables:

```
--boop-background
--boop-panel
--boop-text
--boop-muted-text
--boop-border
--boop-button
--boop-button-text
--boop-overlay
--boop-input-bg
```

## Payload

The widget submits the following JSON payload:

```json
{
  "url": "https://your-site.com/page",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "message": "Love the new flow!",
  "metadata": {}
}
```

## License

MIT © Shtbox.io
