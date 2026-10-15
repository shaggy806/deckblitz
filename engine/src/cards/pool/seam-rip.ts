import { defineCard } from "../define.js";

// EDHREC rank 16244. Solitary Cell's exile, at mana value 2 or less.
//
// Rulings:
//   [2025-07-25] If Seam Rip leaves the battlefield before its triggered ability resolves, the
//     target permanent won't be exiled.
//   [2025-07-25] If a permanent has {X} in its mana cost, X is 0 for the purpose of determining
//     its mana value.
//   [2025-07-25] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.

const EXILE_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls with mana value 2 or less until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Seam Rip",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: EXILE_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { notTypes: ["land"], manaValue: { op: "lte", n: 2 } },
        },
      ],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this enchantment leaves the battlefield, return the exiled card.",
    },
  ],
});
