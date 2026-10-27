import { defineCard } from "../define.js";

// EDHREC rank 19952.
//
// Rulings:
//   [2004-10-04] You only put the tokens onto the battlefield if the target creature is still a
//     legal target on resolution.
//
// Aura Mutation's shape; the mana value is the bounced creature's as it last
// existed on the battlefield.

export default defineCard({
  name: "Aether Mutation",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Return target creature to its owner's hand. Create X 1/1 green Saproling creature tokens, where X is that creature's mana value.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "create-token", token: "Saproling Token", count: { manaValueOf: 0 } },
    ],
  },
});
