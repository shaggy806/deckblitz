import { defineCard } from "../define.js";

// EDHREC rank 25862.
//
// The land is the source of the damage (Fire Whip's shape on a land) — so,
// per the ruling, a colorless source.

const GRANTED = "{T}: This land deals 1 damage to any target.";
const TEXT = `Enchanted land has "${GRANTED}"`;

export default defineCard({
  name: "Barbed Field",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
