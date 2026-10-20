import { defineCard } from "../define.js";

// EDHREC rank 15489.
//
// Rulings:
//   [2024-11-08] Some spells and abilities that create Food tokens may require targets. If each
//     target chosen is an illegal target as that spell or ability tries to resolve, it won't
//     resolve. You won't create any Food tokens.
//
// Dimensional Exile's "exile … until this leaves the battlefield", then the
// Food, in one ability: a target gone illegal stops both (the ruling).

const ENTER_TEXT =
  "When this enchantment enters, exile target creature an opponent controls until this enchantment leaves the battlefield. Create a Food token.";

export default defineCard({
  name: "Food Coma",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "When this enchantment enters, exile target creature an opponent controls until this enchantment leaves the battlefield. Create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "create-token", token: "Food Token", count: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
