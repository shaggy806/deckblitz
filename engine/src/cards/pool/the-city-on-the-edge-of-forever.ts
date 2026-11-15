import { defineCard } from "../define.js";

// EDHREC rank 30251.

const I_TEXT =
  'I — All artifacts and creatures phase out. Create a 0/1 white Human creature token with "Permanents can\'t phase in." (Treat phased-out permanents and anything attached to them as though they don\'t exist.)';
const II_TEXT = "II — You draw two cards and each player loses 2 life.";
const III_TEXT = "III — Sacrifice a creature token. If you do, you gain 5 life.";

// The phased-out permanents stay out while the Human is on the battlefield
// (the "phase-in" prohibition), each phasing in at its controller's next
// untap step once it's gone (rule 502.1).
export default defineCard({
  name: "The City on the Edge of Forever",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "phase-out", filter: { typesAnyOf: ["artifact", "creature"] } },
          { kind: "create-token", token: "Human Token (Permanents can't phase in)", count: 1 },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "lose-life", amount: 2, who: "each-player" },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "creature", token: true }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
            then: { kind: "gain-life", amount: 5 },
          },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
