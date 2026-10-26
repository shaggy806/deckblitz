import { defineCard } from "../define.js";

const TEXT = "When this creature becomes the target of a spell or ability, sacrifice it.";

export default defineCard({
  name: "Phantasmal Dragon",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon", "Illusion"],
  power: 5,
  toughness: 5,
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
