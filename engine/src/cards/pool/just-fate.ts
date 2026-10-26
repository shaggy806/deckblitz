import { defineCard } from "../define.js";

// EDHREC rank 32041.

export default defineCard({
  name: "Just Fate",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nDestroy target attacking creature.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: { kind: "destroy", target: 0 },
});
