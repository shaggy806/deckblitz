import { defineCard } from "../define.js";

export default defineCard({
  name: "Reciprocate",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target creature that dealt damage to you this turn.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", dealtDamageThisTurn: { to: "you" } } }],
  effect: { kind: "exile", target: 0 },
});
