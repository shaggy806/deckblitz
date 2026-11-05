import { defineCard } from "../define.js";

// EDHREC rank 27235.

export default defineCard({
  name: "Bring Down",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  assist: true,
  text: "Assist (Another player can pay up to {3} of this spell's cost.)\nDestroy target creature with power 4 or greater.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: { kind: "destroy", target: 0 },
});
