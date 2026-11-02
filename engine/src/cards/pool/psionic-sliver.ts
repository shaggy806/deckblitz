import { defineCard } from "../define.js";

const GRANTED_TEXT = "{T}: This creature deals 2 damage to any target and 3 damage to itself.";
const TEXT = `All Sliver creatures have "${GRANTED_TEXT}"`;

// "This creature" and "itself" are the Sliver with the ability, not the one that
// gave it. Summoning sickness applies to each Sliver's own {T}.
export default defineCard({
  name: "Psionic Sliver",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["any-target"],
          effect: {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "damage", amount: 2, target: 0 },
              { kind: "damage", amount: 3, target: "source" },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
