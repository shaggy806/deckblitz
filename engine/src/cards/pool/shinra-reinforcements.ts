import { defineCard } from "../define.js";

// EDHREC rank 12021. Mire Triton's shape.

const ENTER_TEXT = "When this creature enters, mill three cards and you gain 3 life.";

export default defineCard({
  name: "Shinra Reinforcements",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT} (To mill three cards, put the top three cards of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
