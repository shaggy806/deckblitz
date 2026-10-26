import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 25883.
//
// Rulings:
//   [2008-04-01] A permanent that's both a land and a creature may be chosen as both of this
//     ability's targets.
//   [2008-04-01] Both a creature and a land must be targeted when the ability triggers. If there
//     aren't enough legal targets, the ability doesn't go on the stack and Goblin Grenadiers can't
//     be sacrificed this way.
//
// Necrite's shape with two target slots, each its own "target" word, so one
// permanent may fill both.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may sacrifice it. If you do, destroy target creature and target land.";

export default defineCard({
  name: "Goblin Grenadiers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: ["creature", "land"],
      effect: {
        kind: "may",
        prompt: "Sacrifice Goblin Grenadiers to destroy the targeted creature and land?",
        effect: {
          kind: "sacrifice-source",
          then: {
            kind: "sequence",
            effects: [
              { kind: "destroy", target: 0 },
              { kind: "destroy", target: 1 },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
