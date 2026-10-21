import { defineCard } from "../define.js";

// EDHREC rank 13348. Dominaria.
//
// Rulings:
//   [2018-04-27] If the target creature is an illegal target by the time Settle the Score tries to
//     resolve, the spell doesn't resolve. You won't put loyalty counters on a planeswalker.
//   [2018-04-27] Both loyalty counters must be put onto the same planeswalker.
//   [2018-04-27] You don't choose which planeswalker receives loyalty counters until Settle the
//     Score resolves. If you don't control a planeswalker, you'll simply exile the target creature
//     and not put loyalty counters on anything.

export default defineCard({
  name: "Settle the Score",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile target creature. Put two loyalty counters on a planeswalker you control.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "choose-permanents",
        filter: { type: "planeswalker", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "add-counter", target: 0, counter: "loyalty", amount: 2 },
        prompt: "Choose a planeswalker you control to put two loyalty counters on",
      },
    ],
  },
});
