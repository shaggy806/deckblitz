import { defineCard } from "../define.js";

// EDHREC rank 24367.

const BASE_TEXT = "During your turn, this creature has base power and toughness 5/2.";
const UNBLOCKABLE_TEXT = "{5}{U}{U}: This creature can't be blocked this turn.";

export default defineCard({
  name: "Snowmelt Stag",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Elk"],
  power: 2,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${BASE_TEXT}\n${UNBLOCKABLE_TEXT}`,
  static: [
    {
      // Layer 7b, so counters and pumps still apply on top.
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      setBasePt: { power: 5, toughness: 2 },
      text: BASE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
  ],
});
