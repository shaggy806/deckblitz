import { defineCard } from "../define.js";

export default defineCard({
  name: "Price of Progress",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Price of Progress deals damage to each player equal to twice the number of nonbasic lands that player controls.",
  targets: [],
  effect: {
    kind: "damage",
    who: "each-player",
    amount: {
      product: [2, { countOf: { type: "land", notSupertype: "basic", controlledBy: "you" }, forEachPlayer: true }],
    },
  },
});
