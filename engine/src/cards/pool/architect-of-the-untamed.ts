import { defineCard } from "../define.js";

// Kaladesh.
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, you get {E} (an energy counter).";
const PAY_TEXT = "Pay eight {E}: Create a 6/6 colorless Beast artifact creature token.";

export default defineCard({
  name: "Architect of the Untamed",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Artificer", "Druid"],
  power: 2,
  toughness: 3,
  text: `${LANDFALL_TEXT}\n${PAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 8 },
      targets: [],
      effect: { kind: "create-token", token: "6/6 Beast Artifact Token", count: 1 },
      resolve: null,
      text: PAY_TEXT,
    },
  ],
});
