import { defineCard } from "../define.js";

export default defineCard({
  name: "Diamond Kaleidoscope",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{3}, {T}: Create a 0/1 colorless Prism artifact creature token.\nSacrifice a Prism token: Add one mana of any color.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Prism Token", count: 1 },
      resolve: null,
      text: "{3}, {T}: Create a 0/1 colorless Prism artifact creature token.",
    },
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Prism", token: true } } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "Sacrifice a Prism token: Add one mana of any color.",
    },
  ],
});
