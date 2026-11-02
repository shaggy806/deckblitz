import { defineCard } from "../define.js";

export default defineCard({
  name: "Restore the Peace",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Return each creature that dealt damage this turn to its owner's hand.",
  effect: { kind: "return-to-hand-all", filter: { type: "creature", dealtDamageThisTurn: true } },
});
