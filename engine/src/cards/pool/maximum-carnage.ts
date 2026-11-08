import { defineCard } from "../define.js";

// I — Kardur, Doomscourge's rule of the game over every creature, yours
// included: each attacks each combat if able, and a player other than you if
// able (your own always do), until your next turn. None of them is goaded.
const CHAPTER_I =
  "I — Until your next turn, each creature attacks each combat if able and attacks a player other than you if able.";
const CHAPTER_II = "II — Add {R}{R}{R}.";
const CHAPTER_III = "III — This Saga deals 5 damage to each opponent.";

export default defineCard({
  name: "Maximum Carnage",
  manaCost: "{4}{R}",
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
      effect: { kind: "restrict", filter: { type: "creature" }, restrictions: [{ kind: "must-attack", otherThan: "you" }], duration: "until-your-next-turn" },
      resolve: null,
      text: CHAPTER_I,
    },
    { at: [2], targets: [], effect: { kind: "add-mana", mana: "R", amount: 3 }, resolve: null, text: CHAPTER_II },
    { at: [3], targets: [], effect: { kind: "damage", amount: 5, who: "each-opponent" }, resolve: null, text: CHAPTER_III },
  ],
});
