import { defineCard } from "../define.js";

const NO_ATTACK = "Non-Eye creatures you control can't attack.";
const BLOCKED_TEXT = "Whenever this creature becomes blocked by a creature, destroy that creature.";

export default defineCard({
  name: "Evil Eye of Urborg",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Eye"],
  power: 6,
  toughness: 3,
  text: `${NO_ATTACK}\n${BLOCKED_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", notSubtypes: ["Eye"] } },
      restrictions: ["cant-attack"],
      text: NO_ATTACK,
    },
  ],
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
});
