import { defineCard } from "../define.js";

// Rulings:
//   [2007-05-01] Creatures with reach (such as Giant Spider) don't actually have flying, so they
//     can't block this.

export default defineCard({
  name: "Treetop Scout",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 1,
  toughness: 1,
  text: "This creature can't be blocked except by creatures with flying.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { notKeyword: "flying" },
      text: "This creature can't be blocked except by creatures with flying.",
    },
  ],
});
