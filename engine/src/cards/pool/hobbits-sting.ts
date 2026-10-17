import { defineCard } from "../define.js";

// EDHREC rank 9200.
//
// Rulings:
//   [2023-06-16] If a Food you control is also a creature, it will be counted twice.
//   [2024-11-08] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token. For example, you can sacrifice Tough Cookie (an Artifact Creature — Food
//     Golem) to activate Maraleaf Rider's ability (an ability with "Sacrifice a Food" in its
//     cost).
//   [2024-11-08] You can't sacrifice a Food to pay multiple costs. For example, you can't
//     sacrifice a Food token to activate its own ability and also to activate Maraleaf Rider's
//     ability.
//   [2024-11-08] Whatever you do, don't eat the delicious cards.
//   [2024-11-08] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//
// Two counts summed, so a Food creature is counted in each (the first ruling).

export default defineCard({
  name: "Hobbit's Sting",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Hobbit's Sting deals X damage to target creature, where X is the number of creatures you control plus the number of Foods you control.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      sum: [
        { countOf: { type: "creature", controlledBy: "you" } },
        { countOf: { type: "artifact", subtype: "Food", controlledBy: "you" } },
      ],
    },
  },
});
