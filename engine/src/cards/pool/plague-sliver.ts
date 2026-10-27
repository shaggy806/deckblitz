import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 28519. Every Sliver, whoever controls it:
// the granted trigger is that Sliver's own, so it damages its own controller.
//
// Rulings:
//   [2006-09-25] Each Sliver deals damage to its controller (not to Plague Sliver's controller).

const GRANTED_TEXT = "At the beginning of your upkeep, this permanent deals 1 damage to you.";

export default defineCard({
  name: "Plague Sliver",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 5,
  toughness: 5,
  text: `All Slivers have "${GRANTED_TEXT}"`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "damage", amount: 1, who: "you" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `All Slivers have "${GRANTED_TEXT}"`,
    },
  ],
});
