import { defineCard } from "../define.js";

// EDHREC rank 11082.
const CHAPTER_I = "I — You draw three cards and you lose 3 life.";
const CHAPTER_II = "II — Mill three cards.";
const CHAPTER_III =
  "III — Choose up to three target creature cards with total mana value 8 or less in your graveyard. Return each of them to the battlefield with a necrodermis counter on it. They're artifacts in addition to their other types.";

export default defineCard({
  name: "The War in Heaven",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "lose-life", amount: 3 },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
          max: 3,
          maxTotalManaValue: 8,
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: {
          kind: "put-onto-battlefield",
          target: 0,
          withCounters: { kind: "necrodermis", amount: 1 },
          enterAs: { addTypes: ["artifact"] },
        },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
