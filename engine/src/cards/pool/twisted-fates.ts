import { defineCard } from "../define.js";

// EDHREC rank 29497.
//
// Two targets, so either half still happens if only the other's target has
// gone illegal (rule 608.2b).

export default defineCard({
  name: "Twisted Fates",
  manaCost: "{2}{W}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Destroy target nonland permanent. Put a +1/+1 counter on each creature target player controls.",
  targets: ["nonland-permanent", "player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        controlledByTarget: 1,
      },
    ],
  },
});
