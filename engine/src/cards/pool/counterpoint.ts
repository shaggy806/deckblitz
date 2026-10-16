import { defineCard } from "../define.js";

// Rulings: a target spell that can't be countered still lets you cast one; the
// target's mana value counts its chosen {X} (read as it last was on the
// stack); the card is cast as Counterpoint resolves, timing ignored, X = 0.

export default defineCard({
  name: "Counterpoint",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Counter target spell. You may cast a creature, instant, sorcery, or planeswalker spell from your graveyard with mana value less than or equal to that spell's mana value without paying its mana cost.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "cast-now",
        from: "graveyard",
        free: true,
        spell: {
          typesAnyOf: ["creature", "instant", "sorcery", "planeswalker"],
          manaValue: { op: "lte", n: { amount: { manaValueOf: 0 } } },
        },
      },
    ],
  },
});
