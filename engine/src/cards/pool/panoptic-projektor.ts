import { defineCard } from "../define.js";

const REDUCE = "{T}: The next face-down creature spell you cast this turn costs {3} less to cast.";
const DOUBLE =
  "If turning a face-down permanent face up causes a triggered ability of a permanent you control to trigger, that ability triggers an additional time.";

export default defineCard({
  name: "Panoptic Projektor",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${REDUCE}\n${DOUBLE}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, filter: { type: "creature", faceDown: true }, reduceGeneric: 3 },
      resolve: null,
      text: REDUCE,
    },
  ],
  static: [{ affects: { scope: "self" }, doubleTriggers: { cause: "turned-face-up" }, text: DOUBLE }],
});
