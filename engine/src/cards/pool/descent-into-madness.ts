import { defineCard } from "../define.js";

// EDHREC rank 24282.
//
// You choose first, then each other player in turn order, each knowing the
// permanents the players before chose and how many hand cards, but not
// which; then everything chosen is exiled at once (its ruling, rule 101.4)
// — the `exile-from-zones` effect. X is read as it resolves, from the
// counters it left the battlefield with if it's gone (its ruling, 608.2h).
// With X or fewer to give, a player exiles everything they control and their
// whole hand, this enchantment too (its ruling).

const TEXT =
  "At the beginning of your upkeep, put a despair counter on this enchantment, then each player exiles X permanents they control and/or cards from their hand, where X is the number of despair counters on this enchantment.";

export default defineCard({
  name: "Descent into Madness",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "despair", amount: 1 },
          {
            kind: "exile-from-zones",
            who: "each-player",
            zones: ["battlefield", "hand"],
            count: { countersOn: "source", counter: "despair" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
