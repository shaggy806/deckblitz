import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 19346.
//
// "Its activated abilities can't be activated this turn" is `prohibit` on the
// target — mana and loyalty abilities included — and holds even if it untaps.
export default defineCard({
  name: "Deadlock Trap",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters tapped.\nWhen this artifact enters, you get {E}{E} (two energy counters).\n{T}, Pay {E}: Tap target creature or planeswalker. Its activated abilities can't be activated this turn.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: "When this artifact enters, you get {E}{E} (two energy counters).",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 1 },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "prohibit", target: 0, abilities: true },
        ],
      },
      resolve: null,
      text: "{T}, Pay {E}: Tap target creature or planeswalker. Its activated abilities can't be activated this turn.",
    },
  ],
});
