import { defineCard } from "../define.js";

// EDHREC rank 7922.
//
// Ruling: you pay all costs and follow all timing rules for cards played
// this way (a land only with a land play left).
//
// Chapter I's window is the impulse permission's "during any turn you put a
// lore counter on this Saga" (`sourceDid: "lore-counter"`). Chapters II and
// III are Kumano Faces Kakkazan's "when you next cast a creature spell this
// turn", the haste given to that spell kept by the permanent it becomes
// (rule 400.7a — Tyvar Kell's emblem).

const CHAPTER_I =
  "I — Chain — Exile the top card of your library. During any turn you put a lore counter on this Saga, you may play that card.";
const CHAPTER_II_III =
  "II, III — Gestalt Mode — When you next cast a creature spell this turn, it gains haste until end of turn.";

export default defineCard({
  name: "Summon: Brynhildr",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Knight"],
  power: 2,
  toughness: 1,
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "while-exiled", play: true, sourceDid: "lore-counter" },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: { type: "creature" } },
        effect: { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" },
        text: "When you next cast a creature spell this turn, it gains haste until end of turn.",
      },
      resolve: null,
      text: CHAPTER_II_III,
    },
  ],
});
