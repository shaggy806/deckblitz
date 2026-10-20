import { defineCard } from "../define.js";

// With its one target illegal the spell doesn't resolve, so no Blood (the
// ruling).
export default defineCard({
  name: "Syphon Essence",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature or planeswalker spell. Create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "create-token", token: "Blood Token", count: 1 },
    ],
  },
});
