import { defineCard } from "../define.js";

export default defineCard({
  name: "Retaliate",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy all creatures that dealt damage to you this turn.",
  effect: { kind: "destroy-all", filter: { type: "creature", dealtDamageThisTurn: { to: "you" } } },
});
