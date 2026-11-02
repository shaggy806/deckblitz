import { defineCard } from "../define.js";

// A bid isn't a payment: a player may bid more life than they have, and loses
// it all (the ruling). Everyone declining leaves it to you, for nothing.
export default defineCard({
  name: "Illicit Auction",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player may bid life for control of target creature. You start the bidding with a bid of 0. In turn order, each player may top the high bid. The bidding ends if the high bid stands. The high bidder loses life equal to the high bid and gains control of the creature. (This effect lasts indefinitely.)",
  targets: ["creature"],
  effect: {
    kind: "bid-life",
    who: "each-player",
    opening: 0,
    then: {
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: "x", who: "that-player" },
        { kind: "gain-control", target: 0, untilEndOfTurn: false, who: "that-player" },
      ],
    },
  },
});
