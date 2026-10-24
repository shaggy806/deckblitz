import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, you get {E} (an energy counter).";
const HASTE_TEXT = "Pay {E}: Target creature gains haste until end of turn.";

export default defineCard({
  name: "Spontaneous Artist",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: `${ETB_TEXT}\n${HASTE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 1 },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: HASTE_TEXT,
    },
  ],
});
