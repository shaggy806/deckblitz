import { defineCard } from "../define.js";

const SACRIFICE = "At the beginning of the end step, if you don't control a planeswalker, sacrifice this creature.";

// Clone Legion's shape: each creature that player controls in turn at slot 1,
// copied as it is (a copy of a copy is that copy, a token its original).
export default defineCard({
  name: "Face Yourself",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `For each creature target player controls, create a token that's a copy of that creature, except it has haste and "${SACRIFICE}"`,
  targets: ["player"],
  effect: {
    kind: "for-each-permanent",
    filter: { type: "creature", controlledBy: "you" },
    controlledByTarget: 0,
    as: 1,
    effect: {
      kind: "create-token-copy",
      of: 1,
      count: 1,
      who: "you",
      exceptions: {
        keywords: ["haste"],
        triggered: [
          {
            trigger: { on: "step-begins", step: "end", who: "any" },
            condition: { kind: "not", of: { kind: "controls", filter: { type: "planeswalker" }, atLeast: 1 } },
            targets: [],
            effect: { kind: "sacrifice-source" },
            resolve: null,
            text: SACRIFICE,
          },
        ],
      },
    },
  },
});
