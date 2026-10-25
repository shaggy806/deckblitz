import { defineCard } from "../define.js";

// Rulings:
//   [2016-01-22] You may target a land that's already a creature.
//   [2016-01-22] A "land creature" is a permanent that's both a land and a creature.

const TRAMPLE_TEXT = "Land creatures you control have trample.";
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, you may have target land you control become a 3/3 Elemental creature with haste until end of turn. It's still a land.";

export default defineCard({
  name: "Embodiment of Fury",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TRAMPLE_TEXT}\n${LANDFALL_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["land", "creature"], controlledBy: "you" } },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["land-you-control"],
      effect: {
        kind: "may",
        prompt: "Have the target land become a 3/3 Elemental creature with haste until end of turn?",
        effect: {
          kind: "animate",
          target: 0,
          power: 3,
          toughness: 3,
          addTypes: ["creature"],
          addSubtypes: ["Elemental"],
          keywords: ["haste"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
