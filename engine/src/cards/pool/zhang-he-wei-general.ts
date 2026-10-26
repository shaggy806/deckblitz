import { defineCard } from "../define.js";

// Portal Three Kingdoms. EDHREC rank 26992.
//
// Rulings:
//   [2009-10-01] Despite the similarities between horsemanship and flying, horsemanship doesn't
//     interact with flying or reach.

export default defineCard({
  name: "Zhang He, Wei General",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 2,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nWhenever Zhang He attacks, each other creature you control gets +1/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Whenever Zhang He attacks, each other creature you control gets +1/+0 until end of turn.",
    },
  ],
});
