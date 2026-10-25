import { defineCard } from "../define.js";

// Landfall is read as the spell resolves, and replaces the +2/+2 rather than
// adding to it (the rulings).
export default defineCard({
  name: "Groundswell",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn.\nLandfall — If you had a land enter the battlefield under your control this turn, that creature gets +4/+4 until end of turn instead.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "turn-history", what: "entered", who: "you", filter: { type: "land" } },
    then: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
    else: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  },
});
