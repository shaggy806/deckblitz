import { defineCard } from "../define.js";

// The Angel Warrior token — Kaldheim's (Valkyrie's Sword and others).

export default defineCard({
  name: "Angel Warrior Token (Flying, Vigilance)",
  art: "3bd871a3-3802-4bdc-8033-3ecfd01c0449",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance",
});
