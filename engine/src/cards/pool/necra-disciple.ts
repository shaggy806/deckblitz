import { defineCard } from "../define.js";

export default defineCard({
  name: "Necra Disciple",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{G}, {T}: Add one mana of any color.\n{W}, {T}: Prevent the next 1 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{G}, {T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{W}", tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{W}, {T}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
  ],
});
