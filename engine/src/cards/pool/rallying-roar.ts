import { defineCard } from "../define.js";

// EDHREC rank 23827. Rally to Battle's shape.
//
// Rulings:
//   [2017-09-29] Rallying Roar affects only creatures you control at the time it resolves.

export default defineCard({
  name: "Rallying Roar",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +1/+1 until end of turn. Untap them.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
    ],
  },
});
