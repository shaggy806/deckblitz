import { defineCard } from "../define.js";

export default defineCard({
  name: "Reprisal",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature with power 4 or greater. It can't be regenerated.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
