import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 24244. Firedrinker Satyr's trigger.

const TEXT = "Whenever this creature is dealt damage, it deals that much damage to you.";

export default defineCard({
  name: "Jackal Pup",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Jackal"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "you" },
      resolve: null,
      text: TEXT,
    },
  ],
});
