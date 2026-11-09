import { defineCard } from "../define.js";

const TEXT =
  "Each Vampire creature card you own that isn't on the battlefield has madness. The madness cost is equal to its mana cost. (If you discard a card with madness, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)";

// Madness does nothing outside a discard, and a card is discarded from a hand
// (rules 702.35a, 701.9a), so the grant is read there.
export default defineCard({
  name: "Falkenrath Gorger",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Berserker"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsToHand: { filter: { type: "creature", subtype: "Vampire" }, keywordValues: [{ keyword: "madness", cost: "mana-cost" }] },
      text: TEXT,
    },
  ],
});
