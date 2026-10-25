import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 22173.
//
// "You may tap or untap" is chosen as the ability resolves: tap, untap, or
// neither.
export default defineCard({
  name: "Janjeet Sentry",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Soldier"],
  power: 2,
  toughness: 3,
  text: "When this creature enters, you get {E}{E} (two energy counters).\n{T}, Pay {E}{E}: You may tap or untap target artifact or creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: "When this creature enters, you get {E}{E} (two energy counters).",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 2 },
      targets: ["artifact-or-creature"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap target artifact or creature.", effect: { kind: "tap", target: 0 } },
          { text: "Untap target artifact or creature.", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: "{T}, Pay {E}{E}: You may tap or untap target artifact or creature.",
    },
  ],
});
