import { defineCard } from "../define.js";

// EDHREC rank 10967.

export default defineCard({
  name: "Discontinuity",
  manaCost: "{3}{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  selfCostReduction: { condition: { kind: "your-turn" }, reduceGeneric: 2, reduceColored: "{U}{U}" },
  text: "During your turn, this spell costs {2}{U}{U} less to cast.\nEnd the turn. (Exile all spells and abilities from the stack, including this card. The player whose turn it is discards down to their maximum hand size. Damage wears off, and \"this turn\" and \"until end of turn\" effects end.)",
  effect: { kind: "end-the-turn" },
});
