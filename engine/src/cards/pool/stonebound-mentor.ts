import { defineCard } from "../define.js";

// EDHREC rank 20927. The batched graveyard trigger: once per event (the
// ruling).
const TEXT = "Whenever one or more cards leave your graveyard, scry 1.";

export default defineCard({
  name: "Stonebound Mentor",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Spirit", "Advisor"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
