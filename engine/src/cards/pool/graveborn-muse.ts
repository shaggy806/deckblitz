import { defineCard } from "../define.js";

// EDHREC rank 7137.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, you draw X cards and lose X life, where X is the number of Zombies you control.";
const ZOMBIES = { countOf: { subtype: "Zombie", controlledBy: "you" } } as const;

export default defineCard({
  name: "Graveborn Muse",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Spirit"],
  power: 3,
  toughness: 3,
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: ZOMBIES },
          { kind: "lose-life", amount: ZOMBIES, who: "you" },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
