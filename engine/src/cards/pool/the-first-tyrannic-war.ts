import { defineCard } from "../define.js";

// EDHREC rank 11683. Warhammer 40,000 Commander.
//
// Rulings:
//   [2022-10-07] If the card you are putting onto the battlefield with the first chapter ability
//     would enter the battlefield as a copy of another permanent, it will get +1/+1 counters this
//     way only if the permanent that it is copying has a mana cost that contains {X}, regardless
//     of the original card's mana cost.
//
// Chapter I is Triassic Egg's `look-and-choose` from the hand, its counters an
// `ifMatches: { xInManaCost: true }` read as the creature is on the
// battlefield (rule 614.12) — a copy's mana cost, if it enters as one (the
// ruling); the number of lands read as the chapter resolves.
const CHAPTER_I =
  "I — You may put a creature card from your hand onto the battlefield. If its mana cost contains {X}, it enters with a number of +1/+1 counters on it equal to the number of lands you control.";
const CHAPTER_II_III = "II, III — Double the number of each kind of counter on target creature you control.";

export default defineCard({
  name: "The First Tyrannic War",
  manaCost: "{2}{G}{U}{R}",
  colors: ["U", "R", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
        withCounters: [
          {
            kind: "+1/+1",
            amount: { countOf: { type: "land", controlledBy: "you" } },
            ifMatches: { xInManaCost: true },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2, 3],
      targets: ["creature-you-control"],
      effect: { kind: "double-counters", target: 0 },
      resolve: null,
      text: CHAPTER_II_III,
    },
  ],
});
