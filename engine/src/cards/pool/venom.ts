import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 25170.
//
// Rulings:
//   [2004-10-04] If this Aura is moved onto a creature after blockers are declared, creatures
//     blocking the newly-enchanted creature are not affected. This is because the ability triggers
//     at the time blocking occurs.
//
// Cockatrice's shape on the enchanted creature (`who: "attached"`): one
// ability with two trigger events (`sameAbilityAs`). "Blocks a non-Wall
// creature" asks the creature it blocks (`object: "blocked"`) as the block is
// declared; "becomes blocked by a non-Wall creature" fires once per such
// blocker. Each destroys that other creature at end of combat.

const TEXT =
  "Whenever enchanted creature blocks or becomes blocked by a non-Wall creature, destroy the other creature at end of combat.";
const DESTROY = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  effect: { kind: "destroy", target: "trigger-object" },
  text: "Destroy the other creature.",
} as const;

export default defineCard({
  name: "Venom",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "blocks", who: "attached", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { notSubtypes: ["Wall"] } },
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "attached", blocker: { notSubtypes: ["Wall"] } },
      sameAbilityAs: 0,
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
  ],
});
