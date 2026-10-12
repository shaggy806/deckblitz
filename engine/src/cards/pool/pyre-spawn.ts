import { defineCard } from "../define.js";

export default defineCard({
  name: "Pyre Spawn",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 4,
  text: "When this creature dies, it deals 3 damage to any target.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "When this creature dies, it deals 3 damage to any target.",
    },
  ],
});
