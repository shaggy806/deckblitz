import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 13162.
//
// Dread Specter's trigger, word for word: "blocks a nonblack creature" asks
// the creature it blocks as the block is declared, "becomes blocked by a
// nonblack creature" fires once per such blocker; each destroys that
// creature at end of combat even if this one is gone by then (the ruling).

const TEXT =
  "Whenever this creature blocks or becomes blocked by a nonblack creature, destroy that creature at end of combat.";
const DESTROY = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  effect: { kind: "destroy", target: "trigger-object" },
  text: "Destroy that creature.",
} as const;

export default defineCard({
  name: "Gorgon Recluse",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon"],
  power: 2,
  toughness: 4,
  madness: { cost: "{B}{B}" },
  text: "Whenever this creature blocks or becomes blocked by a nonblack creature, destroy that creature at end of combat.\nMadness {B}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
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
