import { defineCard } from "../define.js";

// EDHREC rank 14469.
const ENTERS_TEXT =
  "When this enchantment enters, you draw three cards, gain 6 life, and create three 2/1 black Bat creature tokens with flying.";
const END_TEXT = "At the beginning of your end step, you discard a card, lose 2 life, and sacrifice a creature.";
const LEAVES_TEXT =
  "When this enchantment leaves the battlefield, you discard three cards, lose 6 life, and sacrifice three creatures.";

export default defineCard({
  name: "Greed's Gambit",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${END_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "gain-life", amount: 6 },
          { kind: "create-token", token: "Bat Token (Greed's Gambit)", count: 3 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "lose-life", amount: 2 },
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 3 },
          { kind: "lose-life", amount: 6 },
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 3 },
        ],
      },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
