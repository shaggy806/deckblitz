import { defineCard } from "../define.js";

export default defineCard({
  name: "Mistmeadow Skulk",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: "Lifelink, protection from mana value 3 or greater",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { manaValue: { op: "gte", n: 3 } } },
      text: "Protection from mana value 3 or greater",
    },
  ],
});
