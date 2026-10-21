import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 29688.
//
// Rulings:
//   [2018-06-08] The choice of whether to discard a card is made by each player on your team
//     individually. You don't need to all make the same choice.
//
// "Each player on your team" is you alone outside a team game (rule 102.4):
// Mog, Moogle Warrior's discard-then-draw for one player.

const TEXT =
  "When this creature enters, each player on your team may discard a card, then each player who discarded a card this way draws a card.";

export default defineCard({
  name: "Azra Bladeseeker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Azra", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ discard: 1, text: "Discard a card" }],
        ifDid: { kind: "draw", amount: 1, who: "that-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
