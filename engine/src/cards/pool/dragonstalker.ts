import { defineCard } from "../define.js";

// EDHREC rank 28655.

export default defineCard({
  name: "Dragonstalker",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying, protection from Dragons",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Dragon" } },
      text: "Protection from Dragons",
    },
  ],
});
