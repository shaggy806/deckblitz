import { defineCard } from "../define.js";

// EDHREC rank 25211.
// Makes Jace → use "Jace Token".
//
// Rulings:
//   [2026-08-21] Some spells and abilities that empower Jace may require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. You
//     won't empower Jace.
//   [2026-08-21] If you control a Jace planeswalker token, you can't choose to create a new one
//     when you empower Jace. You have to put the loyalty counters on your existing Jace
//     planeswalker token. In the rare case that you control multiple Jace planeswalker tokens,
//     you'll choose one of those tokens to put the loyalty counters on.
//   [2026-08-21] To empower Jace N, if you don't control a Jace planeswalker token, create a blue
//     Jace planeswalker token with 0 loyalty, "[−1]: Surveil 1," and "[−3]: Draw a card." Choose a
//     Jace planeswalker token you control. Put N loyalty counters on it.
//   [2026-08-21] Empower Jace won't let you put loyalty counters on nontoken Jace planeswalkers.
//     However, if you control a Jace planeswalker token that you got another way (such as an
//     effect that creates a token that's a copy of a permanent), empower Jace will put loyalty
//     counters on that.

export default defineCard({
  name: "Solve for Disappointment",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland permanent card from it. That player discards that card.\nEmpower Jace 1. (Put a loyalty counter on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"], notTypes: ["land"] } },
      { kind: "empower-jace", amount: 1 },
    ],
  },
});
