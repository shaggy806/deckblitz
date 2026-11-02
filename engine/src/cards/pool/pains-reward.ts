import { defineCard } from "../define.js";

export default defineCard({
  name: "Pain's Reward",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player may bid life. You start the bidding with a bid of any number. In turn order, each player may top the high bid. The bidding ends if the high bid stands. The high bidder loses life equal to the high bid and draws four cards.",
  targets: [],
  effect: {
    kind: "bid-life",
    who: "each-player",
    opening: "any",
    then: {
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: "x", who: "that-player" },
        { kind: "draw", amount: 4, who: "that-player" },
      ],
    },
  },
});
