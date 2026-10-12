import { defineCard } from "../define.js";

export default defineCard({
  name: "Rancid Rats",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Rat"],
  power: 1,
  toughness: 1,
  keywords: ["skulk", "deathtouch"],
  text: "Skulk (This creature can't be blocked by creatures with greater power.)\nDeathtouch (Any amount of damage this deals to a creature is enough to destroy it.)",
});
