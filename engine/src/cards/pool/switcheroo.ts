import { defineCard } from "../define.js";

// Rule 701.12b: nothing happens if one player controls both, or if either is
// an illegal target as it resolves (the rulings).
export default defineCard({
  name: "Switcheroo",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exchange control of two target creatures.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: { kind: "exchange-control", objects: [0, 1] },
});
