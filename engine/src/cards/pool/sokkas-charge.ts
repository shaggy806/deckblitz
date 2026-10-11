import { defineCard } from "../define.js";

// EDHREC rank 6832.
//
// True Conviction's grant, on your turn only (Blacksmith's Talent's
// `your-turn` condition). "Allies you control" is every permanent with the
// subtype, not only creatures — a Kindred Ally counts too.
const TEXT = "During your turn, Allies you control have double strike and lifelink.";

export default defineCard({
  name: "Sokka's Charge",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Ally", controlledBy: "you" } },
      condition: { kind: "your-turn" },
      grantKeywords: ["double-strike", "lifelink"],
      text: TEXT,
    },
  ],
});
