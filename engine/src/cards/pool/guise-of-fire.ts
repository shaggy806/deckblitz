import { defineCard } from "../define.js";

// EDHREC rank 28700.
//
// Rulings: the enchanted creature's controller still picks what it attacks; a
// tapped, summoning-sick or can't-attack creature, or one with an attack cost,
// doesn't have to attack.

const PUMP = "Enchanted creature gets +1/-1 and attacks each combat if able.";

export default defineCard({
  name: "Guise of Fire",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, -1], restrictions: ["must-attack"], text: PUMP }],
});
