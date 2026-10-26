import { defineCard } from "../define.js";

// EDHREC rank 11648.
//
// Rulings:
//   [2007-02-01] After Intet leaves the battlefield, if a card exiled this way is still exiled,
//     you may still look at it. You won't be able to play it, though.
//   [2007-02-01] Once you play a card this way, it leaves the Exile zone and goes to the stack.
//     You won't be able to play it again.

const TEXT =
  "Whenever Intet deals combat damage to a player, you may pay {2}{U}. If you do, exile the top card of your library face down. You may look at that card for as long as it remains exiled. You may play that card without paying its mana cost for as long as Intet remains on the battlefield.";

// The face-down exile is the controller's to look at for as long as it stays
// there (`faceDown`); the free permission lapses once Intet leaves
// (`"while-source"`).
export default defineCard({
  name: "Intet, the Dreamer",
  manaCost: "{3}{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{U} to exile the top card of your library face down?",
        cost: "{2}{U}",
        effect: {
          kind: "impulse-exile",
          amount: 1,
          duration: "while-source",
          faceDown: true,
          free: { only: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
