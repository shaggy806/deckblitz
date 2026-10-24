import { defineCard } from "../define.js";

const FORMIDABLE_TEXT =
  "Formidable — {3}{R}{R}: Creatures you control gain menace until end of turn. Activate only if creatures you control have total power 8 or greater. (They can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Atarka Pummeler",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 4,
  toughness: 5,
  text: FORMIDABLE_TEXT,
  activated: [
    {
      cost: { mana: "{3}{R}{R}", tap: false },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "menace",
        duration: "end-of-turn",
      },
      resolve: null,
      text: FORMIDABLE_TEXT,
    },
  ],
});
