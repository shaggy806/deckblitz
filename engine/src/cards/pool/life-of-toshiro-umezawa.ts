import { defineCard } from "../define.js";

// EDHREC rank 17661. Chapters I and II are one modal ability (rule 714.2c's
// "I, II"), announced as it goes on the stack, so a chosen mode brings its
// target then (rules 603.3c, 700.2) — Summon: Magus Sisters' shape. Chapter
// III is Azusa's Many Journeys': it comes back as Memory of Toshiro, a new
// object that's no Saga.

const PUMP_MODE = "Target creature gets +2/+2 until end of turn.";
const SHRINK_MODE = "Target creature gets -1/-1 until end of turn.";
const LIFE_MODE = "You gain 2 life.";
const CHAPTER_I_II = `I, II — Choose one —\n• ${PUMP_MODE}\n• ${SHRINK_MODE}\n• ${LIFE_MODE}`;
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Life of Toshiro Umezawa",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I_II}\n${CHAPTER_III}`,
  faces: ["Life of Toshiro Umezawa", "Memory of Toshiro"],
  transform: true,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: PUMP_MODE,
            targets: ["creature"],
            effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          },
          {
            text: SHRINK_MODE,
            targets: ["creature"],
            effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
          },
          { text: LIFE_MODE, effect: { kind: "gain-life", amount: 2 } },
        ],
      },
      resolve: null,
      text: CHAPTER_I_II,
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
