import { defineCard } from "../define.js";

// EDHREC rank 19512.
//
// Rulings:
//   [2023-11-10] Relic's Roar overwrites all previous effects that set the creature's base power
//     and toughness to specific values. Any power- or toughness-setting effects that start to
//     apply afterward will overwrite this effect.
//   [2023-11-10] The artifact or creature retains its abilities and colors, if any.

export default defineCard({
  name: "Relic's Roar",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target artifact or creature becomes a Dinosaur artifact creature with base power and toughness 4/3 in addition to its other types.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "animate",
    target: 0,
    power: 4,
    toughness: 3,
    addTypes: ["artifact", "creature"],
    addSubtypes: ["Dinosaur"],
    keywords: [],
    duration: "end-of-turn",
  },
});
