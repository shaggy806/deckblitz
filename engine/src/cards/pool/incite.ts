import { defineCard } from "../define.js";

// Rulings:
//   [2008-10-01] Incite overwrites all of the targeted creature's old colors, leaving it just red.

export default defineCard({
  name: "Incite",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature becomes red until end of turn and attacks this turn if able.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become", target: 0, setColors: ["R"], duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: ["must-attack"] },
    ],
  },
});
