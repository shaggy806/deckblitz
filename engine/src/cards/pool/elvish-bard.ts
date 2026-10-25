import { defineCard } from "../define.js";

// Alliances. EDHREC rank 24962.
//
// Lure's requirement on itself (Breaker of Armies' shape).

export default defineCard({
  name: "Elvish Bard",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman", "Bard"],
  power: 2,
  toughness: 4,
  text: "All creatures able to block this creature do so.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked"],
      text: "All creatures able to block this creature do so.",
    },
  ],
});
