import { defineCard } from "../define.js";

// EDHREC rank 16980. Each gain is its own trigger, the loss twice what was
// gained, by the player who gained it.
const TEXT = "Until end of turn, whenever a player gains life, that player loses 2 life for each 1 life they gained.";

export default defineCard({
  name: "False Cure",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "gains-life", who: "any" } },
    effect: { kind: "lose-life", who: "trigger-player", amount: { product: [2, { triggerValue: true }] } },
    text: "Whenever a player gains life this turn, that player loses 2 life for each 1 life they gained.",
  },
});
