import { defineCard } from "../define.js";

// EDHREC rank 19725.
//
// Rulings:
//   [2025-07-25] Illvoi Operative’s ability will count any spells you’ve cast this turn, which may
//     include Illvoi Operative itself. It doesn’t matter if the other spells resolved, didn’t
//     resolve, were countered, or are still on the stack. If Illvoi Operative was the first spell
//     you cast this turn, the next spell you cast this turn is your second spell. Similarly, if
//     Illvoi Operative was the second spell you cast this turn, its ability won’t trigger and it
//     won’t get a +1/+1 counter.
//   [2025-07-25] Illvoi Operative’s ability resolves before the spell that caused it to trigger.
//     It resolves even if that spell is countered or otherwise leaves the stack without resolving.

const CAST_TEXT = "Whenever you cast your second spell each turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Illvoi Operative",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish", "Rogue"],
  power: 2,
  toughness: 1,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
