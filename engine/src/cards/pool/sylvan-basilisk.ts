import { defineCard } from "../define.js";

// EDHREC rank 25200.

const TEXT = "Whenever this creature becomes blocked by a creature, destroy that creature.";

export default defineCard({
  name: "Sylvan Basilisk",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Basilisk"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
