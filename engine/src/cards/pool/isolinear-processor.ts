import { defineCard } from "../define.js";

// EDHREC rank 29011.

export default defineCard({
  name: "Isolinear Processor",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {C}. Spend this mana only to cast an artifact spell or activate an ability of an artifact source.\n{2}, {T}: Draw a card, then discard a card.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spendOnly: {
          spell: { type: "artifact" },
          abilityOf: { type: "artifact" },
          abilityOfAnyZone: true,
          text: "Spend this mana only to cast an artifact spell or activate an ability of an artifact source.",
        },
      },
      resolve: null,
      text: "{T}: Add {C}. Spend this mana only to cast an artifact spell or activate an ability of an artifact source.",
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}, {T}: Draw a card, then discard a card.",
    },
  ],
});
