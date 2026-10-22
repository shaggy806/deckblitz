import { defineCard } from "../define.js";

// Aether Revolt. "Enters or attacks" is two triggers (Dread Osseosaur's
// shape); the creatures are counted as each resolves.
const TRIGGER_TEXT = "Whenever this creature enters or attacks, you get {E} (an energy counter) for each creature you control.";
const PUMP_TEXT = "Pay {E}: This creature gets +1/+1 until end of turn.";

const GET_ENERGY = { kind: "get-energy", amount: { countOf: { type: "creature", controlledBy: "you" } } } as const;

export default defineCard({
  name: "Aetherwind Basker",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: GET_ENERGY,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: GET_ENERGY,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 1 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
