import { defineCard } from "../define.js";

// EDHREC rank 5451.

export default defineCard({
  name: "Oblation",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "The owner of target nonland permanent shuffles it into their library, then draws two cards.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-into-library", target: 0 },
      { kind: "draw", amount: 2, who: { ownerOf: 0 } },
    ],
  },
});
