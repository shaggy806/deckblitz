import { defineCard } from "../define.js";

// EDHREC rank 16897.
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
//   [2023-11-10] Multiple finality counters on a single permanent are redundant.
//   [2023-11-10] Finality counters work on any permanent, not only creatures. If a permanent with
//     a finality counter on it would be put into a graveyard from the battlefield, exile it
//     instead.
//   [2023-11-10] Finality counters don't stop permanents from going to zones other than the
//     graveyard from the battlefield. For example, if a permanent with a finality counter on it
//     would be put into its owner's hand from the battlefield, it does so normally.
//   [2023-11-10] Finality counters aren't keyword counters, and a finality counter doesn't give
//     any abilities to the permanent it's on. If that permanent loses its abilities and then would
//     go to a graveyard, it will still be exiled instead.

export default defineCard({
  name: "Uchbenbak, the Great Mistake",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Skeleton", "Horror"],
  power: 6,
  toughness: 4,
  keywords: ["vigilance", "menace"],
  text: "Vigilance, menace\nDescend 8 — {4}{U}{B}: Return this card from your graveyard to the battlefield with a finality counter on it. Activate only if there are eight or more permanent cards in your graveyard and only as a sorcery. (If a creature with a finality counter on it would die, exile it instead.)",
  activated: [
    {
      cost: { mana: "{4}{U}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      // Descend 8: permanent cards are those that aren't instants or
      // sorceries — this card itself among them.
      condition: { kind: "cards-in-graveyard", atLeast: 8, filter: { notTypes: ["instant", "sorcery"] } },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", withCounters: { kind: "finality", amount: 1 } },
      resolve: null,
      text: "Descend 8 — {4}{U}{B}: Return this card from your graveyard to the battlefield with a finality counter on it. Activate only if there are eight or more permanent cards in your graveyard and only as a sorcery.",
    },
  ],
});
