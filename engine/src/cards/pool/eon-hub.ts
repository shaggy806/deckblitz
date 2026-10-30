import { defineCard } from "../define.js";

// EDHREC rank 22072.
//
// Rulings:
//   [2004-12-01] Any triggered abilities that triggered during the untap step will go onto the
//     stack at the start of the draw step.
//   [2004-12-01] The upkeep step is skipped entirely. The turn proceeds from untap step to draw
//     step.
//   [2004-12-01] Upkeep-triggered abilities don't trigger, and "activate only during your upkeep"
//     abilities can't be activated.

const TEXT = "Players skip their upkeep steps.";

export default defineCard({
  name: "Eon Hub",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, skipsSteps: { who: "each-player", steps: ["upkeep"] }, text: TEXT }],
});
