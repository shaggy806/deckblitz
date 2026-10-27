import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 15056. Find the Path's granted-ability shape
// with Dry Spell's effect; the granted ability's source is the land.
//
// Rulings:
//   [2004-10-04] Land are normally colorless, so effects that care about the color of the damage's
//     source will not find a color.

const GRANT_TEXT = 'Enchanted land has "{T}: This land deals 1 damage to each creature and each player."';

export default defineCard({
  name: "Noxious Field",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GRANT_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
              { kind: "damage", amount: 1, who: "each-player" },
            ],
          },
          resolve: null,
          text: "{T}: This land deals 1 damage to each creature and each player.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
