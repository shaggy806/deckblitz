import { defineCard } from "../define.js";

// EDHREC rank 15270.
//
// Rulings:
//   [2025-07-25] If an artifact has {X} in its mana cost, X is 0 for the purpose of determining
//     its mana value.
//   [2025-07-25] You pay all costs and follow all timing rules for cards played with the
//     permission granted by Memorial Vault's ability.
//
// The sacrificed artifact's mana value as it last existed (Repurposing Bay's
// shape), `otherOnly` making it "another".

const TEXT =
  "{T}, Sacrifice another artifact: Exile the top X cards of your library, where X is one plus the mana value of the sacrificed artifact. You may play those cards this turn.";

export default defineCard({
  name: "Memorial Vault",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: { sum: [1, { manaValueOf: "sacrificed" }] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
