import { defineCard } from "../define.js";

// X is its power as the ability resolves (the ruling), and 0 when that power
// is negative: a plain `powerOf` amount is clamped at 0.

const ETB_TEXT = "When this creature enters, you get {E}{E}{E} (three energy counters).";
const PUMP_TEXT = "Pay {E}{E}{E}: This creature gets +X/+X until end of turn, where X is its power.";

export default defineCard({
  name: "Electrostatic Pummeler",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  text: `${ETB_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 3 },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
