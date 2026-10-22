import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 24016.
//
// "Creatures can't attack this turn" is a rule for the turn (rule 611.2c —
// Orim's Chant's kicked half), so it covers creatures that arrive later too.

export default defineCard({
  name: "Festival",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during an opponent's upkeep.\nCreatures can't attack this turn.",
  castOnlyIf: {
    kind: "all",
    of: [
      { kind: "not", of: { kind: "your-turn" } },
      { kind: "turn-structure", steps: ["upkeep"] },
    ],
  },
  targets: [],
  effect: { kind: "restrict", filter: { type: "creature" }, restrictions: ["cant-attack"] },
});
