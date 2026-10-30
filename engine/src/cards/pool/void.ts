import { defineCard } from "../define.js";

// Rulings:
//   The target player is chosen as you announce Void, but the number isn't chosen until it's
//     resolving. No player may choose to take actions between you choosing a number and the
//     rest of Void's effects.
//   You can choose 0. Artifact lands and most tokens have mana values of 0, for example.
//
// The number is chosen as it resolves (`choose-value`, the `choose-number`
// decision), any from 0 up, and read as `"x"` by both halves.

const SAME_NUMBER = { op: "eq", n: "x" } as const;

export default defineCard({
  name: "Void",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Choose a number. Destroy all artifacts and creatures with mana value equal to that number. Then target player reveals their hand and discards all nonland cards with mana value equal to the number.",
  targets: ["player"],
  effect: {
    kind: "choose-value",
    value: "number",
    then: {
      kind: "sequence",
      effects: [
        { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "creature"], manaValue: SAME_NUMBER } },
        {
          kind: "discard-hand",
          who: 0,
          filter: { notTypes: ["land"], manaValue: SAME_NUMBER },
          reveal: true,
        },
      ],
    },
  },
});
