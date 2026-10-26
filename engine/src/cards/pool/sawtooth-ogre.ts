import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to that creature at end of combat.";
// Dealt even if this creature has left the battlefield by then (the ruling).
const DAMAGE = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  effect: { kind: "damage", amount: 1, target: "trigger-object" },
  text: "Sawtooth Ogre deals 1 damage to that creature.",
} as const;

export default defineCard({
  name: "Sawtooth Ogre",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: DAMAGE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: DAMAGE,
      resolve: null,
      text: TEXT,
    },
  ],
});
