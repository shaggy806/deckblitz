import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 29538.

export default defineCard({
  name: "Thoughtbind",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell with mana value 4 or less.",
  targets: [{ kind: "spell", filter: { manaValue: { op: "lte", n: 4 } } }],
  effect: { kind: "counter", target: 0 },
});
