import { defineCard } from "../define.js";

export default defineCard({
  name: "Ranger's Firebrand",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Ranger's Firebrand deals 2 damage to any target. The Ring tempts you.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "the-ring-tempts-you" }],
  },
});
