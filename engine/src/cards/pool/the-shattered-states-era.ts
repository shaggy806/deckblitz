import { defineCard } from "../define.js";

const CHAPTER_I = "I — Gain control of target creature until end of turn. Untap it. It gains haste until end of turn.";
const CHAPTER_II = "II — Creatures you control get +1/+0 until end of turn.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "The Shattered States Era",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["The Shattered States Era", "Nameless Conqueror"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      // Michiko's Reign of Truth's shape: it comes back as a new object, the
      // back face up, which isn't a Saga.
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
