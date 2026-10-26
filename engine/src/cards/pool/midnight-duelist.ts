import { defineCard } from "../define.js";

export default defineCard({
  name: "Midnight Duelist",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: "Protection from Vampires",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Vampire" } },
      text: "Protection from Vampires",
    },
  ],
});
