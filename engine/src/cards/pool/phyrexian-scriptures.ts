import { defineCard } from "../define.js";

// EDHREC rank 4702.
//
// Rulings:
//   [2018-04-27] The effect of Phyrexian Scriptures's first chapter ability lasts indefinitely. It
//     doesn't expire when Phyrexian Scriptures leaves the battlefield.

const CHAPTER_I =
  "I — Put a +1/+1 counter on up to one target creature. That creature becomes an artifact in addition to its other types.";
const CHAPTER_II = "II — Destroy all nonartifact creatures.";
const CHAPTER_III = "III — Exile all opponents' graveyards.";

export default defineCard({
  name: "Phyrexian Scriptures",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-types", target: 0, addTypes: ["artifact"], duration: "permanent" },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", notTypes: ["artifact"] } },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "exile-graveyard", target: "each-opponent" },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
