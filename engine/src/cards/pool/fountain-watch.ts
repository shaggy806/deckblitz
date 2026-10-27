import { defineCard } from "../define.js";

// EDHREC rank 15600.

const TEXT = "Artifacts and enchantments you control have shroud. (They can't be the targets of spells or abilities.)";

export default defineCard({
  name: "Fountain Watch",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { typesAnyOf: ["artifact", "enchantment"], controlledBy: "you" } },
      grantKeywords: ["shroud"],
      text: TEXT,
    },
  ],
});
