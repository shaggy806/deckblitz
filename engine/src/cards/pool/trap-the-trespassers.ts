import { defineCard } from "../define.js";

// EDHREC rank 7910.
//
// Not a target: a creature with hexproof or protection can be voted for
// (the ruling), a tapped one too.

const TEXT =
  "Secret council — Each player secretly votes for a creature you don't control, then those votes are revealed. For each creature with one or more votes, put that many stun counters on it, then tap it.";

export default defineCard({
  name: "Trap the Trespassers",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { permanent: { type: "creature", controlledBy: "opponent" } }, secret: true },
      {
        kind: "for-each-voted",
        which: "voted",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "stun", amount: { votesReceived: 0 } },
            { kind: "tap", target: 0 },
          ],
        },
      },
    ],
  },
});
