import { defineCard } from "../define.js";

// Rulings:
//   If you roll doubles, ignore one of the rolls and use the result of the other.
//   When choosing blocks for creatures you don't control, you must still make legal choices.

export default defineCard({
  name: "Berserker's Frenzy",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Cast this spell only before combat or during combat before blockers are declared.\nRoll two d20 and ignore the lower roll.\n1—14 | Choose any number of creatures. They block this turn if able.\n15—20 | You choose which creatures block this turn and how those creatures block.",
  // Before combat (the beginning phase and the precombat main phase), or the
  // combat steps before blockers are declared.
  castOnlyIf: { kind: "turn-structure", steps: ["upkeep", "draw", "precombat-main", "begin-combat", "declare-attackers"] },
  targets: [],
  effect: {
    kind: "roll-dice",
    sides: 20,
    count: 2,
    keepHighest: 1,
    table: [
      {
        min: 1,
        max: 14,
        effect: {
          kind: "choose-permanents",
          filter: { type: "creature" },
          upTo: { countOf: { type: "creature" } },
          then: { kind: "restrict", target: 0, restrictions: ["must-block"] },
          prompt: "Choose any number of creatures: they block this turn if able",
        },
      },
      { min: 15, effect: { kind: "choose-combat", blocks: "all" } },
    ],
  },
});
