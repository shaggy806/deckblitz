import { defineCard } from "../define.js";

// EDHREC rank 29418.
//
// Rulings:
//   [2023-04-14] Chrome Host Hulk’s ability overwrites all previous effects that set the affected
//     creatures’ power and/or toughness to specific values. Other effects that set these
//     characteristics to specific values that start to apply after the ability resolves will
//     overwrite that part of the effect.
//   [2023-04-14] Effects that modify the affected creature’s power or toughness without setting it
//     will apply no matter when they started to take effect. The same is true for counters that
//     change the creature’s power or toughness.

export default defineCard({
  name: "Gnottvold Hermit",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 4,
  toughness: 4,
  text: "{5}{U/P}: Transform this creature. Activate only as a sorcery. ({U/P} can be paid with either {U} or 2 life.)",
  activated: [
    {
      cost: { mana: "{5}{U/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{5}{U/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Gnottvold Hermit", "Chrome Host Hulk"],
  transform: true,
});
