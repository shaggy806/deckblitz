import { defineCard } from "../define.js";

// Every player keeps every type of mana as steps and phases end (rule 500.4) while it's on the
// battlefield — cleanup included, so mana lasts into later turns: Leyline Tyrant's
// `keepsUnspentMana` for every type, with `keepsUnspentManaEachPlayer`.

const TEXT = "Players don't lose unspent mana as steps and phases end.";

export default defineCard({
  name: "Upwelling",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      keepsUnspentMana: ["W", "U", "B", "R", "G", "C"],
      keepsUnspentManaEachPlayer: true,
      text: TEXT,
    },
  ],
});
