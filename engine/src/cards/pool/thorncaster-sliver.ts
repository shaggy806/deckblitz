import { defineCard } from "../define.js";

const GRANTED_TEXT = "Whenever this creature attacks, it deals 1 damage to any target.";

export default defineCard({
  name: "Thorncaster Sliver",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
    },
  ],
});
