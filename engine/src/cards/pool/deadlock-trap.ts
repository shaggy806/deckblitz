import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 19346.
//
// "Its activated abilities can't be activated this turn" is Koma's
// `prohibit` on a target permanent — this stint of it, mana abilities
// included; it holds even if the permanent untaps (ruling).
const ENTERS = "When this artifact enters, you get {E}{E} (two energy counters).";
const LOCK = "{T}, Pay {E}: Tap target creature or planeswalker. Its activated abilities can't be activated this turn.";

export default defineCard({
  name: "Deadlock Trap",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${ENTERS}\n${LOCK}`,
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
      text: ENTERS,
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
      text: LOCK,
    },
  ],
});
