import { defineCard } from "../define.js";

// Rulings:
//   [2021-07-23] Gloom Stalker will have double strike even if it wasn't on the battlefield as you
//     completed a dungeon.

const TEXT = "As long as you've completed a dungeon, this creature has double strike.";

export default defineCard({
  name: "Gloom Stalker",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Ranger"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "completed-dungeon" },
      grantKeywords: ["double-strike"],
      text: TEXT,
    },
  ],
});
