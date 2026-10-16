import { defineCard } from "../define.js";

// EDHREC rank 14096.
//
// Spree (rule 702.172a). "Becomes a white Rabbit with base power and
// toughness 0/1": its colours and creature types are replaced (layers 4 and
// 5), its base P/T set (7b), its abilities kept — counters and other P/T
// changes still apply on top (the rulings).
export default defineCard({
  name: "Metamorphic Blast",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Spree (Choose one or more additional costs.)\n" +
    "+ {1} — Until end of turn, target creature becomes a white Rabbit with base power and toughness 0/1.\n" +
    "+ {3} — Target player draws two cards.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "+ {1} — Until end of turn, target creature becomes a white Rabbit with base power and toughness 0/1.",
        spreeCost: "{1}",
        targets: ["creature"],
        effect: {
          kind: "animate",
          target: 0,
          power: 0,
          toughness: 1,
          addTypes: ["creature"],
          addSubtypes: [],
          setSubtypes: ["Rabbit"],
          setColors: ["W"],
          duration: "end-of-turn",
        },
      },
      {
        text: "+ {3} — Target player draws two cards.",
        spreeCost: "{3}",
        targets: ["player"],
        effect: { kind: "draw", amount: 2, target: 0 },
      },
    ],
  },
});
