import { defineCard } from "../define.js";

// EDHREC rank 16069.
//
// Rulings:
//   [2026-01-27] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2026-01-27] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token. For example, you can sacrifice Pizza Face (a Legendary Artifact Creature —
//     Food Mutant) to activate Maraleaf Rider's ability (an ability with "Sacrifice a Food" in its
//     cost). You can't sacrifice a Food to pay multiple costs. For example, you can't sacrifice a
//     Food token to activate its own ability and also to activate Maraleaf Rider's ability.
//   [2026-01-27] Some spells and abilities that create Food tokens may require targets. If each
//     target chosen is an illegal target as that spell or ability tries to resolve, it won't
//     resolve. You won't create any Food tokens.
//   [2026-01-27] Whatever you do, don't eat the cards. (Also, don't make the pizzas pictured on
//     the cards. You don't have the digestive system of a Ninja Turtle.)


const DRAW_TEXT = "{2}, Sacrifice another creature or token: Draw a card. Activate only as a sorcery.";
const LIFE_TEXT = "{2}, {T}, Sacrifice this creature: You gain 3 life.";

// "Another creature or token": one sacrifice whose filter spans both
// (Bartolomé del Presidio's shape), never the Kitty itself.
export default defineCard({
  name: "Ice Cream Kitty",
  manaCost: "{1}{B/G}",
  colors: ["B", "G"],
  types: ["artifact", "creature"],
  subtypes: ["Food", "Cat", "Mutant"],
  power: 1,
  toughness: 3,
  text: `${DRAW_TEXT}\n${LIFE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { anyOf: [{ type: "creature" }, { token: true }] } } },
      otherOnly: true,
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
