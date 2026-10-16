import { defineCard } from "../define.js";

// EDHREC rank 21352. Modern Horizons 3. "You may pay {E}{E}{E}. If you do"
// is a `may` with `costEnergy` (Assaultron Dominator), paid as it resolves.

const ENTER_TEXT = "When this creature enters, you get {E}{E}{E} (three energy counters).";
const ATTACK_TEXT = "Whenever this creature attacks, you may pay {E}{E}{E}. If you do, put a +1/+1 counter on it.";

export default defineCard({
  name: "Thriving Skyclaw",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat", "Dragon"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E}{E} to put a +1/+1 counter on this creature?",
        costEnergy: 3,
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
