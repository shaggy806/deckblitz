import { defineCard } from "../define.js";

// EDHREC rank 2947.
//
// Rulings:
//   [2004-12-01] The additional combat phase is directly after the combat phase in which Savage
//     Beating is cast. There isn't a main phase between the two combat phases.

export default defineCard({
  name: "Savage Beating",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: { cost: "{1}{R}", keyword: "entwine" },
  text: "Cast this spell only during combat on your turn.\nChoose one —\n• Creatures you control gain double strike until end of turn.\n• Untap all creatures you control. After this phase, there is an additional combat phase.\nEntwine {1}{R} (Choose both if you pay the entwine cost.)",
  castOnlyIf: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", duringCombat: true }] },
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Creatures you control gain double strike until end of turn.",
        effect: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "double-strike",
          duration: "end-of-turn",
        },
      },
      {
        text: "Untap all creatures you control. After this phase, there is an additional combat phase.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
            { kind: "additional-combat", afterThisPhase: true },
          ],
        },
      },
    ],
  },
});
