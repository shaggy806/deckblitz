import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 31638.

export default defineCard({
  name: "Ogre Leadfoot",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature becomes blocked by an artifact creature, destroy that creature.",
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { types: ["artifact", "creature"] } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: "Whenever this creature becomes blocked by an artifact creature, destroy that creature.",
    },
  ],
});
