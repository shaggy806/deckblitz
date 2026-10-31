import { defineCard } from "../define.js";
import { enlist, ENLIST_TEXT } from "../helpers.js";

export default defineCard({
  name: "Coalition Warbrute",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Berserker"],
  power: 3,
  toughness: 4,
  keywords: ["trample"],
  text: `${ENLIST_TEXT}\nTrample`,
  static: [enlist()],
});
