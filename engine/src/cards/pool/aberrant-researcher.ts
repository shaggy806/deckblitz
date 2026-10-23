import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, mill a card. If an instant or sorcery card was milled this way, transform this creature.";

// Lorehold Excavation's "if a [type] card was milled this way".
export default defineCard({
  name: "Aberrant Researcher",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Insect"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (To mill a card, put the top card of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: { typesAnyOf: ["instant", "sorcery"] } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Aberrant Researcher", "Perfected Form"],
  transform: true,
});
