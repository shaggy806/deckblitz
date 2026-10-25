import { defineCard } from "../define.js";

const FORMIDABLE_TEXT =
  "Formidable — {G}: This creature can attack this turn as though it didn't have defender. Activate only if creatures you control have total power 8 or greater.";

export default defineCard({
  name: "Glade Watcher",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${FORMIDABLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: { kind: "attack-despite-defender", target: "source" },
      resolve: null,
      text: FORMIDABLE_TEXT,
    },
  ],
});
