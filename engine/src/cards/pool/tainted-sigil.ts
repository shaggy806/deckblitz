import { defineCard } from "../define.js";

export default defineCard({
  name: "Tainted Sigil",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["artifact"],
  text: "{T}, Sacrifice this artifact: You gain life equal to the total life lost by all players this turn. (Damage causes loss of life.)",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { turnStat: "life-lost", who: "each-player" } },
      resolve: null,
      text: "{T}, Sacrifice this artifact: You gain life equal to the total life lost by all players this turn.",
    },
  ],
});
