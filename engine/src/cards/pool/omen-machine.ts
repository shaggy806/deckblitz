import { defineCard } from "../define.js";

// New Phyrexia. Neither is optional (the ruling): a land goes onto the battlefield,
// under its owner's control, and anything else is cast if it can be (`mustCast`).
// One that can't be cast (no legal target, a play restriction) stays in exile.
const DRAW_STEP_TEXT =
  "At the beginning of each player's draw step, that player exiles the top card of their library. If it's a land card, the player puts it onto the battlefield. Otherwise, the player casts it without paying its mana cost if able.";

export default defineCard({
  name: "Omen Machine",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `Players can't draw cards.\n${DRAW_STEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", drawsPerTurn: 0 },
      text: "Players can't draw cards.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: "active-player", amount: 1 },
          { kind: "put-exiled-this-way-onto-battlefield", filter: { type: "land" } },
          { kind: "cast-now", from: "exiled-this-way", by: "active-player", free: true, mustCast: true },
        ],
      },
      resolve: null,
      text: DRAW_STEP_TEXT,
    },
  ],
});
