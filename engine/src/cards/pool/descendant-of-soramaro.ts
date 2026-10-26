import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 23665.
//
// X is read as the ability resolves; every looked-at card goes back on top in the order picked
// (Sensei's Divining Top's shape with a live count).
const TEXT =
  "{1}{U}: Look at the top X cards of your library, where X is the number of cards in your hand, then put them back in any order.";
const X = { cardsInHand: "you" } as const;

export default defineCard({
  name: "Descendant of Soramaro",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: X,
        min: X,
        max: X,
        destination: "library-top",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
