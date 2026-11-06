import { defineCard } from "../define.js";

// EDHREC rank 29708.
//
// "A combat phase" is anyone's (rule 506.1); ending it is rule 724.2.

export default defineCard({
  name: "Merciful Mandate",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Untap all creatures you control. If it's a combat phase, you may end the combat phase. (Remove all attackers " +
    "and blockers from combat. Exile all spells and abilities from the stack, including this spell.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      {
        kind: "conditional",
        condition: { kind: "turn-structure", duringCombat: true },
        then: { kind: "may", prompt: "End the combat phase?", effect: { kind: "end-the-combat-phase" } },
      },
    ],
  },
});
