import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 30739.
export default defineCard({
  name: "Nath's Buffoon",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 1,
  toughness: 1,
  text: "Protection from Elves",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Elf" } },
      text: "Protection from Elves",
    },
  ],
});
