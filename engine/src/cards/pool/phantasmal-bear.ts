import { defineCard } from "../define.js";

// EDHREC rank 22644.

const TEXT = "When this creature becomes the target of a spell or ability, sacrifice it.";

export default defineCard({
  name: "Phantasmal Bear",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bear", "Illusion"],
  power: 2,
  toughness: 2,
  text: TEXT,
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
