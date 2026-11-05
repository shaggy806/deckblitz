import { defineCard } from "../define.js";

// Iron Golem's pair of requirements, for this turn: it attacks if able, and if it doesn't
// attack it blocks if able.

export default defineCard({
  name: "Hustle",
  manaCost: "{U/R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Target creature attacks or blocks this turn if able.",
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["must-attack", "must-block"] },
  faces: ["Hustle // Bustle", "Hustle", "Bustle"],
  split: true,
});
