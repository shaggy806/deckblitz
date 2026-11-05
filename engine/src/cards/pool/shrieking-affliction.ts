import { defineCard } from "../define.js";

const TEXT = "At the beginning of each opponent's upkeep, if that player has one or fewer cards in hand, they lose 3 life.";

export default defineCard({
  name: "Shrieking Affliction",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atMost: 1 } },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
