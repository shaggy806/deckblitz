import { defineCard } from "../define.js";

// EDHREC rank 19062. Addendum on a permanent: the intervening if reads that it
// entered as a cast spell (not put onto the battlefield — the ruling) while
// it's your main phase, which is where a spell cast in your main phase
// resolves and so enters.

const STATIC_TEXT = "Enchanted creature gets +1/+2 and has vigilance.";
const ADDENDUM_TEXT =
  "Addendum — When this Aura enters, if you cast it during your main phase, enchanted creature gains lifelink until end of turn.";

export default defineCard({
  name: "Sentinel's Mark",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${STATIC_TEXT}\n${ADDENDUM_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "source", filter: { cast: true } },
          { kind: "your-turn" },
          { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
        ],
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "attached", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: ADDENDUM_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 2],
      grantKeywords: ["vigilance"],
      text: STATIC_TEXT,
    },
  ],
});
