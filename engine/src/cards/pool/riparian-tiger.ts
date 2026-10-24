import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK_TEXT = "Whenever this creature attacks, you may pay {E}{E}. If you do, it gets +2/+2 until end of turn.";

export default defineCard({
  name: "Riparian Tiger",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${ETB_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to give this creature +2/+2 until end of turn?",
        costEnergy: 2,
        effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
