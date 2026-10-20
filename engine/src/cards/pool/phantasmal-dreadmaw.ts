import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2).
const TEXT = "When this creature becomes the target of a spell or ability, sacrifice it.";

export default defineCard({
  name: "Phantasmal Dreadmaw",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Illusion"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
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
