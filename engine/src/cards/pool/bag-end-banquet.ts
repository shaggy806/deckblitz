import { defineCard } from "../define.js";

// Rulings:
//   Bag End Banquet's last ability is a mana ability.

export default defineCard({
  name: "Bag End Banquet",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, create three Food tokens.\n{T}: Add {C} for each Food you control.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: { countOf: { subtype: "Food", controlledBy: "you" } } },
      resolve: null,
      text: "{T}: Add {C} for each Food you control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 3 },
      resolve: null,
      text: "When this artifact enters, create three Food tokens.",
    },
  ],
});
