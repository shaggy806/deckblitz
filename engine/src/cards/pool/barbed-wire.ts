import { defineCard } from "../define.js";

export default defineCard({
  name: "Barbed Wire",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "At the beginning of each player's upkeep, this artifact deals 1 damage to that player.\n{2}: Prevent the next 1 damage that would be dealt by this artifact this turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "active-player" },
      resolve: null,
      text: "At the beginning of each player's upkeep, this artifact deals 1 damage to that player.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "damage-rule", by: { target: "source" }, amount: 1 },
      resolve: null,
      text: "{2}: Prevent the next 1 damage that would be dealt by this artifact this turn.",
    },
  ],
});
