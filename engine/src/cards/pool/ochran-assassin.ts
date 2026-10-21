import { defineCard } from "../define.js";

// EDHREC rank 13866.
//
// Rulings:
//   A creature that can't block it (tapped, say) doesn't, and one with a cost
//   to block isn't made to pay it — Lure's "must-be-blocked" (rule 509.1c).

export default defineCard({
  name: "Ochran Assassin",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Assassin"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: "Deathtouch\nAll creatures able to block this creature do so.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked"],
      text: "All creatures able to block this creature do so.",
    },
  ],
});
