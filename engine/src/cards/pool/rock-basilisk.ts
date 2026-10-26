import { defineCard } from "../define.js";

// EDHREC rank 31577. The same ability as Cockatrice and Thicket Basilisk.

const TEXT =
  "Whenever this creature blocks or becomes blocked by a non-Wall creature, destroy that creature at end of combat.";
const DESTROY = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  effect: { kind: "destroy", target: "trigger-object" },
  text: "Destroy that creature.",
} as const;

export default defineCard({
  name: "Rock Basilisk",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Basilisk"],
  power: 4,
  toughness: 5,
  text: TEXT,
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
