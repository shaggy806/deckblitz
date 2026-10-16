import { defineCard } from "../define.js";
import { forageOptions } from "../helpers.js";

// Rulings:
//   [2024-07-26] If you don't have enough cards in your graveyard or a Food on the battlefield, you
//     can't choose to forage.
//   [2024-07-26] You can't sacrifice a Food to pay multiple costs.

const ENTER_TEXT = "When this creature enters, you may forage. If you do, draw a card.";

export default defineCard({
  name: "Treetop Sentries",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Squirrel", "Archer"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${ENTER_TEXT} (To forage, exile three cards from your graveyard or sacrifice a Food.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: forageOptions(),
        ifDid: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
