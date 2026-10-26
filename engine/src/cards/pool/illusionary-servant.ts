import { defineCard } from "../define.js";

const TEXT = "When this creature becomes the target of a spell or ability, sacrifice it.";

export default defineCard({
  name: "Illusionary Servant",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
