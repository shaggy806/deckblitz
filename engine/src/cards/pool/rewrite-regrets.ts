import { defineCard } from "../define.js";

// EDHREC rank 18977.
// Makes Jace → "Jace Token".
//
// Rulings:
//   [2026-08-21] Empower Jace won't let you put loyalty counters on nontoken Jace planeswalkers.
//     However, if you control a Jace planeswalker token that you got another way (such as an
//     effect that creates a token that's a copy of a permanent), empower Jace will put loyalty
//     counters on that.
//   [2026-08-21] To empower Jace N, if you don't control a Jace planeswalker token, create a blue
//     Jace planeswalker token with 0 loyalty, "[−1]: Surveil 1," and "[−3]: Draw a card." Choose a
//     Jace planeswalker token you control. Put N loyalty counters on it.
//   [2026-08-21] If you control a Jace planeswalker token, you can't choose to create a new one
//     when you empower Jace. You have to put the loyalty counters on your existing Jace
//     planeswalker token. In the rare case that you control multiple Jace planeswalker tokens,
//     you'll choose one of those tokens to put the loyalty counters on.
//   [2026-08-21] Some spells and abilities that empower Jace may require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. You
//     won't empower Jace.
//   [2026-08-21] If a card in your graveyard has an {X} in its mana cost, X is 0 for the purpose
//     of determining its mana value.

const RETURN_TEXT =
  "Return target creature or planeswalker card with mana value 6 or less from your graveyard to the battlefield.";
const EMPOWER_TEXT =
  "Empower Jace 2. (Put two loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";

export default defineCard({
  name: "Rewrite Regrets",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${RETURN_TEXT}\n${EMPOWER_TEXT}`,
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "lte", n: 6 } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "empower-jace", amount: 2 },
    ],
  },
});
