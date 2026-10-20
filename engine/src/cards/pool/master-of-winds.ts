import { defineCard } from "../define.js";

// EDHREC rank 20855.
//
// Rulings:
//   [2020-09-25] You don't choose a power and toughness for Master of Winds as its ability
//     triggers. Rather, as it resolves, you choose whether to have Master of Winds become 4/1,
//     become 1/4, or not change its power and toughness.
//   [2020-09-25] The ability overwrites any previous effects that set its power and/or toughness
//     to specific values (layer 7b).
//
// The three-way choice as it resolves is a `may` (no change, or a change)
// then a one-of-two `modal`, both answered at resolution.

const ENTER_TEXT = "When this creature enters, draw two cards, then discard a card.";
const CAST_TEXT =
  "Whenever you cast an instant, sorcery, or Wizard spell, you may have this creature's base power and toughness become 4/1 or 1/4 until end of turn.";

export default defineCard({
  name: "Master of Winds",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx", "Wizard"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { subtype: "Wizard" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have this creature's base power and toughness become 4/1 or 1/4 until end of turn?",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Base power and toughness 4/1 until end of turn",
              effect: {
                kind: "animate",
                target: "source",
                power: 4,
                toughness: 1,
                addTypes: [],
                addSubtypes: [],
                duration: "end-of-turn",
              },
            },
            {
              text: "Base power and toughness 1/4 until end of turn",
              effect: {
                kind: "animate",
                target: "source",
                power: 1,
                toughness: 4,
                addTypes: [],
                addSubtypes: [],
                duration: "end-of-turn",
              },
            },
          ],
        },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
