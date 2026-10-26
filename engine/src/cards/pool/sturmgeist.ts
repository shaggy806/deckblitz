import { defineCard } from "../define.js";

// EDHREC rank 13365. Body of Knowledge's characteristic-defining ability.
//
// Rulings:
//   [2011-09-22] The ability that defines Sturmgeist's power and toughness works in all zones, not
//     just the battlefield.

const CDA_TEXT = "Sturmgeist's power and toughness are each equal to the number of cards in your hand.";
const DRAW_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Sturmgeist",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
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
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
