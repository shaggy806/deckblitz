import { defineCard } from "../define.js";

// A transforming Saga; the back face is Vision of the Unspeakable
// (vision-of-the-unspeakable.ts).
const CHAPTER_I = "I — Creatures you don't control get -2/-0 until your next turn.";
const CHAPTER_II =
  "II — If you have one or fewer cards in hand, draw four cards. Otherwise, scry 2, then draw two cards.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Behold the Unspeakable",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["Behold the Unspeakable", "Vision of the Unspeakable"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [],
      // The creatures you don't control as it resolves (the ruling).
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -2,
        toughness: 0,
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "hand-size", atMost: 1 },
        then: { kind: "draw", amount: 4 },
        else: { kind: "scry", amount: 2, then: { kind: "draw", amount: 2 } },
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
