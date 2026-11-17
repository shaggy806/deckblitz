import { defineCard } from "../define.js";

const TEXT = "Rather than pay the mana cost for a spell, its controller may discard a card that shares a color with that spell.";

export default defineCard({
  name: "Dream Halls",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        anyPlayer: true,
        discard: { sharesColor: true, text: "a card that shares a color with that spell" },
      },
      text: TEXT,
    },
  ],
});
