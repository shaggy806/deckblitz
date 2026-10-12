import { defineCard } from "../define.js";

export default defineCard({
  name: "Blisterstick Shaman",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, it deals 1 damage to any target.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 1 damage to any target.",
    },
  ],
});
