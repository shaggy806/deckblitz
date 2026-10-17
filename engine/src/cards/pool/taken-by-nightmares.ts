import { defineCard } from "../define.js";

// EDHREC rank 19632. Wilds of Eldraine. Whether you control an enchantment
// is checked as the scry would happen, after the exile (rule 608.2c) —
// Unlicensed Disintegration's shape.

export default defineCard({
  name: "Taken by Nightmares",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature. If you control an enchantment, scry 2.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
        then: { kind: "scry", amount: 2 },
      },
    ],
  },
});
