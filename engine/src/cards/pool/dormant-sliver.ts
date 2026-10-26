import { defineCard } from "../define.js";

// EDHREC rank 15201.
//
// Rulings:
//   - The controller of the Sliver that enters the battlefield draws a card, not necessarily the
//     controller of Dormant Sliver.
//   - The last ability Dormant Sliver grants itself triggers when it enters the battlefield.

const GRANTED_TEXT = "When this permanent enters, draw a card.";

export default defineCard({
  name: "Dormant Sliver",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: `All Sliver creatures have defender.\nAll Slivers have "${GRANTED_TEXT}"`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["defender"],
      text: "All Sliver creatures have defender.",
    },
    {
      // Every Sliver, whoever controls it: the granted trigger is that
      // Sliver's own, so its controller draws.
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `All Slivers have "${GRANTED_TEXT}"`,
    },
  ],
});
