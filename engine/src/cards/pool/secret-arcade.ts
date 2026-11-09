import { defineCard } from "../define.js";

// Secret Arcade // Dusty Parlor's left door: its permanent-spell clause on the
// stack only, the way Encroaching Mycosynth's reaches a spell.
const TEXT = "Nonland permanents you control and permanent spells you control are enchantments in addition to their other types.";

export default defineCard({
  name: "Secret Arcade",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${TEXT}\n(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)`,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you", notTypes: ["land"] } },
      addTypes: ["enchantment"],
      outsideBattlefield: {
        zones: ["stack"],
        ofType: ["artifact", "battle", "creature", "enchantment", "planeswalker"],
        notType: "land",
        addTypes: ["enchantment"],
      },
      text: TEXT,
    },
  ],
});
