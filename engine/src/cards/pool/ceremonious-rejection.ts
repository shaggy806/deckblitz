import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 23250.
export default defineCard({
  name: "Ceremonious Rejection",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target colorless spell.",
  targets: [{ kind: "spell", filter: { colorless: true } }],
  effect: { kind: "counter", target: 0 },
});
