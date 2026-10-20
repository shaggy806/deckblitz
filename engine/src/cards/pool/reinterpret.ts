import { defineCard } from "../define.js";

// Counterpoint's shape, from the hand and any spell. Rulings: a target that
// can't be countered still lets you cast one; the target's mana value counts
// its chosen {X} (read as it last was on the stack); the free cast's own X is
// 0; a modal double-faced card is judged by the face being cast.

export default defineCard({
  name: "Reinterpret",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Counter target spell. You may cast a spell with equal or lesser mana value from your hand without paying its mana cost.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "cast-now",
        from: "hand",
        free: true,
        spell: { manaValue: { op: "lte", n: { amount: { manaValueOf: 0 } } } },
      },
    ],
  },
});
