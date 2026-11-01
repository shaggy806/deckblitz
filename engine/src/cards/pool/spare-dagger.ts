import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// "Spare Dagger" in the granted trigger is the Equipment that grants it
// (rule 201.5a); the reflexive ability triggers only once it's been
// sacrificed (603.12), and the equipped creature deals its damage.

const GRANTED =
  "Whenever this creature attacks, you may sacrifice Spare Dagger. When you do, this creature deals 1 damage to any target.";
const TEXT = `Equipped creature gets +1/+0 and has "${GRANTED}"`;

export default defineCard({
  name: "Spare Dagger",
  manaCost: "{1}",
  colors: [],
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
            prompt: "Sacrifice Spare Dagger?",
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
                    effect: { kind: "damage", amount: 1, target: 0 },
                    text: "When you do, this creature deals 1 damage to any target.",
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
