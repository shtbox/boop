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
  <Boop
    endpoint="https://boop.shtbox.io"
    darkMode
    buttonPlacement="fixed"
    classNames={{
      root: "my-boop",
      panel: "my-boop-panel",
      button: "my-boop-button"
    }}
  />
);
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `endpoint` | `string` | `https://boop.shtbox.io` | API endpoint for feedback submissions. |
| `darkMode` | `boolean` | `false` | Toggles default dark theme styles. |
| `buttonPlacement` | `"inline" \| "fixed"` | `"inline"` | Place the button inline or fixed to bottom-right. |
| `fixedOffset` | `{ top?, right?, bottom?, left? }` | `{ right: 24, bottom: 24 }` | Offset for fixed button placement. |
| `buttonLabel` | `string` | `"Feedback"` | Label for the trigger button. |
| `panelVariant` | `"sidebar" \| "widget"` | `"sidebar"` | Panel layout style (sidebar or centered widget). |
| `panelWidth` | `number \| string` | `420` | Panel max width. |
| `panelMaxHeight` | `number \| string` | `"80vh"` | Panel max height (widget only by default). |
| `title` | `string` | `"Send feedback"` | Title shown in the panel header. |
| `labels` | `BoopLabels` | `undefined` | Override field/button labels. |
| `placeholders` | `BoopPlaceholders` | `undefined` | Override input placeholders. |
| `successMessage` | `string` | `"Thanks for the feedback!"` | Message shown on success. |
| `errorMessage` | `string` | `"Unable to submit feedback."` | Message shown on error. |
| `autoOpen` | `boolean` | `false` | Open the widget on mount. |
| `closeOnSubmit` | `boolean` | `false` | Close the widget after successful submit. |
| `metadata` | `Record<string, unknown>` | `undefined` | Extra metadata to send with submissions. |
| `children` | `ReactNode` | `undefined` | Custom content rendered in the footer area. |
| `onOpen` | `() => void` | `undefined` | Called when the widget opens. |
| `onClose` | `() => void` | `undefined` | Called when the widget closes. |
| `onSubmitStart` | `() => void` | `undefined` | Called when submit starts. |
| `onValidationError` | `(field, message) => void` | `undefined` | Called when validation fails. |
| `onFieldChange` | `(field, value) => void` | `undefined` | Called on input changes. |
| `onSubmitSuccess` | `(response: Response) => void` | `undefined` | Callback after a successful submit. |
| `onSubmitError` | `(error: Error) => void` | `undefined` | Callback after a failed submit. |
| `classNames` | `BoopClassNames` | `undefined` | Custom classes for widget parts. |
| `styleOverrides` | `Partial<Record<BoopStyleKey, CSSProperties>>` | `undefined` | Inline style overrides per part. |
| `theme` | `Record<string, string>` | `undefined` | CSS variable overrides (e.g. `--boop-button`). |
| `useDefaultStyles` | `boolean` | `true` | Disable built-in inline styles when false. |

### classNames

```
root, button, overlay, panel, header, form, field, textarea, submit, close, footer
```

### theme

Supported CSS variables:

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
