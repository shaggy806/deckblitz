import { defineCard } from "../define.js";

export default defineCard({
  name: "Mages' Contest",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "You and target spell's controller bid life. You start the bidding with a bid of 1. In turn order, each player may top the high bid. The bidding ends if the high bid stands. The high bidder loses life equal to the high bid. If you win the bidding, counter that spell.",
  targets: ["spell"],
  effect: {
    kind: "bid-life",
    who: { youAndControllerOfTarget: 0 },
    opening: 1,
    then: { kind: "lose-life", amount: "x", who: "that-player" },
    ifYouWin: { kind: "counter", target: 0 },
  },
});
