import { defineCard } from "../define.js";

// Aether Revolt. Thriving Skyclaw's "you may pay {E}{E}. If you do".
const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK_TEXT = "Whenever this creature attacks, you may pay {E}{E}. If you do, put a +1/+1 counter on it.";

export default defineCard({
  name: "Scrapper Champion",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike (This creature deals both first-strike and regular combat damage.)\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to put a +1/+1 counter on this creature?",
        costEnergy: 2,
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
