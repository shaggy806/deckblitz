import { defineCard } from "../define.js";

// EDHREC rank 7833.
//
// Rulings:
//   The permanent types are artifact, creature, enchantment, land, and
//   planeswalker (and battle). Supertypes, like legendary, aren't.
//   You don't have to control either target permanent.
//   If one of the targets is illegal as it resolves, the exchange won't happen.
//
// Shifting Loyalties' shared-card-type pair, narrowed to the permanent types
// (rule 110.4): sharing only kindred doesn't count.

export default defineCard({
  name: "Role Reversal",
  manaCost: "{U}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Exchange control of two target permanents that share a permanent type.",
  targets: [
    "permanent",
    {
      kind: "other",
      of: "permanent",
      than: { slot: 0 },
      shares: { kind: "card", among: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
    },
  ],
  effect: { kind: "exchange-control", objects: [0, 1] },
});
