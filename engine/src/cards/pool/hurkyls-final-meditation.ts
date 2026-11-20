import { defineCard } from "../define.js";

// EDHREC rank 17881.
//
// The {3} is a cost increase the spell prints on itself, read from its
// caster's side as its cost is determined (rule 601.2f). Ending the turn
// exiles this spell from the stack with everything else (rule 724.1).
export default defineCard({
  name: "Hurkyl's Final Meditation",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  selfCostReduction: { condition: { kind: "not", of: { kind: "your-turn" } }, increaseGeneric: 3 },
  text: "During turns other than yours, this spell costs {3} more to cast.\nReturn all nonland permanents to their owners' hands. End the turn. (Exile all spells and abilities from the stack, including this card. The player whose turn it is discards down to their maximum hand size. Damage wears off, and \"this turn\" and \"until end of turn\" effects end.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand-all", filter: { notTypes: ["land"] } },
      { kind: "end-the-turn" },
    ],
  },
});
