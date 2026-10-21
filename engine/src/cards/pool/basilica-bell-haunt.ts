import { defineCard } from "../define.js";

// EDHREC rank 20921. You gain 3 life even if no opponent can discard (the
// ruling).

const TEXT = "When this creature enters, each opponent discards a card and you gain 3 life.";

export default defineCard({
  name: "Basilica Bell-Haunt",
  manaCost: "{W}{W}{B}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
