import { defineCard } from "../define.js";

// EDHREC rank 17521.

const CORRUPTED =
  "Corrupted — As long as an opponent has three or more poison counters, this creature has deathtouch and lifelink.";

export default defineCard({
  name: "Bonepicker Skirge",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Imp"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${CORRUPTED}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
      grantKeywords: ["deathtouch", "lifelink"],
      text: CORRUPTED,
    },
  ],
});
