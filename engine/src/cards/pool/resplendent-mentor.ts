import { defineCard } from "../define.js";

// EDHREC rank 15122.

const TEXT = "White creatures you control have \"{T}: You gain 1 life.\"";

export default defineCard({
  name: "Resplendent Mentor",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      // Itself included while it's white.
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"], controlledBy: "you" } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "gain-life", amount: 1 },
          resolve: null,
          text: "{T}: You gain 1 life.",
        },
      ],
      text: TEXT,
    },
  ],
});
