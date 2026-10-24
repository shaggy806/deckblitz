import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 18344. Longtusk Cub's energy pump with Snakeskin
// Veil's hexproof.
const ENTER_TEXT = "When this creature enters, you get {E}{E}{E} (three energy counters).";
const PUMP_TEXT = "Pay {E}{E}{E}: Put a +1/+1 counter on this creature. It gains hexproof until end of turn.";

export default defineCard({
  name: "Bristling Hydra",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 4,
  toughness: 3,
  text: `${ENTER_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 3 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "hexproof", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
