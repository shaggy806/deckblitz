import { defineCard } from "../define.js";

// EDHREC rank 27535.
//
// Rulings:
//   [2023-04-14] Although the token enters the battlefield attacking, it was never declared as an
//     attacking creature (for the purposes of abilities that trigger whenever a creature attacks,
//     such as its own ability, for example).
//   [2023-04-14] The token will enter the battlefield and then have counters put on it. In most
//     cases, the game will see a 3/3 creature entering the battlefield for the purposes of any
//     abilities that may trigger.
//   [2023-04-14] The token doesn’t copy whether Furnace-Blessed Conqueror is tapped or untapped
//     (although the effect itself causes it to enter tapped), whether it has any counters on it or
//     Auras and Equipment attached to it, or any non-copy effects that have changed its power,
//     toughness, types, color, and so on.

export default defineCard({
  name: "Sun-Blessed Guardian",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "{5}{R/P}: Transform this creature. Activate only as a sorcery. ({R/P} can be paid with either {R} or 2 life.)",
  activated: [
    {
      cost: { mana: "{5}{R/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{5}{R/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Sun-Blessed Guardian", "Furnace-Blessed Conqueror"],
  transform: true,
});
