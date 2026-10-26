import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 14351.
//
// Rulings:
//   [2013-07-01] You choose the creatures to tap as Devout Invocation resolves. Once it starts
//     resolving, no player can respond to you tapping the creatures.

const UNTAPPED_CREATURE: CardFilter = { type: "creature", controlledBy: "you", tapped: false };

export default defineCard({
  name: "Devout Invocation",
  manaCost: "{6}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Tap any number of untapped creatures you control. Create a 4/4 white Angel creature token with flying for each creature tapped this way.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: UNTAPPED_CREATURE,
        min: 0,
        upTo: { countOf: UNTAPPED_CREATURE },
        then: { kind: "tap", target: 0 },
        prompt: "Tap any number of untapped creatures you control",
      },
      { kind: "create-token", token: "4/4 Angel Token", count: { thisWay: "tapped" } },
    ],
  },
});
