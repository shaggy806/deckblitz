import { defineCard } from "../define.js";

export default defineCard({
  name: "Douse in Gloom",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Douse in Gloom deals 2 damage to target creature and you gain 2 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
  },
});
