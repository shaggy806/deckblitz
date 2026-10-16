import { defineCard } from "../define.js";

const TEXT = "You may discard a card or sacrifice a land. If you do, draw two cards.";

// K'un-Lun Warrior's shape: a "may", then which of the two. A choice that
// can't be carried out (no card in hand, no land — its ruling) does nothing,
// so it draws nothing.
export default defineCard({
  name: "Highway Robbery",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  plot: { cost: "{1}{R}" },
  text: `${TEXT}\nPlot {1}{R} (You may pay {1}{R} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  effect: {
    kind: "may",
    prompt: "Discard a card or sacrifice a land to draw two cards?",
    effect: {
      kind: "modal",
      minModes: 1,
      maxModes: 1,
      modes: [
        {
          text: "Discard a card.",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "discard", target: "you", amount: 1 },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "discarded" },
                then: { kind: "draw", amount: 2 },
              },
            ],
          },
        },
        {
          text: "Sacrifice a land.",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "sacrificed", who: "you" },
                then: { kind: "draw", amount: 2 },
              },
            ],
          },
        },
      ],
    },
  },
});
