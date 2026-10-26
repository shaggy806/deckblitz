import { defineCard } from "../define.js";

const GRANTED_TEXT = "{T}: Target player mills a card.";

export default defineCard({
  name: "Screeching Sliver",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  text: `All Slivers have "${GRANTED_TEXT}"`,
  static: [
    {
      // Every Sliver, whoever controls it.
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["player"],
          effect: { kind: "mill", target: 0, amount: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `All Slivers have "${GRANTED_TEXT}"`,
    },
  ],
});
