import { defineCard } from "../define.js";

const TEXT = "This creature can't attack or block unless you pay {2}.";

export default defineCard({
  name: "Qal Sisma Behemoth",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 5,
  toughness: 5,
  text: TEXT,
  static: [{ affects: { scope: "self" }, combatTax: { on: ["attack", "block"], generic: 2 }, text: TEXT }],
});
