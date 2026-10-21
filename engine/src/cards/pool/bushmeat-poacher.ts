import { defineCard } from "../define.js";

// EDHREC rank 15748. Ikoria: Lair of Behemoths.
//
// Rulings:
//   - You draw only one card, no matter how much life you gain.
//   - Use the sacrificed creature's toughness as it last existed on the battlefield to determine
//     how much life you gain.
const TEXT = "{1}, {T}, Sacrifice another creature: You gain life equal to the sacrificed creature's toughness. Draw a card.";

export default defineCard({
  name: "Bushmeat Poacher",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
