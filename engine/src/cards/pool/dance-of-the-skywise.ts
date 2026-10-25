import { defineCard } from "../define.js";

// EDHREC rank 28473.
//
// Rulings:
//   [2015-02-25] The target creature will lose all other colors and creature types and be blue,
//     a Dragon, and an Illusion. It will retain any other types it may have had, such as
//     artifact.
//   [2015-02-25] The target creature will lose any abilities it may have gained prior to Dance
//     of the Skywise resolving. After it resolves, the creature can gain abilities as normal.
// The 4/4 is a base P/T (layer 7b): counters and pumps still apply on top.

export default defineCard({
  name: "Dance of the Skywise",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target creature you control becomes a blue Dragon Illusion with base power and toughness 4/4, loses all abilities, and gains flying.",
  targets: ["creature-you-control"],
  effect: {
    kind: "animate",
    target: 0,
    power: 4,
    toughness: 4,
    addTypes: [],
    addSubtypes: [],
    setSubtypes: ["Dragon", "Illusion"],
    setColors: ["U"],
    loseAbilities: true,
    keywords: ["flying"],
    duration: "end-of-turn",
  },
});
