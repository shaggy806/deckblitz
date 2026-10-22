import { defineCard } from "../define.js";

// EDHREC rank 10770.
//
// Rulings: the creature may be any creature, not only the target opponent's;
// with two targets and one illegal, the other is still dealt damage.

const TEXT =
  "When this creature enters, it deals 3 damage to target opponent or planeswalker and 3 damage to up to one target creature.";

export default defineCard({
  name: "Burning Sun's Avatar",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Avatar"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent-or-planeswalker", { kind: "optional", of: "creature" }],
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
