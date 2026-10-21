import { defineCard } from "../define.js";

const CHAPTER_I = "I — This Saga deals 1 damage to each creature without flying.";
const CHAPTER_II = "II — Add {R}{R}.";
const CHAPTER_III = "III — Sacrifice a Mountain. If you do, this Saga deals 3 damage to each creature.";

export default defineCard({
  name: "The First Eruption",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 2 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { subtype: "Mountain" }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
            then: { kind: "damage-all", filter: { type: "creature" }, amount: 3 },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
