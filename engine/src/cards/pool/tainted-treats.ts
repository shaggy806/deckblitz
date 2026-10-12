import { defineCard } from "../define.js";

// EDHREC rank 13317.
//
// Rulings:
//   [2026-01-27] Whatever you do, don't eat the cards. (Also, don't make the pizzas pictured on
//     the cards. You don't have the digestive system of a Ninja Turtle.)
//   [2026-01-27] Some spells and abilities that create Food tokens may require targets. If each
//     target chosen is an illegal target as that spell or ability tries to resolve, it won't
//     resolve. You won't create any Food tokens.
//   [2026-01-27] Use the mana cost of the artifact or creature as it last existed on the
//     battlefield to determine whether its mana value is 4 or less. If it had {X} in its cost, X
//     is 0 for the purpose of determining its mana value.
//   [2026-01-27] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token. For example, you can sacrifice Pizza Face (a Legendary Artifact Creature —
//     Food Mutant) to activate Maraleaf Rider's ability (an ability with "Sacrifice a Food" in its
//     cost). You can't sacrifice a Food to pay multiple costs. For example, you can't sacrifice a
//     Food token to activate its own ability and also to activate Maraleaf Rider's ability.
//   [2026-01-27] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.

export default defineCard({
  name: "Tainted Treats",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: "Destroy target artifact or creature. If its mana value was 4 or less, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  targets: ["artifact-or-creature"],
  // "If its mana value was 4 or less" doesn't ask whether it was destroyed:
  // an indestructible target still makes the Food. The `target` condition
  // reads the permanent as it last existed on the battlefield (the ruling).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 4 } } },
        then: { kind: "create-token", token: "Food Token", count: 1 },
      },
    ],
  },
});
