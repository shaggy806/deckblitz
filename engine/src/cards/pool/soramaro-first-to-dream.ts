import { defineCard } from "../define.js";

// EDHREC rank 19646. Body of Knowledge's hand-size CDA; Mina and Denn's
// "return a land you control" cost.
const CDA_TEXT = "Soramaro's power and toughness are each equal to the number of cards in your hand.";
const DRAW_TEXT = "{4}, Return a land you control to its owner's hand: Draw a card.";

export default defineCard({
  name: "Soramaro, First to Dream",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${CDA_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0 },
      text: CDA_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
