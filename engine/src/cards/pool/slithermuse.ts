import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] You choose an opponent when the ability resolves. Once you determine how many
//     more cards than you that player has, that number is locked in as the amount you'll draw.

export default defineCard({
  name: "Slithermuse",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  evoke: { cost: "{3}{U}" },
  text: "When this creature leaves the battlefield, choose an opponent. If that player has more cards in hand than you, draw cards equal to the difference.\nEvoke {3}{U} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      // The opponent is chosen as this resolves; the difference (never below
      // 0) is read once, as the one draw's amount — its ruling.
      effect: {
        kind: "choose-opponent",
        then: {
          kind: "draw",
          amount: { difference: [{ cardsInHand: "that-player" }, { cardsInHand: "you" }] },
        },
      },
      resolve: null,
      text: "When this creature leaves the battlefield, choose an opponent. If that player has more cards in hand than you, draw cards equal to the difference.",
    },
  ],
});
