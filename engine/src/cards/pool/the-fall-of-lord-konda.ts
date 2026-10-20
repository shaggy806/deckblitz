import { defineCard } from "../define.js";

// EDHREC rank 12045.
//
// Chapter II is Homeward Path's shape over every permanent (one control
// change, one timestamp — rule 613.7b). Chapter III is Boseiju Reaches
// Skyward's: it comes back as Fragment of Konda, a new object.
const I_TEXT = "I — Exile target creature an opponent controls with mana value 4 or greater.";
const II_TEXT = "II — Each player gains control of all permanents they own.";
const III_TEXT = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "The Fall of Lord Konda",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  faces: ["The Fall of Lord Konda", "Fragment of Konda"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { type: "creature", manaValue: { op: "gte", n: 4 } },
        },
      ],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "gain-control-all", filter: {}, untilEndOfTurn: false, who: "owner" },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
