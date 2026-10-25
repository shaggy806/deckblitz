import { defineCard } from "../define.js";

// EDHREC rank 22945.

export default defineCard({
  name: "Hightide Hermit",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab"],
  power: 4,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\nWhen this creature enters, you get {E}{E}{E}{E} (four energy counters).\nPay {E}{E}: This creature can attack this turn as though it didn't have defender.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 4 },
      resolve: null,
      text: "When this creature enters, you get {E}{E}{E}{E}.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 2 },
      targets: [],
      effect: { kind: "attack-despite-defender", target: "source" },
      resolve: null,
      text: "Pay {E}{E}: This creature can attack this turn as though it didn't have defender.",
    },
  ],
});
