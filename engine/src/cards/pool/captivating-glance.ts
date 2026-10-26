import { defineCard } from "../define.js";

// EDHREC rank 13035.
//
// Clash (rule 701.30): the `clash` effect. A loss gives the creature to the
// opponent clashed with (`"that-player"`). Either control change lasts
// indefinitely, and the Aura stays where it is.
//
// Rulings:
//   [2007-10-01] Captivating Glance may cause a player to gain control of a creature they already
//     control. This layers a new control effect on that creature, but doing so rarely has any
//     visible effect.
//   [2007-10-01] Captivating Glance's control-change effect continues to apply even if Captivating
//     Glance leaves the battlefield.
//   [2007-10-01] The ability triggers at the end of Captivating Glance's controller's turn. "You"
//     refers to the controller of Captivating Glance, not the controller of the enchanted
//     creature.
//   [2007-10-01] Captivating Glance's controller never changes as a result of this card.
//   [2007-10-01] The opponent you clash with doesn't have to be the controller of the enchanted
//     creature.
//   [2007-10-01] If you win the clash, you gain control of the enchanted creature. If you don't
//     win the clash, the other player gains control of the enchanted creature (even if that player
//     didn't win the clash either).

export default defineCard({
  name: "Captivating Glance",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAt the beginning of your end step, clash with an opponent. If you win, gain control of enchanted creature. Otherwise, that player gains control of enchanted creature. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "clash",
        won: { kind: "gain-control", target: "attached", untilEndOfTurn: false },
        lost: { kind: "gain-control", target: "attached", untilEndOfTurn: false, who: "that-player" },
      },
      resolve: null,
      text: "At the beginning of your end step, clash with an opponent. If you win, gain control of enchanted creature. Otherwise, that player gains control of enchanted creature.",
    },
  ],
});
