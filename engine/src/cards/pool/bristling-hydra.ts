import { defineCard } from "../define.js";

// EDHREC rank 18344.

export default defineCard({
  name: "Bristling Hydra",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 4,
  toughness: 3,
  text: "When this creature enters, you get {E}{E}{E} (three energy counters).\nPay {E}{E}{E}: Put a +1/+1 counter on this creature. It gains hexproof until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: "When this creature enters, you get {E}{E}{E}.",
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
      text: "Pay {E}{E}{E}: Put a +1/+1 counter on this creature. It gains hexproof until end of turn.",
    },
  ],
});
