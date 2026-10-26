import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 18257.
//
// Rulings:
//   [2005-06-01] The value of X is determined as the ability resolves.
const CDA_TEXT = "Kagemaro's power and toughness are each equal to the number of cards in your hand.";
const SAC_TEXT =
  "{B}, Sacrifice Kagemaro: All creatures get -X/-X until end of turn, where X is the number of cards in your hand.";
const MINUS_X = { product: [{ cardsInHand: "you" }, -1] } as const;

export default defineCard({
  name: "Kagemaro, First to Suffer",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 0,
  toughness: 0,
  text: `${CDA_TEXT}\n${SAC_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0 },
      text: CDA_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: MINUS_X,
        toughness: MINUS_X,
        duration: "end-of-turn",
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
