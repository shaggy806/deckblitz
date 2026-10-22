import { defineCard } from "../define.js";

// EDHREC rank 27254.

const ENTER = "When this creature enters, you get {E} (an energy counter).";
const ATTACK = "Whenever this creature attacks, you may pay {E}. If you do, it gets +2/+0 until end of turn.";

export default defineCard({
  name: "Aetherstream Leopard",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ENTER}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E} to give this creature +2/+0 until end of turn?",
        costEnergy: 1,
        effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
