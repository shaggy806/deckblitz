import { defineCard } from "../define.js";

// EDHREC rank 19634.
//
// The granted ability is the artifact's own (Goldspan Dragon's
// `grantsActivated`): "it" — the sacrificed artifact, as it last existed —
// deals the damage, and the count of Food Fights is read as the ability
// resolves. Each Food Fight grants its own copy of the ability.

const GRANTED_TEXT =
  "{2}, Sacrifice this artifact: It deals damage to any target equal to 1 plus the number of permanents named Food Fight you control.";
const TEXT = `Artifacts you control have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Food Fight",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", controlledBy: "you" } },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false, sacrifice: "self" },
          targets: ["any-target"],
          effect: {
            kind: "damage",
            target: 0,
            amount: { sum: [1, { countOf: { name: "Food Fight", controlledBy: "you" } }] },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
