import { defineCard } from "../define.js";

// EDHREC rank 10741.

// Bant Charm's tuck, then "unless you control a Villain" read as it resolves.
export default defineCard({
  name: "The Spot's Portal",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put target creature on the bottom of its owner's library. You lose 2 life unless you control a Villain.",
  targets: [{ kind: "permanent", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-bottom-of-library", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Villain" }, atLeast: 1 } },
        then: { kind: "lose-life", amount: 2 },
      },
    ],
  },
});
