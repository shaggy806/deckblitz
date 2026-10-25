import { defineCard } from "../define.js";

// Conspiracy (CNS). EDHREC rank 10714.
//
// Plea for Power's shape: "death" is option 0; "torture gets more votes or the vote is tied"
// is the `else`.
//
// Rulings:
//   [2014-05-29] The phrase "the vote is tied" refers only to when there is more than one choice
//     that received the most votes.
//   [2014-05-29] If death gets more votes, each opponent chooses and sacrifices a creature they
//     control. None of these creatures are targeted.

const TEXT =
  "Will of the council — Starting with you, each player votes for death or torture. If death gets more votes, each opponent sacrifices a creature of their choice. If torture gets more votes or the vote is tied, each opponent loses 4 life.";

export default defineCard({
  name: "Tyrant's Choice",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { options: ["death", "torture"] } },
      {
        kind: "conditional",
        condition: { kind: "vote-won", option: 0 },
        then: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
        else: { kind: "lose-life", amount: 4, who: "each-opponent" },
      },
    ],
  },
});
