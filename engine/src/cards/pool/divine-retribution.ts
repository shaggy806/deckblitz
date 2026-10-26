import { defineCard } from "../define.js";

export default defineCard({
  name: "Divine Retribution",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Divine Retribution deals damage to target attacking creature equal to the number of attacking creatures.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } }],
  effect: { kind: "damage", target: 0, amount: { countOf: { type: "creature", attacking: true } } },
});
