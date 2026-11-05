import { defineCard } from "../define.js";

// EDHREC rank 12681.

export default defineCard({
  name: "Judoon Enforcers",
  manaCost: "{5}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Alien", "Rhino", "Soldier"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  suspend: { n: 6, cost: "{1}{R}{W}" },
  text: "Trample\nNo more than one creature can attack you each combat.\nSuspend 6—{1}{R}{W} (Rather than cast this card from your hand, you may pay {1}{R}{W} and exile it with six time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
  static: [
    {
      affects: { scope: "self" },
      attackLimit: { most: 1, covers: "you" },
      text: "No more than one creature can attack you each combat.",
    },
  ],
});
