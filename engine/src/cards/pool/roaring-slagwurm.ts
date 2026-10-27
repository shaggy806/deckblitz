import { defineCard } from "../define.js";

// EDHREC rank 22711. Every artifact, whoever controls it.

export default defineCard({
  name: "Roaring Slagwurm",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 4,
  text: "Whenever this creature attacks, tap all artifacts.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "artifact" } },
      resolve: null,
      text: "Whenever this creature attacks, tap all artifacts.",
    },
  ],
});
