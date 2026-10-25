import { defineCard } from "../define.js";

// EDHREC rank 11424. X is its power as the ability resolves, and 0 if that's
// negative (the rulings — an amount never reads below 0).

export default defineCard({
  name: "Electrostatic Pummeler",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, you get {E}{E}{E} (three energy counters).\nPay {E}{E}{E}: This creature gets +X/+X until end of turn, where X is its power.",
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
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Pay {E}{E}{E}: This creature gets +X/+X until end of turn, where X is its power.",
    },
  ],
});
