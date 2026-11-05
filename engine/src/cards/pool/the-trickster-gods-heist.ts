import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// EDHREC rank 11747.
//
// Rulings:
//   [2021-02-05] If one of the target permanents of the chapter I or chapter II ability is an
//     illegal target as that ability resolves, the exchange won't happen.
//   [2021-02-05] If the same player controls both target permanents as the chapter I or chapter II
//     ability resolves, nothing happens.
//   [2021-02-05] For the chapter II ability, either target can have card types the other does not.
//   [2021-02-05] For those two abilities, you don't have to control either target.
//
// Chapter II's second slot shares a card type with the first (`shares` —
// Shifting Loyalties).
const I_TEXT = "I — You may exchange control of two target creatures.";
const II_TEXT = "II — You may exchange control of two target nonbasic, noncreature permanents that share a card type.";
const III_TEXT = "III — Target player loses 3 life and you gain 3 life.";
const NONBASIC_NONCREATURE: TargetSpec = {
  kind: "permanent",
  filter: { notSupertype: "basic", notTypes: ["creature"] },
};

export default defineCard({
  name: "The Trickster-God's Heist",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
      effect: {
        kind: "may",
        prompt: "Exchange control of the two target creatures?",
        effect: { kind: "exchange-control", objects: [0, 1] },
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [NONBASIC_NONCREATURE, { kind: "other", of: NONBASIC_NONCREATURE, than: { slot: 0 }, shares: { kind: "card" } }],
      effect: {
        kind: "may",
        prompt: "Exchange control of the two target permanents?",
        effect: { kind: "exchange-control", objects: [0, 1] },
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3, target: 0 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
