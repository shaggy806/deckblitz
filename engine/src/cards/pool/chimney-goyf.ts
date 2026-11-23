import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Tarmogoyf's characteristic-defining
// ability (it works in every zone, the rulings) and Chimney Imp's death
// trigger.

const PT_TEXT =
  "Chimney Goyf's power is equal to the number of card types among cards in all graveyards and its toughness is equal to that number plus 1.";
const DIES_TEXT = "When Chimney Goyf dies, target opponent puts a card from their hand on top of their library.";

export default defineCard({
  name: "Chimney Goyf",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Lhurgoyf", "Imp"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${PT_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { cardTypesInGraveyard: {} }, plusPower: 0, plusToughness: 1 },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          player: "that-player",
          min: 1,
          max: 1,
          destination: "library-top",
          leftover: "stay",
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
