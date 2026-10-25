import { defineCard } from "../define.js";

// Kaladesh. Scrapper Champion's "you may pay {E}{E}. If you do".
const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK_TEXT = "Whenever this creature attacks, you may pay {E}{E}. If you do, put a +1/+1 counter on it.";

export default defineCard({
  name: "Thriving Rats",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 2,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
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
