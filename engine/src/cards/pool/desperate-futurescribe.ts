import { defineCard } from "../define.js";

// EDHREC rank 28137.
//
// Rulings:
//   [2026-08-21] If you have both scried and surveilled this turn, you will still put only one
//     +1/+1 counter on that creature.

export default defineCard({
  name: "Desperate Futurescribe",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Kor", "Scout"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of combat on your turn, another target creature you control gets +1/+1 until end of turn. If you've scried or surveilled this turn, put a +1/+1 counter on that creature instead.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      // "Instead": one or the other, decided as it resolves.
      effect: {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "scried-or-surveilled", who: "you", atLeast: 1 },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        else: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, another target creature you control gets +1/+1 until end of turn. If you've scried or surveilled this turn, put a +1/+1 counter on that creature instead.",
    },
  ],
});
