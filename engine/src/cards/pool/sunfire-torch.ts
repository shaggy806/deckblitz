import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const GRANTED =
  "Whenever this creature attacks, you may sacrifice Sunfire Torch. When you do, this creature deals 2 damage to any target.";
const TEXT = `Equipped creature gets +1/+0 and has "${GRANTED}"`;

export default defineCard({
  name: "Sunfire Torch",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Sacrifice Sunfire Torch?",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-target", target: "granter" },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "sacrificed" },
                  then: {
                    kind: "reflexive-trigger",
                    targets: ["any-target"],
                    effect: { kind: "damage", amount: 2, target: 0 },
                    text: "When you do, this creature deals 2 damage to any target.",
                  },
                },
              ],
            },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{1}")],
});
