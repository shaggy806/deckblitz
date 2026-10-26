import { defineCard } from "../define.js";

const GRANTED_TEXT = "{R}, {T}: This creature deals 1 damage to any target.";

export default defineCard({
  name: "Titan of Eternal Fire",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 6,
  text: `Each Human creature you control has "${GRANTED_TEXT}"`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Human" },
      grantsActivated: [
        {
          cost: { mana: "{R}", tap: true },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Each Human creature you control has "${GRANTED_TEXT}"`,
    },
  ],
});
