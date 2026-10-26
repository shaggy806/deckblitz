import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 8712.
//
// Rulings:
//   [2012-10-01] The amount of life lost is calculated when the triggered ability resolves.
//
// Forsaken Wastes' "players can't gain life" and its each-upkeep trigger, with
// Radioactive Man's "half their life, rounded up" read for the active player.
const UPKEEP_TEXT = "At the beginning of each player's upkeep, that player loses half their life, rounded up.";

export default defineCard({
  name: "Havoc Festival",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: `Players can't gain life.\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "any-player", prevent: true },
      text: "Players can't gain life.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "lose-life", who: "active-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
