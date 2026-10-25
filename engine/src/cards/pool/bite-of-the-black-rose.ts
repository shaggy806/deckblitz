import { defineCard } from "../define.js";

// Conspiracy. EDHREC rank 12016. Plea for Power's shape: the tie goes to
// psychosis, and the effect is the same for every opponent however they voted.

const TEXT =
  "Will of the council — Starting with you, each player votes for sickness or psychosis. If sickness gets more votes, creatures your opponents control get -2/-2 until end of turn. If psychosis gets more votes or the vote is tied, each opponent discards two cards.";

export default defineCard({
  name: "Bite of the Black Rose",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { options: ["sickness", "psychosis"] } },
      {
        kind: "conditional",
        condition: { kind: "vote-won", option: 0 },
        then: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "opponent" },
          power: -2,
          toughness: -2,
          duration: "end-of-turn",
        },
        else: { kind: "discard", target: "each-opponent", amount: 2 },
      },
    ],
  },
});
