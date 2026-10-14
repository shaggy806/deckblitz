import { defineCard } from "../define.js";

// EDHREC rank 15247.
// Makes Jace → use "Jace Token".
//
// Rulings:
//   [2026-08-21] If you control a Jace planeswalker token, you can't choose to create a new one
//     when you empower Jace. You have to put the loyalty counters on your existing Jace
//     planeswalker token. In the rare case that you control multiple Jace planeswalker tokens,
//     you'll choose one of those tokens to put the loyalty counters on.
//   [2026-08-21] Empower Jace won't let you put loyalty counters on nontoken Jace planeswalkers.
//     However, if you control a Jace planeswalker token that you got another way (such as an
//     effect that creates a token that's a copy of a permanent), empower Jace will put loyalty
//     counters on that.
//   [2026-08-21] Some spells and abilities that empower Jace may require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. You
//     won't empower Jace.
//   [2026-08-21] To empower Jace N, if you don't control a Jace planeswalker token, create a blue
//     Jace planeswalker token with 0 loyalty, "[−1]: Surveil 1," and "[−3]: Draw a card." Choose a
//     Jace planeswalker token you control. Put N loyalty counters on it.

export default defineCard({
  name: "Way of the Paradox",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: "When Way of the Paradox enters, empower Jace 5. (Put five loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")\nWhenever you activate a loyalty ability, you gain 1 life. You may play an additional land this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 5 },
      resolve: null,
      text: "When Way of the Paradox enters, empower Jace 5.",
    },
    {
      trigger: { on: "activates-ability", who: "you", loyalty: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "additional-land-drop", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever you activate a loyalty ability, you gain 1 life. You may play an additional land this turn.",
    },
  ],
});
