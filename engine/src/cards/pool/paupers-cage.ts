import { defineCard } from "../define.js";

const TEXT = "At the beginning of each opponent's upkeep, if that player has two or fewer cards in hand, this artifact deals 2 damage to that player.";

export default defineCard({
  name: "Paupers' Cage",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atMost: 2 } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
