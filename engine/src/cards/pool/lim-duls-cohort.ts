import { defineCard } from "../define.js";

// EDHREC rank 31783. One ability with two trigger events (Flailing Drake's
// shape): the creature it blocks, or each creature blocking it.

const TEXT = "Whenever this creature blocks or becomes blocked by a creature, that creature can't be regenerated this turn.";

export default defineCard({
  name: "Lim-Dûl's Cohort",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "prohibit", target: "trigger-object", regeneration: true },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "prohibit", target: "trigger-object", regeneration: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
