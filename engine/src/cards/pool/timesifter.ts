import { defineCard } from "../define.js";

// EDHREC rank 13242.
//
// Every upkeep, everyone's: each player exiles their top card, and the one
// whose card has the greatest mana value (a land's is 0) takes an extra turn
// after this one. On a tie only the tied players go again, until one is left
// (its rulings); a player who exiles nothing can't win. Extra turns already
// made are taken most recent first (rule 500.7).

const TEXT =
  "At the beginning of each upkeep, each player exiles the top card of their library. The player who exiled the card with the greatest mana value takes an extra turn after this one. If two or more players' cards are tied for greatest, the tied players repeat this process until the tie is broken.";

export default defineCard({
  name: "Timesifter",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "exile-top-contest", then: { kind: "take-extra-turn", who: "that-player" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
