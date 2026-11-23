import { defineCard } from "../define.js";

// Playtest card. A Food by subtype only: the Food token's sacrifice ability
// isn't printed here, so it has none.

const ENTERS_TEXT = "Bag of Stroopwafels enters the battlefield with eight stroopwafel counters on it.";
const EAT_TEXT = "{3}, {T}, Remove a stroopwafel counter from Bag of Stroopwafels: You gain 3 life and draw a card.";

export default defineCard({
  name: "Bag of Stroopwafels",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food"],
  text: `${ENTERS_TEXT}\n${EAT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "stroopwafel", amount: 8 } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true, removeCounter: { kind: "stroopwafel", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: EAT_TEXT,
    },
  ],
});
