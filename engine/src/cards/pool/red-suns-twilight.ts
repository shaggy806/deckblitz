import { defineCard } from "../define.js";

// EDHREC rank 7198. The copies are of the artifacts as they last existed on
// the battlefield (rule 608.2h): a destroyed token or a destroyed copy is
// copied as what it was, and one that wasn't destroyed (indestructible,
// regenerated, an illegal target) gives no token.
export default defineCard({
  name: "Red Sun's Twilight",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy up to X target artifacts. If X is 5 or more, for each artifact destroyed this way, create a token that's a copy of it. Those tokens gain haste. Exile them at the beginning of the next end step.",
  targets: [{ kind: "any-number", of: "artifact", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "destroy", target: 0 } },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 5 } },
        then: {
          kind: "create-token-copy",
          of: { thisWay: "destroyed" },
          count: 1,
          who: "you",
          gains: { keywords: ["haste"] },
          exileAtEndStep: true,
        },
      },
    ],
  },
});
