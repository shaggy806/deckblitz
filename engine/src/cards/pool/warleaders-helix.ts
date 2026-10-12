import { defineCard } from "../define.js";

export default defineCard({
  name: "Warleader's Helix",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Warleader's Helix deals 4 damage to any target and you gain 4 life.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "gain-life", amount: 4 }],
  },
});
