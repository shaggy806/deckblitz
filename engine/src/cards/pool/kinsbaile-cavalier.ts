import { defineCard } from "../define.js";

// EDHREC rank 6770. A Kithkin Knight itself, so it has double strike too.
const TEXT = "Knight creatures you control have double strike.";

export default defineCard({
  name: "Kinsbaile Cavalier",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Knight"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Knight", controlledBy: "you" } },
      grantKeywords: ["double-strike"],
      text: TEXT,
    },
  ],
});
