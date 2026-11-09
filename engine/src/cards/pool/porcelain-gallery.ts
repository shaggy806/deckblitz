import { defineCard } from "../define.js";

// Dollmaker's Shop // Porcelain Gallery's right door: layer 7b, a live count.
const COUNT = { sourceCount: { countOf: { type: "creature", controlledBy: "you" } } } as const;
const TEXT = "Creatures you control have base power and toughness each equal to the number of creatures you control.";

export default defineCard({
  name: "Porcelain Gallery",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${TEXT}\n(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      setBasePt: { power: COUNT, toughness: COUNT },
      text: TEXT,
    },
  ],
});
