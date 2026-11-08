import { defineCard } from "../define.js";

// EDHREC rank 7698.
const CHAPTER_I = "I — Gain control of target creature for as long as this Saga remains on the battlefield.";
const CHAPTER_II = "II — Until your next turn, creatures your opponents control attack each combat if able.";
const CHAPTER_III = "III — Each tapped creature deals damage to itself equal to its power.";

export default defineCard({
  name: "The Akroan War",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: ["creature"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSource: true },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "restrict", filter: { type: "creature", controlledBy: "opponent" }, restrictions: ["must-attack"], duration: "until-your-next-turn" },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "each-deals-damage", filter: { type: "creature", tapped: true }, amount: "its-power", to: "itself" },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
