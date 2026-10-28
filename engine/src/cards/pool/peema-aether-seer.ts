import { defineCard } from "../define.js";

// EDHREC rank 12903. The greatest power is read as the
// trigger resolves; a negative one gives no energy (`get-energy` floors at 0,
// the ruling).

export default defineCard({
  name: "Peema Aether-Seer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, you get an amount of {E} (energy counters) equal to the greatest power among creatures you control.\nPay {E}{E}{E}: Target creature blocks this turn if able.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "get-energy",
        amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: "When this creature enters, you get an amount of {E} (energy counters) equal to the greatest power among creatures you control.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 3 },
      targets: ["creature"],
      effect: { kind: "block-if-able", target: 0 },
      resolve: null,
      text: "Pay {E}{E}{E}: Target creature blocks this turn if able.",
    },
  ],
});
