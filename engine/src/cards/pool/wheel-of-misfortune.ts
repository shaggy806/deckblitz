import type { StaticCondition } from "../define.js";
import { defineCard } from "../define.js";

// The numbers are a secret `vote` of `for: { number }`: asked in turn from the
// active player, none shown until the last is in. What follows reads them,
// the highest however many chose it (the ruling's 4, 7, 7, 7).
const NOT_LOWEST: StaticCondition = {
  kind: "not",
  of: { kind: "voted-number", who: "that-player", is: "lowest" },
};

export default defineCard({
  name: "Wheel of Misfortune",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Each player secretly chooses a number 0 or greater, then all players reveal those numbers simultaneously and determine the highest and lowest numbers revealed this way. " +
    "Wheel of Misfortune deals damage equal to the highest number to each player who chose that number. " +
    "Each player who didn't choose the lowest number discards their hand, then draws seven cards.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, secret: true, for: { number: { min: 0 } } },
      {
        kind: "damage",
        amount: { votedNumber: "highest" },
        who: "each-player",
        whoseIf: { kind: "voted-number", who: "that-player", is: "highest" },
      },
      {
        kind: "for-each-player",
        who: "each-player",
        whoIf: NOT_LOWEST,
        simultaneous: true,
        effect: { kind: "discard-hand", who: "that-player" },
      },
      {
        kind: "for-each-player",
        who: "each-player",
        whoIf: NOT_LOWEST,
        effect: { kind: "draw", amount: 7, who: "that-player" },
      },
    ],
  },
});
