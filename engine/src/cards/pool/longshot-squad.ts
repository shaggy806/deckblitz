import { defineCard } from "../define.js";

// EDHREC rank 11981. Outlast is Ainok Bond-Kin's shape; the reach grant is
// Abzan Falconer's, and covers any +1/+1 counter, not only outlast's (the
// ruling).

const OUTLAST_TEXT =
  "Outlast {1}{G} ({1}{G}, {T}: Put a +1/+1 counter on this creature. Outlast only as a sorcery.)";
const REACH_TEXT =
  "Each creature you control with a +1/+1 counter on it has reach. (A creature with reach can block creatures with flying.)";

export default defineCard({
  name: "Longshot Squad",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Archer"],
  power: 3,
  toughness: 3,
  text: `${OUTLAST_TEXT}\n${REACH_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: OUTLAST_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["reach"],
      text: REACH_TEXT,
    },
  ],
});
