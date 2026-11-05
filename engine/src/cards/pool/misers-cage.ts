import { defineCard } from "../define.js";

const TEXT = "At the beginning of each opponent's upkeep, if that player has five or more cards in hand, this artifact deals 2 damage to that player.";

export default defineCard({
  name: "Misers' Cage",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atLeast: 5 } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
