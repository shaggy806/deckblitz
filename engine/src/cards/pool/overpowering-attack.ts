import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-05] Once an Assassin creature or commander you control deals combat damage to a player
//     in a turn, you can cast spells for their freerunning costs for the rest of that turn. It
//     doesn't matter what happens to that Assassin or commander after that.

export default defineCard({
  name: "Overpowering Attack",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Freerunning {2}{R} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nUntap all creatures you control that attacked this turn. If it's your main phase, there is an additional combat phase after this phase, followed by an additional main phase.",
  freerunning: { cost: "{2}{R}" },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you", attackedThisTurn: true } },
      {
        // "Your main phase" is Grim Reaper's Sprint's main-phase steps on your
        // own turn. A combat phase then a main phase after this main phase is
        // Relentless Assault's plain `additional-combat`.
        kind: "conditional",
        condition: {
          kind: "all",
          of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] }],
        },
        then: { kind: "additional-combat" },
      },
    ],
  },
});
