import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 11225.
//
// A dies trigger reads the creature as it last existed on the battlefield, so
// its toughness is the one it died with — and this creature's own death with
// toughness 4 or greater counts, as do others dying beside it (the rulings).
const TEXT = "Whenever a creature you control with toughness 4 or greater dies, draw a card.";

export default defineCard({
  name: "Ulvenwald Observer",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", toughness: { op: "gte", n: 4 } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
