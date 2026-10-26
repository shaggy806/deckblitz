import { defineCard } from "../define.js";

export default defineCard({
  name: "Tar Pit Warrior",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cyclops", "Warrior"],
  power: 3,
  toughness: 4,
  text: "When this creature becomes the target of a spell or ability, sacrifice it.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When this creature becomes the target of a spell or ability, sacrifice it.",
    },
  ],
});
