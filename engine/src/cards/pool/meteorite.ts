import { defineCard } from "../define.js";

export default defineCard({
  name: "Meteorite",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, it deals 2 damage to any target.\n{T}: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this artifact enters, it deals 2 damage to any target.",
    },
  ],
});
