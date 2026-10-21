import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature you control with power 4 or greater enters, this creature gets +1/+1 and gains vigilance until end of turn.";

// Kronch Wrangler's trigger: the entering creature's power as it enters
// (statics counted), and this creature itself counts if it enters that big
// (the rulings).
export default defineCard({
  name: "Territorial Boar",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
