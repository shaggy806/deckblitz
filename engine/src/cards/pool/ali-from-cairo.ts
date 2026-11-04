import { defineCard } from "../define.js";

// Mirage. The damage is still dealt in full, so lifelink and "whenever deals
// damage" still see all of it, a life total below 1 drops as normal, and a loss
// or payment of life goes past it (the rulings — `playerDamageLifeFloor`).
const TEXT = "Damage that would reduce your life total to less than 1 reduces it to 1 instead.";

export default defineCard({
  name: "Ali from Cairo",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 0,
  toughness: 1,
  text: TEXT,
  static: [{ affects: { scope: "self" }, damageLifeFloor: 1, text: TEXT }],
});
