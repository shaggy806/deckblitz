import { defineCard } from "../define.js";

const LANDS = "Each player may play an additional land on each of their turns.";
const DRAW = "At the beginning of each player's upkeep, if that player has no cards in hand, that player draws three cards.";

export default defineCard({
  name: "Ghirapur Orrery",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${LANDS}\n${DRAW}`,
  static: [{ affects: { scope: "self" }, extraLandsPerTurn: 1, extraLandsForEachPlayer: true, text: LANDS }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atMost: 0 } },
      targets: [],
      effect: { kind: "draw", amount: 3, who: "active-player" },
      resolve: null,
      text: DRAW,
    },
  ],
});
