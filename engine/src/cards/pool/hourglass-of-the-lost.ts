import { defineCard } from "../define.js";

// EDHREC rank 5970.
//
// Rulings:
//   [2024-06-07] If a card in your graveyard has {X} in its mana cost, X is considered to be 0.

export default defineCard({
  name: "Hourglass of the Lost",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: "{T}: Add {W}. Put a time counter on this artifact.\n{T}, Remove X time counters from this artifact and exile it: Return each nonland permanent card with mana value X from your graveyard to the battlefield. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "W",
        amount: 1,
        also: { kind: "add-counter", target: "source", counter: "time", amount: 1 },
      },
      resolve: null,
      text: "{T}: Add {W}. Put a time counter on this artifact.",
    },
    {
      cost: { mana: null, tap: true, exileSelf: true, removeCounter: { kind: "time", count: "x" } },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
          manaValue: { op: "eq", n: { amount: "x" } },
        },
        destination: "battlefield",
        count: "all",
      },
      resolve: null,
      text: "{T}, Remove X time counters from this artifact and exile it: Return each nonland permanent card with mana value X from your graveyard to the battlefield. Activate only as a sorcery.",
    },
  ],
});
