import { defineCard } from "../define.js";

// EDHREC rank 14426.
//
// Jori En's `nthEachTurn: 2`: every spell you cast this turn counts, the
// Lightsmith itself included (the ruling), and the trigger resolves before
// the spell, whatever becomes of it.

const CAST_TEXT = "Whenever you cast your second spell each turn, put a +1/+1 counter on this creature and draw a card.";

export default defineCard({
  name: "Sunstar Lightsmith",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
