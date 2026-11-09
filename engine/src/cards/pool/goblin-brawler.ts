import { defineCard } from "../define.js";

export default defineCard({
  name: "Goblin Brawler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\nThis creature can't be equipped.",
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "be-attached", attachment: "equipment", object: { isSource: true } }], text: "This creature can't be equipped." }],
});
