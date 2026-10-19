import { defineCard } from "../define.js";

export default defineCard({
  name: "Obsidian Obelisk",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters tapped.\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a multicolored spell.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: { spell: { multicolored: true }, text: "Spend this mana only to cast a multicolored spell." },
      },
      resolve: null,
      text: "{T}: Add one mana of any color. Spend this mana only to cast a multicolored spell.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
