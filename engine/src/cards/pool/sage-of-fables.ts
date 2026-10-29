import { defineCard } from "../define.js";

// EDHREC rank 8249.
//
// Rulings:
//   [2008-04-01] The effects from more than one Sage of Fables are cumulative.
//   [2008-04-01] If Sage of Fables enters at the same time as another Wizard (due to Living End,
//     for example), that creature doesn't get a +1/+1 counter.
//   [2008-04-01] The creature gets the counter if it would enter under your control.
//   [2008-04-01] If a Wizard would normally enter with a certain number of +1/+1 counters on it,
//     it enters with that many +1/+1 counters plus one on it instead.

const ENTERS_TEXT = "Each other Wizard creature you control enters with an additional +1/+1 counter on it.";

export default defineCard({
  name: "Sage of Fables",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n{2}, Remove a +1/+1 counter from a creature you control: Draw a card.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", subtype: "Wizard", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        removeCounter: { kind: "+1/+1", count: 1, from: { type: "creature" } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, Remove a +1/+1 counter from a creature you control: Draw a card.",
    },
  ],
});
