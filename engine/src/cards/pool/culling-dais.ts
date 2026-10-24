import { defineCard } from "../define.js";

const DRAW_TEXT = "{1}, Sacrifice this artifact: Draw a card for each charge counter on this artifact.";

export default defineCard({
  name: "Culling Dais",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `{T}, Sacrifice a creature: Put a charge counter on this artifact.\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{T}, Sacrifice a creature: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      // Counted as it last existed on the battlefield (the ruling) — Crowded
      // Crypt's shape.
      effect: { kind: "draw", amount: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
