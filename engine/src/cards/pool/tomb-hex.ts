import { defineCard } from "../define.js";

// EDHREC rank 27266.
//
// Landfall is checked as the spell resolves, and replaces the -2/-2 (the
// rulings): one conditional with an `else`.

export default defineCard({
  name: "Tomb Hex",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -2/-2 until end of turn.\nLandfall — If you had a land enter the battlefield under your control this turn, that creature gets -4/-4 until end of turn instead.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "turn-history", what: "entered", filter: { type: "land" } },
    then: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
    else: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
  },
});
