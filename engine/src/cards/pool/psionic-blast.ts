import { defineCard } from "../define.js";

export default defineCard({
  name: "Psionic Blast",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Psionic Blast deals 4 damage to any target and 2 damage to you.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "damage", amount: 2, who: "you" }],
  },
});
