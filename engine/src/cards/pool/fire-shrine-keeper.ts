import { defineCard } from "../define.js";

// EDHREC rank 24751.
//
// Rulings: the same creature can't be both targets.

const TEXT =
  "{7}{R}, {T}, Sacrifice this creature: It deals 3 damage to each of up to two target creatures.";

export default defineCard({
  name: "Fire Shrine Keeper",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{7}{R}", tap: true, sacrifice: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "damage", amount: 3, target: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
