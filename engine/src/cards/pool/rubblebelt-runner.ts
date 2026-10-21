import { defineCard } from "../define.js";

// Ravnica Allegiance.
const TEXT = "This creature can't be blocked by creature tokens.";

export default defineCard({
  name: "Rubblebelt Runner",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { type: "creature", token: true },
      text: TEXT,
    },
  ],
});
