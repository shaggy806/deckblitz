import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 13414.
//
// "During an opponent's turn after their upkeep step": not your turn, and any
// step from the draw step on (no one gets priority in the untap step).

export default defineCard({
  name: "Reset",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Cast this spell only during an opponent's turn after their upkeep step.\nUntap all lands you control.",
  castOnlyIf: {
    kind: "all",
    of: [
      { kind: "not", of: { kind: "your-turn" } },
      {
        kind: "turn-structure",
        steps: [
          "draw",
          "precombat-main",
          "begin-combat",
          "declare-attackers",
          "declare-blockers",
          "combat-damage",
          "end-combat",
          "postcombat-main",
          "end",
          "cleanup",
        ],
      },
    ],
  },
  targets: [],
  effect: { kind: "untap-all", filter: { type: "land", controlledBy: "you" } },
});
