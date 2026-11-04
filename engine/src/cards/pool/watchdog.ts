import { defineCard } from "../define.js";

const BLOCKS_TEXT = "This creature blocks each combat if able.";
const SHRINKS_TEXT = "As long as this creature is untapped, all creatures attacking you get -1/-0.";

export default defineCard({
  name: "Watchdog",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dog"],
  power: 1,
  toughness: 2,
  text: `${BLOCKS_TEXT}\n${SHRINKS_TEXT}`,
  static: [
    { affects: { scope: "self" }, restrictions: ["must-block"], text: BLOCKS_TEXT },
    {
      affects: { scope: "filter", filter: { type: "creature", attackingYou: true } },
      condition: { kind: "source", filter: { tapped: false } },
      grantPt: [-1, 0],
      text: SHRINKS_TEXT,
    },
  ],
});
