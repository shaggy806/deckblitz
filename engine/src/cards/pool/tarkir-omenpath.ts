import { defineCard } from "../define.js";

// Playtest card. An Omen spell is one with the Omen subtype (an omen card
// cast as its Omen half, rule 720).

export default defineCard({
  name: "Tarkir Omenpath",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast Omen spells.\n{1}, {T}: Add one mana of any color.",
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
        spendOnly: { spell: { subtype: "Omen" }, text: "Spend this mana only to cast Omen spells." },
      },
      resolve: null,
      text: "{T}: Add one mana of any color. Spend this mana only to cast Omen spells.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{1}, {T}: Add one mana of any color.",
    },
  ],
});
