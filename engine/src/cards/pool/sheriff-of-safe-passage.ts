import { defineCard } from "../define.js";

// EDHREC rank 17877.
//
// Rulings:
//   [2024-04-12] If Sheriff of Safe Passage enters the battlefield under your control at the same
//     time as one or more other creatures, it doesn't take those creatures into consideration when
//     determining how many +1/+1 counters it enters the battlefield with.
//
// Boss's Chauffeur's shape: the count is read as it enters (rule 614.12), so
// creatures entering alongside it aren't counted.

const ENTER_TEXT =
  "This creature enters with a +1/+1 counter on it plus an additional +1/+1 counter on it for each other creature you control.";

export default defineCard({
  name: "Sheriff of Safe Passage",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 0,
  toughness: 0,
  plot: { cost: "{1}{W}" },
  text: `${ENTER_TEXT}\nPlot {1}{W} (You may pay {1}{W} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { sum: [1, { countOf: { type: "creature", controlledBy: "you" }, excludeSelf: true }] },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});
