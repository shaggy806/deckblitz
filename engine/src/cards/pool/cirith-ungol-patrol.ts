import { defineCard } from "../define.js";

// EDHREC rank 15106.
// Makes Food → use "Food Token".
//
// Rulings:
//   [2024-11-08] Whatever you do, don't eat the delicious cards.
//   [2024-11-08] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2024-11-08] You can't sacrifice a Food to pay multiple costs. For example, you can't
//     sacrifice a Food token to activate its own ability and also to activate Maraleaf Rider's
//     ability.

export default defineCard({
  name: "Cirith Ungol Patrol",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Soldier"],
  power: 4,
  toughness: 5,
  text: "{1}, {T}, Sacrifice another creature: Draw a card, then create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "create-token", token: "Food Token", count: 1 },
        ],
      },
      resolve: null,
      text: "{1}, {T}, Sacrifice another creature: Draw a card, then create a Food token.",
      otherOnly: true,
    },
  ],
});
