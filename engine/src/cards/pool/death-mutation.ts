import { defineCard } from "../define.js";

// EDHREC rank 20054.
//
// Rulings:
//   [2008-08-01] If the target is illegal on resolution, the entire spell doesn’t resolve. As
//     such, you will not put any tokens onto the battlefield.
//
// Artifact Mutation's shape.

export default defineCard({
  name: "Death Mutation",
  manaCost: "{6}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Destroy target nonblack creature. It can't be regenerated. Create X 1/1 green Saproling creature tokens, where X is that creature's mana value.",
  targets: ["nonblack-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "create-token", token: "Saproling Token", count: { manaValueOf: 0 } },
    ],
  },
});
