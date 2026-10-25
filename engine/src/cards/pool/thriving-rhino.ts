import { defineCard } from "../define.js";

const ENERGY = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK = "Whenever this creature attacks, you may pay {E}{E}. If you do, put a +1/+1 counter on it.";

export default defineCard({
  name: "Thriving Rhino",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino"],
  power: 2,
  toughness: 3,
  text: `${ENERGY}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENERGY,
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
      text: ATTACK,
    },
  ],
});
