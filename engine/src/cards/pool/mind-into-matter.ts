import { defineCard } from "../define.js";

// Venom, Lethal Protector's shape: a card just drawn may be the one put onto
// the battlefield. A card in hand with {X} in its cost has mana value with
// X = 0 (the ruling, rule 202.3e).
export default defineCard({
  name: "Mind into Matter",
  manaCost: "{X}{G}{U}",
  colors: ["G", "U"],
  types: ["sorcery"],
  text: "Draw X cards. Then you may put a permanent card with mana value X or less from your hand onto the battlefield tapped.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: "x" },
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          manaValue: { op: "lte", n: { amount: "x" } },
        },
      },
    ],
  },
});
