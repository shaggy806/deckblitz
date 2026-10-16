import { defineCard } from "../define.js";

// EDHREC rank 7817.
//
// Rulings:
//   [2023-11-10] Abilities that begin with "At the beginning of your end step, if you descended
//     this turn" will trigger only once during your end step, no matter how many times you
//     descended this turn. However, if you haven't descended this turn as your end step begins,
//     the ability won't trigger at all.
//   [2023-11-10] A permanent card is an artifact, battle, creature, enchantment, land, or
//     planeswalker card. Tokens are not cards, and while tokens are put into the graveyard before
//     ceasing to exist, that action doesn't count as a player having descended.
//   [2023-11-10] An opponent with zero cards in hand can't choose to discard a card. Similarly, an
//     opponent with no permanents can't choose to sacrifice a permanent.
//
// Enterprising Scallywag's "if you descended this turn" intervening-if, and
// the punisher asked of each opponent (`each-player-may`, The Death of Gwen
// Stacy's shape): each option is offered only to an opponent who can take it
// (the ruling), and Zoyowa deals the damage to each who didn't.
const END_TEXT =
  "At the beginning of your end step, if you descended this turn, each opponent may discard a card or sacrifice a permanent of their choice. Zoyowa deals 3 damage to each opponent who didn't. (You descended if a permanent card was put into your graveyard from anywhere.)";

export default defineCard({
  name: "Zoyowa Lava-Tongue",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Warlock"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "descended" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [
          { discard: 1, text: "Discard a card" },
          { sacrifice: {}, text: "Sacrifice a permanent" },
        ],
        ifDidnt: { kind: "damage", amount: 3, who: "that-player" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
