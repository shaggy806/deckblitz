import { defineCard } from "../define.js";

// EDHREC rank 4200. Tarmogoyf's CDA. "From among them" finds the milled cards
// in whatever public zone they went to (Rest in Peace: rule 701.17c, what
// `thisWay: "milled"` reads).

const CDA =
  "Barrowgoyf's power is equal to the number of card types among cards in all graveyards and its toughness is equal to that number plus 1.";
const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, you may mill that many cards. If you do, you may put a creature card from among them into your hand.";

export default defineCard({
  name: "Barrowgoyf",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 1,
  keywords: ["deathtouch", "lifelink"],
  text: `Deathtouch, lifelink\n${CDA}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { cardTypesInGraveyard: {} }, plusPower: 0, plusToughness: 1 },
      text: CDA,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Mill that many cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "mill", target: "you", amount: { triggerValue: true } },
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 0,
              max: 1,
              filter: { type: "creature", thisWay: "milled" },
              destination: "hand",
              leftover: "stay",
            },
          ],
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
