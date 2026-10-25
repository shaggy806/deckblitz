import { defineCard } from "../define.js";

// EDHREC rank 282.
// Makes Treasure → use "Treasure Token".
//
// Rulings:
//   [2021-06-18] If you choose to pay the dash cost rather than the mana cost, you're still
//     casting the spell. It goes on the stack and can be responded to and countered. You can cast
//     a creature spell for its dash cost only when you otherwise could cast that creature spell.
//     Most of the time, this means during your main phase when the stack is empty.
//   [2021-06-18] You must still follow all timing restrictions and pay all costs when casting the
//     exiled card. If you exile a land card, you can't play that card.
//   [2021-06-18] You'll create a Treasure token even if that player has no cards left in their
//     library to exile.
//   [2021-06-18] If a creature enters the battlefield as a copy of or becomes a copy of a creature
//     whose dash cost was paid, the copy won't have haste and won't be returned to its owner's
//     hand.
//   [2021-06-18] If you pay the dash cost to cast a creature spell, that card will be returned to
//     its owner's hand only if it's still on the battlefield when its triggered ability resolves.
//     If it dies or goes to another zone before then, it will stay where it is.
//   [2021-06-18] You don't have to attack with the creature with dash unless another ability says
//     you do.

export default defineCard({
  name: "Ragavan, Nimble Pilferer",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Monkey", "Pirate"],
  power: 2,
  toughness: 1,
  dash: { cost: "{1}{R}" },
  text: "Whenever Ragavan deals combat damage to a player, create a Treasure token and exile the top card of that player's library. Until end of turn, you may cast that card.\nDash {1}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Treasure Token", count: 1 },
          { kind: "impulse-exile", amount: 1, whose: "trigger-player", duration: "end-of-turn", castOnly: true },
        ],
      },
      resolve: null,
      text: "Whenever Ragavan deals combat damage to a player, create a Treasure token and exile the top card of that player's library. Until end of turn, you may cast that card.",
    },
  ],
});
