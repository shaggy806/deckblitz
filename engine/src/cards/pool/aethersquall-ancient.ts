import { defineCard } from "../define.js";

export default defineCard({
  name: "Aethersquall Ancient",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, you get {E}{E}{E} (three energy counters).\nPay eight {E}: Return all other creatures to their owners' hands. Activate only as a sorcery.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: "At the beginning of your upkeep, you get {E}{E}{E} (three energy counters).",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 8 },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature" },
        exceptSource: true,
        simultaneous: true,
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: "Pay eight {E}: Return all other creatures to their owners' hands. Activate only as a sorcery.",
    },
  ],
});
