import { defineCard } from "../define.js";

const TEXT = "At the beginning of each player's end step, if that player has 5 or less life, this artifact deals 2 damage to that player.";

export default defineCard({
  name: "Razor Pendulum",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "life-total", atMost: 5 } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
