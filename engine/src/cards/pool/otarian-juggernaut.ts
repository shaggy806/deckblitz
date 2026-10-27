import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 29687.

const THRESHOLD =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +3/+0 and attacks each combat if able.";

export default defineCard({
  name: "Otarian Juggernaut",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Juggernaut"],
  power: 2,
  toughness: 3,
  text: `This creature can't be blocked by Walls.\n${THRESHOLD}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { subtype: "Wall" },
      text: "This creature can't be blocked by Walls.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [3, 0],
      restrictions: ["must-attack"],
      text: THRESHOLD,
    },
  ],
});
