import { defineCard } from "../define.js";

// EDHREC rank 24121.
const DIES = "When this creature dies, destroy target creature an opponent controls and you gain 4 life.";

export default defineCard({
  name: "Vengeant Vampire",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${DIES}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "gain-life", amount: 4 },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
