import { defineCard } from "../define.js";

// EDHREC rank 14691.
// Makes Lizard → "Lizard Token".
//
// Martial Coup's shape: each threshold reads the X chosen as it was cast.

const TEXT =
  "Subterranean Tremors deals X damage to each creature without flying. If X is 4 or more, destroy all artifacts. If X is 8 or more, create an 8/8 red Lizard creature token.";

export default defineCard({
  name: "Subterranean Tremors",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: "x" },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 4 } },
        then: { kind: "destroy-all", filter: { type: "artifact" } },
      },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 8 } },
        then: { kind: "create-token", token: "Lizard Token", count: 1 },
      },
    ],
  },
});
