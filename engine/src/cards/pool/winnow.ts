import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29811.
//
// "Another permanent with the same name is on the battlefield", whoever
// controls it, read as the spell resolves: one of yours other than the
// target; or, the target being yours, one of an opponent's; or two among
// your opponents' (the target, being theirs, one of them).

const SAME_NAME = { sameNameAsTarget: 0 } as const;

export default defineCard({
  name: "Winnow",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target nonland permanent if another permanent with the same name is on the battlefield.\nDraw a card.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: {
          kind: "any",
          of: [
            { kind: "controls", filter: SAME_NAME, atLeast: 1, excludeTarget: 0 },
            { kind: "opponents-control-total", filter: SAME_NAME, atLeast: 2 },
            {
              kind: "all",
              of: [
                { kind: "target", index: 0, filter: { controlledBy: "you" } },
                { kind: "opponents-control-total", filter: SAME_NAME, atLeast: 1 },
              ],
            },
          ],
        },
        then: { kind: "destroy", target: 0 },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
