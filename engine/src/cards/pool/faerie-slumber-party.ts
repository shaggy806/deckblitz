import { defineCard } from "../define.js";

// EDHREC rank 8420.
// Makes Faerie → "Faerie Token (Faerie Slumber Party)".
//
// "For each opponent who controlled a creature returned this way": one pass
// over the opponents, each counted once however many of their creatures
// went back (`this-way` "returned-to-hand" counts a permanent by its
// controller as it left). The tokens are one instruction, so they enter
// together.

const TEXT =
  'Return all creatures to their owners\' hands. For each opponent who controlled a creature returned this way, you create two 1/1 blue Faerie creature tokens with flying and "This token can block only creatures with flying."';

export default defineCard({
  name: "Faerie Slumber Party",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand-all", filter: { type: "creature" } },
      {
        kind: "for-each-player",
        who: "each-opponent",
        simultaneous: true,
        effect: {
          kind: "conditional",
          condition: { kind: "this-way", what: "returned-to-hand", who: "that-player" },
          then: { kind: "create-token", token: "Faerie Token (Faerie Slumber Party)", count: 2 },
        },
      },
    ],
  },
});
