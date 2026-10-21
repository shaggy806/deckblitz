import { defineCard } from "../define.js";

// Legends. EDHREC rank 26292.
//
// Rulings:
//   [2004-10-04] The color of the blocking/blocked creature is checked only at declaration of the
//     block. If the creature is green or white at that time, it will be destroyed at end of combat
//     even if it changes color before combat ends.
//
// Cockatrice's shape: one ability with two trigger events (`sameAbilityAs`),
// the colour asked as the block is declared (part of the trigger condition),
// so a later colour change doesn't matter (the ruling). Each destroys that
// creature at end of combat, only if it's still that creature (rule 400.7).
const TEXT = "Whenever this creature blocks or becomes blocked by a green or white creature, destroy that creature at end of combat.";
const GREEN_OR_WHITE = { anyOf: [{ colors: ["G"] }, { colors: ["W"] }] } as const;
const DESTROY = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  effect: { kind: "destroy", target: "trigger-object" },
  text: "Destroy that creature.",
} as const;

export default defineCard({
  name: "Abomination",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: GREEN_OR_WHITE },
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self", blocker: GREEN_OR_WHITE },
      sameAbilityAs: 0,
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
  ],
});
