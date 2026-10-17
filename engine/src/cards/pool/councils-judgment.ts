import { defineCard } from "../define.js";

// EDHREC rank 3558.
//
// A vote for permanents (rule 701.38b), not a target: a hexproof or
// protected permanent can be voted for and exiled. Every permanent tied for
// the most votes is exiled, all at once.

const TEXT =
  "Will of the council — Starting with you, each player votes for a nonland permanent you don't control. Exile each permanent with the most votes or tied for most votes.";

export default defineCard({
  name: "Council's Judgment",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { permanent: { notTypes: ["land"], controlledBy: "opponent" } } },
      { kind: "for-each-voted", which: "most", simultaneous: true, effect: { kind: "exile", target: 0 } },
    ],
  },
});
