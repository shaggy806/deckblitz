import { defineCard } from "../define.js";

// EDHREC rank 8408.

export default defineCard({
  name: "Spell Snare",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell with mana value 2.",
  targets: [{ kind: "spell", filter: { manaValue: { op: "eq", n: 2 } } }],
  effect: { kind: "counter", target: 0 },
});
