import { defineCard } from "../define.js";

const ATTACK =
  "All creatures can attack your opponents and planeswalkers your opponents control as though those creatures had haste.";

// Rulings:
//   [2020-11-10] It doesn't cause any creatures to gain haste. It just allows
//   all creatures (including those you don't control) to attack as though they
//   had haste if they're attacking your opponents or their planeswalkers.
export default defineCard({
  name: "Frenzied Saddlebrute",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 5,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${ATTACK}`,
  static: [{ affects: { scope: "all-creatures" }, attackAsThoughHaste: "your-opponents", text: ATTACK }],
});
