import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 28684.
//
// One ability over two events, written as Jukai Trainee's is (a creature never
// both blocks and becomes blocked in one combat). Blocking: the trigger object
// is the creature it blocks (`object: "blocked"`), non-Wall as part of the
// trigger condition (Snarespinner's `whileCondition`). Blocked: Infernal
// Medusa's non-Wall `blocker`. Either way a delayed trigger destroys that
// creature at end of combat, only if it's still that creature (rule 400.7).
const TEXT =
  "Whenever this creature blocks or becomes blocked by a non-Wall creature, destroy that creature at end of combat.";
const DESTROY = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  effect: { kind: "destroy", target: "trigger-object" },
  text: "Destroy that creature.",
} as const;

export default defineCard({
  name: "Thicket Basilisk",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Basilisk"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { notSubtypes: ["Wall"] } },
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notSubtypes: ["Wall"] } },
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
  ],
});
