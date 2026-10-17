import { defineCard } from "../define.js";

// EDHREC rank 5684.

const TEXT =
  "Will of the council — Starting with you, each player votes for time or knowledge. If time gets more votes, take an extra turn after this one. If knowledge gets more votes or the vote is tied, draw three cards.";

export default defineCard({
  name: "Plea for Power",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { options: ["time", "knowledge"] } },
      {
        kind: "conditional",
        condition: { kind: "vote-won", option: 0 },
        then: { kind: "take-extra-turn" },
        else: { kind: "draw", amount: 3 },
      },
    ],
  },
});
