import { defineCard } from "../define.js";

export default defineCard({
  name: "Courier's Briefcase",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Treasure"],
  text: "When this artifact enters, create a 1/1 green and white Citizen creature token.\n{T}, Sacrifice this artifact: Add one mana of any color.\n{W}{U}{B}{R}{G}, {T}, Sacrifice this artifact: Draw three cards.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}, Sacrifice this artifact: Add one mana of any color.",
    },
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: "{W}{U}{B}{R}{G}, {T}, Sacrifice this artifact: Draw three cards.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Citizen Token", count: 1 },
      resolve: null,
      text: "When this artifact enters, create a 1/1 green and white Citizen creature token.",
    },
  ],
});
