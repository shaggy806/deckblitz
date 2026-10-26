import { defineCard } from "../define.js";

// EDHREC rank 16594.
//
// Rulings:
//   [2008-08-01] If permanents you control become untapped during your untap step, Wake Thresher's
//     ability will trigger that many times; those abilities wait to be put on the stack until
//     your upkeep starts.

const TEXT = "Whenever a permanent you control becomes untapped, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Wake Thrasher",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "you-control" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
