import { defineCard } from "../define.js";

// EDHREC rank 14970. Chapter I is one damage event (Goblin Chainwhirler's
// simultaneous sequence, to planeswalkers only); chapter II is Yuna, Grand
// Summoner's delayed "when you next cast a creature spell this turn"; chapter
// III is Michiko's Reign of Truth's.

const CHAPTER_I = "I — This Saga deals 1 damage to each opponent and each planeswalker they control.";
const CHAPTER_II =
  "II — When you next cast a creature spell this turn, that creature enters with an additional +1/+1 counter on it.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Kumano Faces Kakkazan",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["Kumano Faces Kakkazan", "Etching of Kumano"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "damage-all", filter: { type: "planeswalker", controlledBy: "opponent" }, amount: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: { type: "creature" } },
        effect: { kind: "enters-with-counters", target: "trigger-object", counter: "+1/+1", amount: 1 },
        text: "When you next cast a creature spell this turn, that creature enters with an additional +1/+1 counter on it.",
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
