import { defineCard } from "../define.js";

export default defineCard({
  name: "Stimulus Package",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: "When this enchantment enters, create two Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")\nSacrifice a Treasure: Create a 1/1 green and white Citizen creature token.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Treasure" } } },
      targets: [],
      effect: { kind: "create-token", token: "Citizen Token", count: 1 },
      resolve: null,
      text: "Sacrifice a Treasure: Create a 1/1 green and white Citizen creature token.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 2 },
      resolve: null,
      text: "When this enchantment enters, create two Treasure tokens.",
    },
  ],
});
