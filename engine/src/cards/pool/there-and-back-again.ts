import { defineCard } from "../define.js";

const I_TEXT = "I — Up to one target creature can't block for as long as you control this Saga. The Ring tempts you.";
const II_TEXT = "II — Search your library for a Mountain card, put it onto the battlefield, then shuffle.";
const III_TEXT =
  'III — Create Smaug, a legendary 6/6 red Dragon creature token with flying, haste, and "When Smaug dies, create fourteen Treasure tokens."';

export default defineCard({
  name: "There and Back Again",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-block"], duration: "while-you-control-source" },
          { kind: "the-ring-tempts-you" },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "search-library", filter: { subtype: "Mountain" }, destination: "battlefield", min: 0, max: 1 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "create-token", token: "Smaug", count: 1 },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
