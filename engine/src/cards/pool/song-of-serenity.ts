import { defineCard } from "../define.js";

const TEXT = "Creatures that are enchanted can't attack or block.";

export default defineCard({
  name: "Song of Serenity",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", enchanted: true } },
      restrictions: ["cant-attack", "cant-block"],
      text: TEXT,
    },
  ],
});
