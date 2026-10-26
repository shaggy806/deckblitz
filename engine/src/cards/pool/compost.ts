import { defineCard } from "../define.js";

// EDHREC rank 9565. Once per black card, from any zone — discarded, milled,
// countered or dying (the ruling); `who: "opponent"` is the graveyard's owner.
//
// Rulings:
//   The ability triggers on a black card being discarded, milled, or countered, as well as a black
//   card going to the graveyard from the battlefield.

const TEXT = "Whenever a black card is put into an opponent's graveyard from anywhere, you may draw a card.";

export default defineCard({
  name: "Compost",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "opponent", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
