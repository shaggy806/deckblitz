import { defineCard } from "../define.js";

// EDHREC rank 23290. Modern Horizons 3. Bespoke Battlewagon's `payEnergy`
// cost, one {E} instead of two.

const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const TAP_TEXT = "{T}, Pay {E}: Tap target creature.";

export default defineCard({
  name: "Solstice Zealot",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino", "Cleric"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 1 },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
