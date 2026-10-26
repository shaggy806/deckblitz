import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 30930.
//
// Cockatrice's shape with "nonblack" for "non-Wall": "blocks a nonblack
// creature" asks the creature it blocks as the block is declared, and
// "becomes blocked by a nonblack creature" fires once per such blocker. Each
// destroys that creature at end of combat, only if it's still that creature
// (rule 400.7).

const TEXT =
  "Whenever this creature blocks or becomes blocked by a nonblack creature, destroy that creature at end of combat.";
const DESTROY = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  effect: { kind: "destroy", target: "trigger-object" },
  text: "Destroy that creature.",
} as const;

export default defineCard({
  name: "Dread Specter",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { notColors: ["B"] } },
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notColors: ["B"] } },
      sameAbilityAs: 0,
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
  ],
});
