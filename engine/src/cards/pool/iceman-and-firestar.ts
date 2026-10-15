import { defineCard } from "../define.js";

// EDHREC rank 25624.
//
// A blue-red spell triggers both abilities.

const BLUE_TEXT = "Whenever you cast a blue spell, tap up to one target creature.";
const RED_TEXT = "Whenever you cast a red spell, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Iceman and Firestar",
  manaCost: "{2}{U/R}{U/R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${BLUE_TEXT}\n${RED_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: BLUE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: RED_TEXT,
    },
  ],
});
