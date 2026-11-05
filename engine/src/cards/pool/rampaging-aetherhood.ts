import { defineCard } from "../define.js";

// EDHREC rank 8473.
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you get an amount of {E} (energy counters) equal to this creature's power. Then you may pay one or more {E}. If you do, put that many +1/+1 counters on this creature.";

export default defineCard({
  name: "Rampaging Aetherhood",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Hydra"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample, ward {2}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "get-energy", amount: { powerOf: "source" } },
          {
            kind: "may",
            prompt: "Pay one or more {E} to put that many +1/+1 counters on this creature?",
            costEnergyX: "one-or-more",
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
