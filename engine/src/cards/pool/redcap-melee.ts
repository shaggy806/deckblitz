import { defineCard } from "../define.js";

// EDHREC rank 26333.
//
// The Black Arrow's "if a [filter] is dealt damage this way": the damage must
// have been dealt (not prevented) and the permanent nonred as it was dealt —
// still on the battlefield, since nothing dies until the spell has resolved.

export default defineCard({
  name: "Redcap Melee",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Redcap Melee deals 4 damage to target creature or planeswalker. If a nonred permanent is dealt damage this way, you sacrifice a land.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "damage-dealt-this-way", to: 0 },
            { kind: "target", index: 0, filter: { notColors: ["R"] } },
          ],
        },
        then: { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
      },
    ],
  },
});
