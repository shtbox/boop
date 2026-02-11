
# @shtbox/boop

Embeddable feedback widget for React websites. Built for Shtbox.io (ShotBox).

## Install

npm install @shtbox/boop

## Quick start

Boop is intentionally small. Drop in `<Boop />` with your `projectId` and you are done.
````Typescript
import { Boop } from "@shtbox/boop";
export const App = () => <Boop options={{ projectId: "your-project-id" }} />;
````

## Why Boop

- Ship a feedback widget in minutes, not days
- Works with any React app, no extra routing
- Customise when you need it, ignore it when you do not

## Provider (optional)

If you need central defaults or runtime updates, wrap once with the provider. This allows you to:

- Set global defaults
- Update options per page or route
- Submit feedback programmatically

Component-level options always override provider defaults.
````Typescript
import { Boop, BoopProvider, useBoop } from "@shtbox/boop";

const Page = () => {
  const { updateOptions, submitFeedback, setFieldValue } = useBoop();

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

      <button onClick={() => setFieldValue("message", "Love this page!")}>
        Prefill message
      </button>
    </>
  );
};

export const App = () => (
  <BoopProvider
    defaultOptions={{ projectId: "your-project-id", style: { useDefaultStyles: true } }}
  >
    <Page />
    <Boop options={{ mode: "widget" }} />
  </BoopProvider>
);
````
## Advanced

Everything is configured through a single prop:

`options?: BoopOptions`

### Mental model

- `<Boop />` renders the widget or sidebar UI
- `options` configures everything (styling, behavior, callbacks, payload extras)
- `BoopProvider` is optional and provides shared defaults plus runtime updates

### Options and how they combine

#### Option merge order

- Provider defaults merge with component `options`
- Component `options` win over provider defaults
- Nested objects are merged shallowly (ex: `style.theme`, `widgetOptions.labels`)

#### `mode` + `widgetOptions` + `sidebarOptions`

- `mode` selects which variant is active: `"widget"` or `"sidebar"`
- Both `widgetOptions` and `sidebarOptions` can be set. Only the active
  variant is rendered, so you can switch `mode` without reconfiguring labels,
  buttons, or panels
- For widgets, panel placement is derived from the button unless you override it:
  - A fixed button implies a fixed panel
  - If the panel is fixed and no `panel.fixedOffset` is provided, the panel
    offset is derived from the button offset plus a 24px gap

### Full option reference

All options are passed under a single prop: `options?: BoopOptions`.

#### `BoopOptions`

```ts
{
  projectId: string,                // Required
  endpoint?: string,                // Default: https://boop.shtbox.io/api/feedback/{projectId}
  darkMode?: boolean,               // Default: false
  mode?: "sidebar" | "widget",      // Default: "sidebar"
  widgetOptions?: BoopVariantOptions,
  sidebarOptions?: BoopVariantOptions,
  behavior?: BoopBehaviorOptions,
  callbacks?: BoopCallbacks,
  style?: BoopStyleOptions,
  animation?: BoopAnimationOptions,
  backdrop?: BoopBackdropOptions,
  urlResolver?: () => string | undefined,
  includeStackTrace?: boolean,      // Default: false
  onSuccessRenderer?: (payload, helpers) => ReactNode,
  metadata?: Record<string, unknown>,
  slots?: BoopSlots,
  attribution?: boolean,            // Default: true
  fieldValues?: { name?: string, email?: string, message?: string },
  fieldValuesMode?: "initial" | "controlled" // Default: "initial"
}
```

`projectId` is required only when you use the default endpoint. If you do not
pass `endpoint`, Boop builds the URL by appending the projectId to the default
endpoint. If you provide a custom endpoint, `projectId` is optional and you are
responsible for including it if your endpoint expects it.

All examples below assume `projectId` is already set, either directly on the
component or via `BoopProvider` defaults.

#### `BoopVariantOptions`

```ts
{
  title?: string,                   // Default: "Feedback"
  labels?: BoopLabels,              // Form field labels
  placeholders?: BoopPlaceholders,  // Input placeholders
  button?: {
    label?: string,                 // Default: "Feedback"
    placement?: "inline" | "fixed", // Default: "inline"
    fixedOffset?: { top?, right?, bottom?, left? }
  },
  panel?: {
    placement?: "center" | "fixed", // Default: "center"
    fixedOffset?: { top?, right?, bottom?, left? },
    width?: number | string,        // Default: 420 (sidebar max width)
    maxHeight?: number | string     // Default: "80vh" for widget panels
  },
  successMessage?: string,          // Default: "Your feedback has been submitted successfully."
  errorMessage?: string             // Default: "Unable to submit feedback."
}
```

#### `BoopBehaviorOptions`

```ts
{
  autoOpen?: boolean,    // Default: false
  closeOnSubmit?: boolean // Default: false
}
```

#### `BoopCallbacks`

```ts
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

#### `BoopStyleOptions`

```ts
{
  classNames?: BoopClassNames,
  styleOverrides?: Partial<Record<BoopStyleKey, CSSProperties>>,
  theme?: Record<string, string>,
  useDefaultStyles?: boolean // Default: true
}
```

#### `BoopAnimationOptions`

```ts
{
  enabled?: boolean,     // Default: true
  durationMs?: number,   // Default: 220
  easing?: string,       // Default: cubic-bezier(0.22, 1, 0.36, 1)
  widget?: {
    fade?: boolean,       // Default: true
    slide?: boolean,      // Default: true
    grow?: boolean,       // Default: true
    slideDistance?: number, // Default: 12
    scale?: number        // Default: 0.98
  },
  sidebar?: {
    slide?: boolean,        // Default: true
    slideDistance?: number | string // Default: "100%"
  }
}
```

#### `BoopBackdropOptions`

```ts
{
  enabled?: boolean,  // Default: true
  fade?: boolean      // Default: true
}
```

#### `BoopSlots`

```ts
{
  footer?: ReactNode
}
```

### Messages and labels

You can customize everything the user sees via `labels`, `placeholders`,
`successMessage`, and `errorMessage`.

```tsx
<Boop
  options={{
    widgetOptions: {
      title: "Send us a note",
      labels: {
        name: "Your name",
        email: "Work email",
        message: "What went wrong?",
        submit: "Send it",
        close: "Close"
      },
      placeholders: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "The save button stops working after..."
      },
      successMessage: "Thanks for the feedback!",
      errorMessage: "Something went wrong. Please try again."
    }
  }}
/>
```

### Events and callbacks

Use callbacks to connect analytics, telemetry, or UI behaviors.

```tsx
<Boop
  options={{
    callbacks: {
      onOpen: () => track("boop_open"),
      onClose: () => track("boop_close"),
      onFieldChange: (field, value) => setLastEdited(field),
      onValidationError: (field, message) =>
        console.warn(`${field} validation failed: ${message}`),
      onSubmitStart: () => track("boop_submit_start"),
      onSubmitSuccess: (response) => track("boop_submit_success", response.status),
      onSubmitError: (error) => track("boop_submit_error", error.message)
    }
  }}
/>
```

### Custom thank-you renderer

Replace the default success message with a custom render, including links or
next steps.

```tsx
<Boop
  options={{
    onSuccessRenderer: (payload, helpers) => (
      <div>
        <h3>Thanks {payload.name || "there"}!</h3>
        <p>We read every message.</p>
        <a href="/changelog">See recent fixes</a>
        <div>
          <button onClick={helpers.reset}>Send another</button>
          <button onClick={helpers.close}>Close</button>
        </div>
      </div>
    )
  }}
/>
```

### Custom styles

You can style Boop in three ways, and mix them together:

- `classNames` to attach CSS classes (ideal for frameworks)
- `styleOverrides` to surgically override individual elements
- `theme` to control colors via CSS variables

If you want full control, set `useDefaultStyles: false`.

#### Targetable class names

```
root, button, overlay, panel, header, form, field, textarea, submit, close, footer,
attribution, errorMessageContainer, errorMessage
```

#### Style override keys

```
root, button, buttonFixed, overlay, overlayCenter, panel, panelWidget, header, form,
field, input, textarea, submit, close, footer, attribution, errorMessageContainer,
errorMessage
```

#### Theme variables

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
--boop-error-message-bg
```

#### Example: Bootstrap

```tsx
<Boop
  options={{
    style: {
      useDefaultStyles: false,
      classNames: {
        panel: "card shadow",
        header: "card-header d-flex justify-content-between align-items-center",
        form: "card-body d-flex flex-column gap-3",
        field: "form-group",
        textarea: "form-control",
        submit: "btn btn-primary",
        close: "btn-close",
        errorMessage: "alert alert-danger py-2",
        footer: "card-footer small text-muted"
      },
      theme: {
        "--boop-button": "var(--bs-primary)",
        "--boop-button-text": "var(--bs-white)"
      }
    }
  }}
/>
```

#### Example: shadcn/tailwind

```tsx
<Boop
  options={{
    style: {
      useDefaultStyles: false,
      classNames: {
        panel: "bg-background text-foreground border rounded-xl shadow-xl",
        header: "flex items-center justify-between",
        form: "flex flex-col gap-3",
        field: "text-sm text-muted-foreground flex flex-col gap-1",
        textarea:
          "min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm",
        submit:
          "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-primary-foreground",
        close: "text-muted-foreground hover:text-foreground",
        errorMessage: "rounded-md bg-destructive/10 px-3 py-2 text-destructive",
        footer: "text-xs text-muted-foreground"
      },
      theme: {
        "--boop-background": "hsl(var(--background))",
        "--boop-panel": "hsl(var(--card))",
        "--boop-text": "hsl(var(--foreground))",
        "--boop-muted-text": "hsl(var(--muted-foreground))",
        "--boop-border": "hsl(var(--border))",
        "--boop-button": "hsl(var(--primary))",
        "--boop-button-text": "hsl(var(--primary-foreground))",
        "--boop-input-bg": "hsl(var(--background))",
        "--boop-overlay": "rgba(15, 23, 42, 0.35)"
      }
    }
  }}
/>
```

### Links and custom content

Boop does not render user-entered message content as HTML. If you need links or
rich content in the UI, use `onSuccessRenderer` or `slots.footer` to render the
elements you want.

### Footer slot

```tsx
<Boop
  options={{
    slots: {
      footer: (
        <div>
          Questions? <a href="mailto:support@yourapp.com">Email us</a>
        </div>
      )
    }
  }}
/>
```

### URL resolution (SSR and custom routing)

By default, Boop uses `window.location.href` when available. Override this in
SSR or if your routing strategy needs a custom URL.

```tsx
import { defaultUrlResolver } from "@shtbox/boop";

<Boop options={{ urlResolver: defaultUrlResolver }} />;
```

### Stack trace capture

Enable `includeStackTrace` to attach recent console history and stack snapshot
to `metadata.stack`. If you already send `metadata.stack`, Boop will not
overwrite it.

```tsx
<Boop options={{ includeStackTrace: true }} />
```

### Programmatic submit (provider)

Use `submitFeedback` to send feedback without opening the UI. This uses the
provider options and you can pass overrides if needed.

```tsx
const { submitFeedback } = useBoop();

await submitFeedback(
  {
    message: "Love this!",
    email: "ada@example.com"
  },
  {
    metadata: { plan: "pro" }
  }
);
```

### Programmatic field values

Set fields programmatically via options, provider actions, or a ref.

```tsx
<Boop
  options={{
    fieldValues: { email: "ada@example.com" },
    fieldValuesMode: "initial"
  }}
/>
```

```tsx
const { setFieldValue, setFieldValues } = useBoop();

setFieldValue("name", "Ada");
setFieldValues({ email: "ada@example.com", message: "Hello!" });
```

```tsx
import { Boop, type BoopHandle } from "@shtbox/boop";

const ref = useRef<BoopHandle | null>(null);

<Boop ref={ref} options={{ projectId: "your-project-id" }} />;

ref.current?.setFieldValue("message", "Hello!");
```

`fieldValuesMode` defaults to `"initial"` which only fills empty fields, keeping
user edits intact. Use `"controlled"` to always drive the form values.

### Payload

The widget submits the following JSON payload:

````JSON
{
  "url": "https://your-site.com/page",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "message": "Love the new flow!",
  "metadata": {}
}
````
## License

MIT © Shtbox.io