import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 26553.
//
// Rulings:
//   [2004-10-04] The ability destroys the creature at the end of the combat, which is after all
//     first strike and normal damage dealing is done. This means that a creature may have to
//     regenerate twice to survive the combat, once from damage and once again at end of combat.
//
// One ability with two trigger events (`sameAbilityAs`), Infernal Medusa's
// shape: "blocks a non-Wall creature" asks the creature it blocks (the
// trigger object, `object: "blocked"`) as the block is declared — part of the
// trigger condition (`whileCondition`, Snarespinner's) — and "becomes blocked
// by a non-Wall creature" fires once per such blocker. Each destroys that
// creature at end of combat, only if it's still that creature (rule 400.7).
const TEXT = "Whenever this creature blocks or becomes blocked by a non-Wall creature, destroy that creature at end of combat.";
const DESTROY = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  effect: { kind: "destroy", target: "trigger-object" },
  text: "Destroy that creature.",
} as const;

export default defineCard({
  name: "Cockatrice",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cockatrice"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
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
      sameAbilityAs: 0,
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
  ],
});
