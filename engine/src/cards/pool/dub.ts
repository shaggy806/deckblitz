import { defineCard } from "../define.js";

// EDHREC rank 18959.

const GRANT_TEXT =
  "Enchanted creature gets +2/+2, has first strike, and is a Knight in addition to its other types. (It deals combat damage before creatures without first strike.)";

export default defineCard({
  name: "Dub",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["first-strike"],
      addSubtypes: ["Knight"],
      text: GRANT_TEXT,
    },
  ],
});
