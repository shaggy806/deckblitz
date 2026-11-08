import { defineCard } from "../define.js";

// EDHREC rank 698. Not on a search of another player's library, by anyone (the
// rulings), and on the stack once what made them search has finished resolving.

const TEXT = "Whenever an opponent searches their library, you gain 1 life and draw a card.";

export default defineCard({
  name: "Archivist of Oghma",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Halfling", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "searches-library", who: "opponent" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
