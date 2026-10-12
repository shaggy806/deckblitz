import { defineCard } from "../define.js";

// EDHREC rank 14637.
//
// Multiply by Zero's `animate` on itself: a layer-7b base P/T, so counters and
// pumps still apply on top.

const BEND_TEXT = "Waterbend {3}: This creature has base power and toughness 5/2 until end of turn.";

export default defineCard({
  name: "Flexible Waterbender",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 2,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${BEND_TEXT} (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: false, waterbend: true },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 5,
        toughness: 2,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: BEND_TEXT,
    },
  ],
});
