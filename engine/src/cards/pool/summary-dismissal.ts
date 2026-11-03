import { defineCard } from "../define.js";

// Exiled, not countered: a spell that can't be countered goes too (the ruling).
export default defineCard({
  name: "Summary Dismissal",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Exile all other spells and counter all abilities.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-on-stack", spells: true, effect: { kind: "exile", target: 0 } },
      { kind: "for-each-on-stack", abilities: true, effect: { kind: "counter", target: 0 } },
    ],
  },
});
