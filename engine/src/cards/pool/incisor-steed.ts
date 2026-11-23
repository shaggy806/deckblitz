import { defineCard } from "../define.js";

const STEED_TEXT =
  "Corrupted Metalcraft — As long as you control three or more artifacts and an opponent has three or more poison counters, Incisor Steed gets +3/+0.";

export default defineCard({
  name: "Incisor Steed",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Horse"],
  power: 1,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${STEED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [{ kind: "metalcraft" }, { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 }],
      },
      grantPt: [3, 0],
      text: STEED_TEXT,
    },
  ],
});
