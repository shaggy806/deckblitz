import { defineCard } from "../define.js";

const LOSE_TEXT = "{W}{W}{U}{U}{B}{B}{R}{R}{G}{G}, {T}, Sacrifice this artifact: Target player loses the game.";

export default defineCard({
  name: "Door to Nothingness",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${LOSE_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}{W}{U}{U}{B}{B}{R}{R}{G}{G}", tap: true, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "lose-game", target: 0 },
      resolve: null,
      text: LOSE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
