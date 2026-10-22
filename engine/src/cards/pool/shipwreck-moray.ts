import { defineCard } from "../define.js";

// Aether Revolt.
const ENTER_TEXT = "When this creature enters, you get {E}{E}{E}{E} (four energy counters).";
const PUMP_TEXT = "Pay {E}: This creature gets +2/-2 until end of turn.";

export default defineCard({
  name: "Shipwreck Moray",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 0,
  toughness: 5,
  text: `${ENTER_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 4 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 1 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
