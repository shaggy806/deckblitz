import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 15307. Soul Barrier's trigger, without the
// payment.
//
// Rulings:
//   [2009-10-01] The ability triggers when an opponent casts a creature spell, and goes on the
//     stack above that spell. As such, the ability will deal 1 damage to that player before the
//     creature enters.

export default defineCard({
  name: "Aether Sting",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Whenever an opponent casts a creature spell, this enchantment deals 1 damage to that player.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: "Whenever an opponent casts a creature spell, this enchantment deals 1 damage to that player.",
    },
  ],
});
