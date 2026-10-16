import { defineCard } from "../define.js";

// EDHREC rank 16196.

// "Then if you control a Rat" is checked after the discard, as it resolves.
export default defineCard({
  name: "Psychic Whorl",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards two cards. Then if you control a Rat, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Rat" }, atLeast: 1 },
        then: { kind: "surveil", amount: 2 },
      },
    ],
  },
});
