import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Works even on damage from activated abilities of creatures such as Prodigal
//     Sorcerer.

const TEXT = "Prevent all damage that would be dealt to this creature by creatures.";

export default defineCard({
  name: "Uncle Istvan",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self", source: { types: ["creature"] } },
      text: TEXT,
    },
  ],
});
