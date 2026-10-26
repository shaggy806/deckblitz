import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 21748.
//
// Rulings:
//   [2005-06-01] Kiyomaro's power and toughness don't affect whether it has vigilance or the
//     life-gain ability.
//   [2005-06-01] If you have seven or more cards in hand when Kiyomaro's triggered ability goes on
//     the stack but less than seven when the ability resolves, the ability does nothing.
//   [2005-06-01] Losing vigilance after attackers are declared doesn't cause Kiyomaro to tap.
//
// "Whenever Kiyomaro deals damage" with no recipient named fires once per simultaneous damage
// event; the seven-card check is an intervening if (rule 603.4), read again as it resolves.

const PT_TEXT = "Kiyomaro's power and toughness are each equal to the number of cards in your hand.";
const VIGILANCE_TEXT = "As long as you have four or more cards in hand, Kiyomaro has vigilance.";
const LIFE_TEXT = "Whenever Kiyomaro deals damage, if you have seven or more cards in hand, you gain 7 life.";

export default defineCard({
  name: "Kiyomaro, First to Stand",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${VIGILANCE_TEXT}\n${LIFE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atLeast: 4 },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      condition: { kind: "hand-size", atLeast: 7 },
      targets: [],
      effect: { kind: "gain-life", amount: 7 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
