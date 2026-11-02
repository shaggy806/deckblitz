import { defineCard } from "../define.js";

const SAC_TEXT = "At the beginning of the end step, sacrifice this creature.";
const RETURN_TEXT = "At the beginning of your upkeep, if this card is in your graveyard, you may exile a black creature card other than this card from your graveyard. If you do, return this card to the battlefield.";

export default defineCard({
  name: "Ichorid",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${SAC_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile a black creature card other than Ichorid from your graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 1,
              max: 1,
              filter: { type: "creature", colors: ["B"], isSource: false },
              destination: "exile",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: { kind: "put-onto-battlefield", target: "source" },
            },
          ],
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
