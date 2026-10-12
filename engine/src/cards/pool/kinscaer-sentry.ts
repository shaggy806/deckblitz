import { defineCard } from "../define.js";

// EDHREC rank 7352.
//
// Rulings:
//   [2025-11-17] Although the creatures put onto the battlefield with Kinscaer Sentry enter as
//     attacking creatures, they were never declared as attacking creatures. Abilities that trigger
//     whenever a creature attacks won't trigger when the creatures enter attacking.
//   [2025-11-17] You choose the player, planeswalker, or battle the creature you put onto the
//     battlefield is attacking. It doesn't have to attack the same player, planeswalker, or battle
//     as Kinscaer Sentry.
//   [2025-11-17] The value of X is calculated only once, as Kinscaer Sentry's last ability
//     resolves.
//   [2025-11-17] If a card in your hand has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may put a creature card with mana value X or less from your hand onto the battlefield tapped and attacking, where X is the number of attacking creatures you control.";

export default defineCard({
  name: "Kinscaer Sentry",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike", "lifelink"],
  text: `First strike, lifelink\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        enterTapped: true,
        attacking: "choose",
        leftover: "stay",
        filter: {
          type: "creature",
          manaValue: {
            op: "lte",
            n: { amount: { countOf: { type: "creature", controlledBy: "you", attacking: true } } },
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
