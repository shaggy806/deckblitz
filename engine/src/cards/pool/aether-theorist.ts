import { defineCard } from "../define.js";

const ENERGY = "When this creature enters, you get {E}{E}{E} (three energy counters).";
const SCRY = "{T}, Pay {E}: Scry 1. (Look at the top card of your library. You may put that card on the bottom.)";

export default defineCard({
  name: "Aether Theorist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Rogue"],
  power: 1,
  toughness: 3,
  text: `${ENERGY}\n${SCRY}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: ENERGY,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 1 },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: SCRY,
    },
  ],
});
