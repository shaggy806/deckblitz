import { defineCard } from "../define.js";

// EDHREC rank 20613.
//
// The mode is chosen as it's activated (its ruling; rule 700.2b). "Becomes a
// Rhino" replaces its creature types and keeps its other card types and its
// abilities (the rulings) — `setSubtypes`, not `setTypes`.

const TEXT =
  "{G}: Choose one. Activate only once each turn.\n• Until end of turn, this creature becomes a Rhino with base power and toughness 4/4 and gains trample.\n• Until end of turn, this creature becomes a Bird with base power and toughness 2/2 and gains flying.\n• Until end of turn, this creature becomes a Plant with base power and toughness 0/8.";

export default defineCard({
  name: "Skinshifter",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      oncePerTurn: true,
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Until end of turn, this creature becomes a Rhino with base power and toughness 4/4 and gains trample.",
            effect: {
              kind: "animate",
              target: "source",
              power: 4,
              toughness: 4,
              addTypes: [],
              addSubtypes: [],
              setSubtypes: ["Rhino"],
              keywords: ["trample"],
              duration: "end-of-turn",
            },
          },
          {
            text: "Until end of turn, this creature becomes a Bird with base power and toughness 2/2 and gains flying.",
            effect: {
              kind: "animate",
              target: "source",
              power: 2,
              toughness: 2,
              addTypes: [],
              addSubtypes: [],
              setSubtypes: ["Bird"],
              keywords: ["flying"],
              duration: "end-of-turn",
            },
          },
          {
            text: "Until end of turn, this creature becomes a Plant with base power and toughness 0/8.",
            effect: {
              kind: "animate",
              target: "source",
              power: 0,
              toughness: 8,
              addTypes: [],
              addSubtypes: [],
              setSubtypes: ["Plant"],
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
