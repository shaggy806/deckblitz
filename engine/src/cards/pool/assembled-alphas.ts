import { defineCard } from "../define.js";

// Once per creature blocking or blocked by it (the ruling). "That creature's
// controller" is the trigger object's controller, as it last existed if it
// has left — so it's still dealt its 3 when the creature is gone or the
// damage to it was prevented (the ruling).

const TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, this creature deals 3 damage to that creature and 3 damage to that creature's controller.";

const EFFECT = {
  kind: "sequence",
  effects: [
    { kind: "damage", amount: 3, target: "trigger-object" },
    { kind: "damage", amount: 3, who: "trigger-controller" },
  ],
} as const;

export default defineCard({
  name: "Assembled Alphas",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
