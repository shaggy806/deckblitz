import { defineCard } from "../define.js";

// EDHREC rank 26444.

export default defineCard({
  name: "Spontaneous Artist",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, you get {E} (an energy counter).\nPay {E}: Target creature gains haste until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: "When this creature enters, you get {E}.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 1 },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "Pay {E}: Target creature gains haste until end of turn.",
    },
  ],
});
