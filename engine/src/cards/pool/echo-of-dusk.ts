import { defineCard } from "../define.js";

// EDHREC rank 18599.
//
// Rulings:
//   [2023-11-10] Cards with the ability word "descend N" have abilities that care if you have at
//     least N permanent cards in your graveyard.
//   [2023-11-10] Some descend triggered abilities include intervening "if" clauses (i.e. "if you
//     have [four or eight] permanent cards in your graveyard" in the middle of the ability). Each
//     of these abilities checks your graveyard at the moment it would trigger to see if it does.
//     If you don't have the required number of permanent cards in your graveyard at that time, the
//     ability doesn't trigger at all. If it does trigger, it will check again as it tries to
//     resolve. If you don't have the required number of permanent cards in your graveyard at that
//     time, the ability won't resolve and none of its effects will happen.

export default defineCard({
  name: "Echo of Dusk",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Spirit"],
  power: 2,
  toughness: 2,
  text: "Descend 4 — As long as there are four or more permanent cards in your graveyard, this creature gets +1/+1 and has lifelink.",
  static: [
    {
      // Descend 4: permanent cards are those that aren't instants or sorceries.
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { notTypes: ["instant", "sorcery"] } },
      grantPt: [1, 1],
      grantKeywords: ["lifelink"],
      text: "Descend 4 — As long as there are four or more permanent cards in your graveyard, this creature gets +1/+1 and has lifelink.",
    },
  ],
});
