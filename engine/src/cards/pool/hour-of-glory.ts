import { defineCard } from "../define.js";

// "Was a God": the creature as it last existed on the battlefield (rule
// 608.2h), and "its controller" as well. No search, so every card of the name
// in the revealed hand goes.

export default defineCard({
  name: "Hour of Glory",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature. If that creature was a God, its controller reveals their hand and exiles all cards from it with the same name as that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "God" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "reveal-hand", who: { controllerOfTarget: 0 } },
            {
              kind: "exile-graveyard",
              target: { controllerOfTarget: 0 },
              filter: { sameNameAsTarget: 0 },
              fromHand: "only",
            },
          ],
        },
      },
    ],
  },
});
