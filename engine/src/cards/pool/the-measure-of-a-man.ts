import { defineCard } from "../define.js";

// EDHREC rank 31649.
//
// Chapter I exiles linked to this Saga's stint (rule 607.2a — `linked`), and
// chapter III returns the card so linked, as The Princess Takes Flight does. A
// token exiled ceases to exist, so "nontoken" only narrows the target.

const I_TEXT = "I — Exile up to one target nontoken artifact or creature.";
const II_TEXT = "II — Investigate.";
const III_TEXT = "III — Return the exiled card to the battlefield under its owner's control. You gain 2 life.";

export default defineCard({
  name: "The Measure of a Man",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [
        { kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"], token: false } } },
      ],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", investigate: true, count: 1 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-exiled-by-source", linked: "battlefield" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
