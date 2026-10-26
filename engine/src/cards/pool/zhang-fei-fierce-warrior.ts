import { defineCard } from "../define.js";

// EDHREC rank 25252.

export default defineCard({
  name: "Zhang Fei, Fierce Warrior",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance", "horsemanship"],
  text: "Vigilance; horsemanship (This creature can't be blocked except by creatures with horsemanship.)",
});
