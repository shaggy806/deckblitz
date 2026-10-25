import { defineCard } from "../define.js";

// EDHREC rank 27711. Aetherstream Leopard's attack trigger.

export default defineCard({
  name: "Riparian Tiger",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, you get {E}{E} (two energy counters).\nWhenever this creature attacks, you may pay {E}{E}. If you do, it gets +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: "When this creature enters, you get {E}{E}.",
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
      text: "Whenever this creature attacks, you may pay {E}{E}. If you do, it gets +2/+2 until end of turn.",
    },
  ],
});
