import { defineCard } from "../define.js";

// EDHREC rank 23905.
//
// Hunted Wumpus's shape, narrowed to legendary creature cards: each opponent in
// turn order from the active player may choose one face down, and every chosen
// card enters at once when all have chosen (the ruling; rule 101.4).
const ETB_TEXT =
  "When Iwamori enters, each opponent may put a legendary creature card from their hand onto the battlefield.";

export default defineCard({
  name: "Iwamori of the Open Fist",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [
          {
            putFromHand: { type: "creature", supertype: "legendary" },
            text: "Put a legendary creature card onto the battlefield",
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
