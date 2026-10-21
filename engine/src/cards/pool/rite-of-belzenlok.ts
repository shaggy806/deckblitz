import { defineCard } from "../define.js";

// EDHREC rank 15959.
// Makes Cleric → "0/1 Black Cleric Token"; Demon → "6/6 Black Demon Token (Flying, Trample, Upkeep Sacrifice)".

const CLERIC_TEXT = "I, II — Create two 0/1 black Cleric creature tokens.";
const DEMON_TEXT =
  'III — Create a 6/6 black Demon creature token with flying, trample, and "At the beginning of your upkeep, sacrifice another creature. If you can\'t, this token deals 6 damage to you."';

export default defineCard({
  name: "Rite of Belzenlok",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CLERIC_TEXT}\n${DEMON_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: { kind: "create-token", token: "0/1 Black Cleric Token", count: 2 },
      resolve: null,
      text: CLERIC_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "create-token", token: "6/6 Black Demon Token (Flying, Trample, Upkeep Sacrifice)", count: 1 },
      resolve: null,
      text: DEMON_TEXT,
    },
  ],
});
