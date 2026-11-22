import { defineCard } from "../define.js";

const TEXT = "Players can't cast spells that share a color with the spell most recently cast this turn.";

// "The spell most recently cast this turn" is anyone's, and still counts once
// it has resolved or been countered; a colorless one restricts nothing, and
// nothing does before the turn's first spell (`sharesColorWithLastSpellCast`).
export default defineCard({
  name: "Mana Maze",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "each-player", filter: { sharesColorWithLastSpellCast: true } }],
      text: TEXT,
    },
  ],
});
