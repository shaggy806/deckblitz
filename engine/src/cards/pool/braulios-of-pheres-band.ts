import { defineCard } from "../define.js";

// EDHREC rank 9840.
//
// Rulings:
//   [2024-11-08] The ability that defines Braulios's power and toughness works in all zones, not
//     just the battlefield.

const PT_TEXT = "Braulios's power and toughness are each equal to the number of lands you control.";
const ATTACK_TEXT =
  "Whenever Braulios attacks, draw a card, then you may put a land card from your hand onto the battlefield.";

// The CDA is Greensleeves's; the attack trigger is Chulane's draw-then-land.
export default defineCard({
  name: "Braulios of Pheres Band",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Centaur", "Scout"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "land", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "land" },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
