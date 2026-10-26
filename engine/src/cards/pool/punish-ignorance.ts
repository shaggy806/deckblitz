import { defineCard } from "../define.js";

// EDHREC rank 24315. Shards of Alara.
//
// Rulings:
//   [2008-10-01] You may target a spell that "can't be countered" with Punish Ignorance. If you
//     do, the first part of Punish Ignorance's effect won't do anything, but the life-loss and
//     life-gain effects will still work.

export default defineCard({
  name: "Punish Ignorance",
  manaCost: "{W}{U}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["instant"],
  text: "Counter target spell. Its controller loses 3 life and you gain 3 life.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "lose-life", amount: 3, toControllerOfTarget: 0 },
      { kind: "gain-life", amount: 3 },
    ],
  },
});
