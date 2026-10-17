import { defineCard } from "../define.js";

// EDHREC rank 5380.
//
// Rulings:
//   [2024-07-26] You cast the exiled card while the ability is resolving and still on the stack.
//     You can’t wait to cast it later in the turn. Timing restrictions based on the card’s type
//     are ignored.
//   [2024-07-26] Since you are using an alternative cost to cast the spell, you can’t pay any
//     other alternative costs. You can, however, pay additional costs, such as kicker costs. If
//     the card has any mandatory additional costs, you must pay those.
//   [2024-07-26] If the spell you cast has {X} in its mana cost, you must choose 0 as the value of
//     X.
//   [2024-07-26] If you choose not to cast the exiled card, it remains in exile.

export default defineCard({
  name: "The Infamous Cruelclaw",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Weasel", "Mercenary"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace\nWhenever The Infamous Cruelclaw deals combat damage to a player, exile cards from the top of your library until you exile a nonland card. You may cast that card by discarding a card rather than paying its mana cost.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      // Cast as this resolves or not at all, timing ignored, X 0; additional
      // costs such as kicker may still be paid. Not cast, it stays in exile
      // (the rulings).
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"] },
        exile: true,
        rest: "stay",
        then: { kind: "cast-now", target: 0, byDiscarding: true },
      },
      resolve: null,
      text: "Whenever The Infamous Cruelclaw deals combat damage to a player, exile cards from the top of your library until you exile a nonland card. You may cast that card by discarding a card rather than paying its mana cost.",
    },
  ],
});
