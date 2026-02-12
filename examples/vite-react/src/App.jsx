import { Boop } from "@shtbox/boop";

export default function App() {
  return (
    <main>
      <h1>Vite smoke</h1>
      <Boop options={{ endpoint: "https://example.com/feedback", attribution: false }} />
    </main>
  );
}
