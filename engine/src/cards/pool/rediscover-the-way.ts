import { defineCard } from "../define.js";

// EDHREC rank 12479.
// III is a delayed triggered ability for the rest of the turn (rule
// 603.7c) with a target of its own, chosen each time it triggers; it keeps
// working after the Saga is gone (the ruling).
const CHAPTER_I_II =
  "I, II — Look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.";
const CHAPTER_III_BODY =
  "Whenever you cast a noncreature spell this turn, target creature you control gains double strike until end of turn.";
const CHAPTER_III = `III — ${CHAPTER_III_BODY}`;

export default defineCard({
  name: "Rediscover the Way",
  manaCost: "{U}{R}{W}",
  colors: ["W", "U", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: CHAPTER_I_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "cast-spell", who: "you", noncreatureOnly: true },
          targets: ["creature-you-control"],
        },
        effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
        text: CHAPTER_III_BODY,
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
