import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 16163.
//
// Epic (rule 702.50) is the `epic` effect, last in the spell's sequence: each upkeep's copy
// searches again, and you can't cast spells for the rest of the game.
const TEXT =
  "Search your library for an enchantment card, put it onto the battlefield, then shuffle.\nEpic (For the rest of the game, you can't cast spells. At the beginning of each of your upkeeps, copy this spell except for its epic ability.)";

export default defineCard({
  name: "Enduring Ideal",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: { type: "enchantment" }, destination: "battlefield", min: 0, max: 1 },
      { kind: "epic" },
    ],
  },
});
