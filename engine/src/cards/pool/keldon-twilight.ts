import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of each player's end step, if no creatures attacked this turn, that player sacrifices a creature of their choice that they controlled since the beginning of the turn.";

export default defineCard({
  name: "Keldon Twilight",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "not", of: { kind: "turn-stat", stat: "attacked", who: "any-player", atLeast: 1 } },
      targets: [],
      effect: { kind: "sacrifice", who: "active-player", filter: { type: "creature", controlledContinuously: true }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
