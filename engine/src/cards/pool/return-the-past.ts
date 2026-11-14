import { defineCard } from "../define.js";

const FLASHBACK_TEXT =
  "During your turn, each instant and sorcery card in your graveyard has flashback. " +
  "Its flashback cost is equal to its mana cost.";

// Iroh, Grand Lotus's shape without the Lesson split: a `grantsToGraveyard`
// static gated to your turn. A split card's half is cast for that half's own
// mana cost (rule 709.3, `flashbacksOf` reading the face being cast).
export default defineCard({
  name: "Return the Past",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: FLASHBACK_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantsToGraveyard: {
        filter: { typesAnyOf: ["instant", "sorcery"] },
        flashback: { cost: "mana-cost" },
      },
      text: FLASHBACK_TEXT,
    },
  ],
});
