import { defineCard } from "../define.js";

const DRAW =
  "At the beginning of each player's draw step, that player draws an additional card, then discards a card.";

export default defineCard({
  name: "Anvil of Bogardan",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `Players have no maximum hand size.\n${DRAW}`,
  static: [{ affects: { scope: "self" }, noMaxHandSize: "each-player", text: "Players have no maximum hand size." }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, who: "active-player" },
          { kind: "discard", target: "active-player", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW,
    },
  ],
});
