import { defineCard } from "../define.js";

// EDHREC rank 20630.
//
// Sheriff of Safe Passage's count, without its extra counter.
//
// Rulings:
//   [2019-07-12] If Squad Captain somehow enters the battlefield at the same time as another
//     creature you control, it doesn't count that other creature. It counts only creatures that
//     are already on the battlefield.

export default defineCard({
  name: "Squad Captain",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance (Attacking doesn't cause this creature to tap.)\nThis creature enters with a +1/+1 counter on it for each other creature you control.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { countOf: { type: "creature", controlledBy: "you" }, excludeSelf: true },
        },
      },
      text: "This creature enters with a +1/+1 counter on it for each other creature you control.",
    },
  ],
});
