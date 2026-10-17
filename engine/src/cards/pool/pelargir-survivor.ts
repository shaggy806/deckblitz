import { defineCard } from "../define.js";

// EDHREC rank 15215.

export default defineCard({
  name: "Pelargir Survivor",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 1,
  toughness: 3,
  text: "{T}: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.\n{5}{U}, {T}: Target player mills three cards. (They put the top three cards of their library into their graveyard.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast an instant or sorcery spell.",
        },
      },
      resolve: null,
      text: "{T}: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.",
    },
    {
      cost: { mana: "{5}{U}", tap: true },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 3 },
      resolve: null,
      text: "{5}{U}, {T}: Target player mills three cards.",
    },
  ],
});
