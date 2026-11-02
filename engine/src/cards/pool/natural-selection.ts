import { defineCard } from "../define.js";

export default defineCard({
  name: "Natural Selection",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Look at the top three cards of target player's library, then put them back in any order. You may have that player shuffle.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-and-choose", from: { target: 0 }, zone: "library", count: 3, min: 3, max: 3, destination: "library-top", leftover: "stay" },
      { kind: "may", prompt: "Have that player shuffle?", effect: { kind: "shuffle-library", target: 0 } },
    ],
  },
});
