import { defineCard } from "../define.js";

export default defineCard({
  name: "Vulshok Refugee",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: "Protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});
