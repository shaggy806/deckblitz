import { defineCard } from "../define.js";

// EDHREC rank 19987. II is a delayed triggered ability for the rest of the
// turn (rule 603.7c) with a target of its own, chosen each time it
// triggers; it keeps working after the Saga is sacrificed.
const CHAPTER_I = "I — You may discard a card. If you do, draw two cards.";
const CHAPTER_II = "II — Whenever you cast a spell this turn, put a +1/+1 counter on target creature you control.";
const CHAPTER_III = "III — Target creature you control deals damage equal to its power to each opponent.";

export default defineCard({
  name: "Origin of Thor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw two cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 2 } },
          ],
        },
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "cast-spell", who: "you" }, targets: ["creature-you-control"] },
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        text: "Whenever you cast a spell this turn, put a +1/+1 counter on target creature you control.",
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: ["creature-you-control"],
      effect: { kind: "damage", who: "each-opponent", amount: { powerOf: 0 }, from: { target: 0 } },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
