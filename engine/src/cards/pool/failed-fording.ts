import { defineCard } from "../define.js";

// EDHREC rank 21638. Ruling: an illegal target means the spell doesn't
// resolve, so no surveil either (its only target).
export default defineCard({
  name: "Failed Fording",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target nonland permanent to its owner's hand. If you control a Desert, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
        then: { kind: "surveil", amount: 1 },
      },
    ],
  },
});
