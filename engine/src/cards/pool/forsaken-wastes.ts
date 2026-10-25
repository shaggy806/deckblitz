import { defineCard } from "../define.js";

// EDHREC rank 14814. A world enchantment (704.5k). The becomes-target trigger
// fills its first slot with the targeting spell's controller (Thunderbreak
// Regent's shape); any spell counts, its controller's own included.

const UPKEEP_TEXT = "At the beginning of each player's upkeep, that player loses 1 life.";
const TARGET_TEXT = "Whenever this enchantment becomes the target of a spell, that spell's controller loses 5 life.";

export default defineCard({
  name: "Forsaken Wastes",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: `Players can't gain life.\n${UPKEEP_TEXT}\n${TARGET_TEXT}`,
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
      effect: { kind: "lose-life", amount: 1, who: "active-player" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true },
      // "that spell's controller" — auto-filled with the targeting player.
      targets: ["player"],
      effect: { kind: "lose-life", amount: 5, target: 0 },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
});
