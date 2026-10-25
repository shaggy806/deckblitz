import { defineCard } from "../define.js";

// EDHREC rank 19577.

const ENTER = "When this creature enters, you get {E}{E} (two energy counters).";
const MILL = "{T}, Pay {E}: Target player mills three cards.";

export default defineCard({
  name: "Minister of Inquiries",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Advisor"],
  power: 1,
  toughness: 2,
  text: `${ENTER}\n${MILL}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 1 },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 3 },
      resolve: null,
      text: MILL,
    },
  ],
});
