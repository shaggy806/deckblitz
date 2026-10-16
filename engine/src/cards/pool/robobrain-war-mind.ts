import { defineCard } from "../define.js";

// EDHREC rank 11186. Fallout.
//
// Rulings:
//   [2024-03-08] Use the number of artifact creatures you control when Robobrain War Mind's second
//     ability resolves, including Robobrain War Mind itself if it's still on the battlefield, to
//     determine the number of energy counters you get.
//   [2024-03-08] The ability that defines Robobrain War Mind's power functions in all zones, not
//     just the battlefield.
//
// A power-only CDA over the printed toughness 5 (Eluge's shape, every zone);
// the energy count is read as the trigger resolves; "you may pay {E}{E}{E}.
// If you do" is a `may` with `costEnergy` (Thriving Skyclaw).
const CDA_TEXT = "Robobrain War Mind's power is equal to the number of cards in your hand.";
const ENTER_TEXT =
  "When this creature enters, you get an amount of {E} (energy counters) equal to the number of artifact creatures you control.";
const ATTACK_TEXT = "Whenever this creature attacks, you may pay {E}{E}{E}. If you do, draw a card.";

export default defineCard({
  name: "Robobrain War Mind",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 0,
  toughness: 5,
  text: `${CDA_TEXT}\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0, only: "power" },
      text: CDA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: { countOf: { types: ["artifact", "creature"], controlledBy: "you" } } },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Pay {E}{E}{E} to draw a card?", costEnergy: 3, effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
