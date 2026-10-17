import { defineCard } from "../define.js";

// EDHREC rank 11043.
//
// "3 damage for each consequences vote" is one instance of damage, three
// times the votes.

const TEXT =
  "Secret council — Each player secretly votes for truth or consequences, then those votes are revealed. You draw cards equal to the number of truth votes. Then choose an opponent at random. Truth or Consequences deals 3 damage to that player for each consequences vote.";

export default defineCard({
  name: "Truth or Consequences",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { options: ["truth", "consequences"] }, secret: true },
      { kind: "draw", amount: { votesFor: 0 } },
      {
        kind: "choose-opponent",
        random: true,
        then: { kind: "damage", amount: { product: [3, { votesFor: 1 }] }, who: "that-player" },
      },
    ],
  },
});
