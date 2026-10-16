import { defineCard } from "../define.js";

const TEXT = "Draw a card, then draw a card for each other instant and sorcery spell you've cast this turn.";

const INSTANTS_AND_SORCERIES = { castThisTurn: { typesAnyOf: ["instant", "sorcery"] } } as const;

// "Other": this spell, when it was cast (not a copy), is one of the instant
// and sorcery spells cast this turn, so it comes off the count (Thunder
// Salvo's shape). Spells countered or still on the stack count (the ruling).
export default defineCard({
  name: "Lock and Load",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  plot: { cost: "{3}{U}" },
  text: `${TEXT}\nPlot {3}{U} (You may pay {3}{U} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      {
        kind: "draw",
        amount: {
          ifCondition: { kind: "source", filter: { cast: true, castBy: "you" } },
          then: { difference: [INSTANTS_AND_SORCERIES, 1] },
          else: INSTANTS_AND_SORCERIES,
        },
      },
    ],
  },
});
