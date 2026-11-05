import { defineCard } from "../define.js";

const TEXT = "At the beginning of each opponent's upkeep, if that player has seven or more cards in hand, this artifact deals 4 damage to that player.";

export default defineCard({
  name: "Ebony Owl Netsuke",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atLeast: 7 } },
      targets: [],
      effect: { kind: "damage", amount: 4, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
