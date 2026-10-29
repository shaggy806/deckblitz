import { defineCard } from "../define.js";

// EDHREC rank 20990.
//
// Clackbridge Troll's shape: each opponent in turn order may choose a creature
// to sacrifice, knowing the choices before, and all are sacrificed at once
// (the ruling); it transforms only if none was sacrificed this way.
const TEXT =
  "At the beginning of your upkeep, any opponent may sacrifice a creature of their choice. If no one does, transform this creature.";

export default defineCard({
  name: "Innocent Traveler",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "each-player-may",
            who: "each-opponent",
            options: [{ sacrifice: { type: "creature", controlledBy: "you" }, text: "Sacrifice a creature" }],
          },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "this-way", what: "sacrificed", atLeast: 1 } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Innocent Traveler", "Malicious Invader"],
  transform: true,
});
