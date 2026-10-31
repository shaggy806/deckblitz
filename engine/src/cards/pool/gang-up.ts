import { defineCard } from "../define.js";

// Battlebond. Assist (rule 702.132a): the helper may pay any of the generic
// mana in its total cost — here all of X, which the caster chooses.
export default defineCard({
  name: "Gang Up",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Assist (Another player can pay up to {X} of this spell's cost. You choose the value of X.)\nDestroy target creature with power X or less.",
  assist: true,
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: "x" } } }],
  effect: { kind: "destroy", target: 0 },
});
