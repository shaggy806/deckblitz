import { defineCard } from "../define.js";

// EDHREC rank 15173. Putrid Imp's threshold static with Cephalid Inkmage's
// unblockability: read as blockers are declared, so reaching threshold after
// it's been blocked doesn't unblock it (the ruling).
const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+0 and can't be blocked.";

export default defineCard({
  name: "Nightwhorl Hermit",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Rat", "Rogue"],
  power: 1,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 0],
      grantKeywords: ["unblockable"],
      text: THRESHOLD_TEXT,
    },
  ],
});
