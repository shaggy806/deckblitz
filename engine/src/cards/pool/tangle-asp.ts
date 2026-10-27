import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 23064. Dread Specter's shape with no colour
// clause: "blocks a creature" reads the creature it blocks, "becomes blocked
// by a creature" fires once per blocker, and each destroys that creature at
// end of combat, only if it's still that creature (rule 400.7).

const TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, destroy that creature at end of combat.";
const DESTROY = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  effect: { kind: "destroy", target: "trigger-object" },
  text: "Destroy that creature.",
} as const;

export default defineCard({
  name: "Tangle Asp",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
  ],
});
