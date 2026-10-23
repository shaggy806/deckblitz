import { defineCard } from "../define.js";

export default defineCard({
  name: "Corpse Churn",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Mill three cards, then you may return a creature card from your graveyard to your hand. (To mill three cards, put the top three cards of your library into your graveyard.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 3 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { type: "creature" },
      },
    ],
  },
});
