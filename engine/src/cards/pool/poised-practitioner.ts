import { defineCard } from "../define.js";

// EDHREC rank 18989.
//
// Rulings:
//   [2025-04-04] Spells that were cast before a permanent with flurry count. If that permanent was
//     the first spell you cast that turn, the next spell you cast that turn is your second spell.

const FLURRY_TEXT =
  "Flurry — Whenever you cast your second spell each turn, put a +1/+1 counter on this creature. Scry 1.";

export default defineCard({
  name: "Poised Practitioner",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 3,
  text: `${FLURRY_TEXT} (Look at the top card of your library. You may put that card on the bottom.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: FLURRY_TEXT,
    },
  ],
});
