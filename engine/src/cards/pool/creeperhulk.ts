import { defineCard } from "../define.js";

// EDHREC rank 20953.
//
// The set base P/T is layer 7b, so counters and pumps still apply on top of
// the 5/5 (the rulings).

const TEXT = "{1}{G}: Until end of turn, target creature you control has base power and toughness 5/5 and gains trample.";

export default defineCard({
  name: "Creeperhulk",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Elemental"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "animate",
        target: 0,
        power: 5,
        toughness: 5,
        addTypes: [],
        addSubtypes: [],
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
