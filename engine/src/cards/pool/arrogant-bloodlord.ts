import { defineCard } from "../define.js";

// EDHREC rank 28946.

const TEXT =
  "Whenever this creature blocks or becomes blocked by a creature with power 1 or less, destroy this creature at end of combat.";
const DESTROY = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  effect: { kind: "destroy", target: "source" },
  text: "Destroy this creature.",
} as const;

export default defineCard({
  name: "Arrogant Bloodlord",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 4,
  toughness: 4,
  text: TEXT,
  // The other creature's power is checked only as it blocks or becomes
  // blocked, and each such creature triggers it once (the rulings).
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { power: { op: "lte", n: 1 } } },
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self", blocker: { power: { op: "lte", n: 1 } } },
      sameAbilityAs: 0,
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
  ],
});
