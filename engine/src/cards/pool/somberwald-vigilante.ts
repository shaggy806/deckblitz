import { defineCard } from "../define.js";

const TEXT = "Whenever this creature becomes blocked by a creature, this creature deals 1 damage to that creature.";

export default defineCard({
  name: "Somberwald Vigilante",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
