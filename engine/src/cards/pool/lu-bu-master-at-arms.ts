import { defineCard } from "../define.js";

// EDHREC rank 24944.

export default defineCard({
  name: "Lu Bu, Master-at-Arms",
  manaCost: "{5}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["haste", "horsemanship"],
  text: "Haste; horsemanship (This creature can't be blocked except by creatures with horsemanship.)",
});
