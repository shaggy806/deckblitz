import { defineCard } from "../define.js";

export default defineCard({
  name: "Arcane Endeavor",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Roll two d8 and choose one result. Draw cards equal to that result. Then you may cast an instant or sorcery spell with mana value less than or equal to the other result from your hand without paying its mana cost.",
  effect: {
    kind: "roll-dice",
    sides: 8,
    count: 2,
    then: {
      kind: "choose-value",
      value: "roll-result",
      then: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: "x" },
          {
            kind: "cast-now",
            from: "hand",
            free: true,
            spell: {
              typesAnyOf: ["instant", "sorcery"],
              manaValue: { op: "lte", n: { amount: { roll: "other" } } },
            },
          },
        ],
      },
    },
  },
});
