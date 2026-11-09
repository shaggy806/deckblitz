import { defineCard } from "../define.js";

// The one card that ends the combat phase (rule 724.2). "Your opponents can't
// cast spells this turn" comes first and outlasts the combat phase: they can
// still activate abilities and play lands (the rulings).
export default defineCard({
  name: "Mandate of Peace",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during combat.\nYour opponents can't cast spells this turn.\nEnd the combat phase. (Remove all attackers and blockers from combat. Exile all spells and abilities from the stack, including this spell.)",
  castOnlyIf: { kind: "turn-structure", duringCombat: true },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prohibit", prohibits: [{ act: "cast", who: "each-opponent" }] },
      { kind: "end-the-combat-phase" },
    ],
  },
});
