import { defineCard } from "../define.js";

export default defineCard({
  name: "Thundercloud Elemental",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{3}{U}: Tap all creatures with toughness 2 or less.\n{3}{U}: All other creatures lose flying until end of turn.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "creature", toughness: { op: "lte", n: 2 } } },
      resolve: null,
      text: "{3}{U}: Tap all creatures with toughness 2 or less.",
    },
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature" },
        exceptSource: true,
        simultaneous: true,
        effect: { kind: "become", target: 0, loseKeywords: ["flying"], duration: "end-of-turn" },
      },
      resolve: null,
      text: "{3}{U}: All other creatures lose flying until end of turn.",
    },
  ],
});
