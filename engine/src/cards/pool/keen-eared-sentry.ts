import { defineCard } from "../define.js";

const HEXPROOF_TEXT = "You have hexproof. (You can't be the target of spells or abilities your opponents control.)";
const VENTURE_TEXT = "Each opponent can't venture into the dungeon more than once each turn.";

// A second venture in a turn — into Undercity too (rule 701.49d), as taking
// the initiative does — simply doesn't happen.
export default defineCard({
  name: "Keen-Eared Sentry",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: `${HEXPROOF_TEXT}\n${VENTURE_TEXT}`,
  static: [
    { affects: { scope: "self" }, playerKeywords: ["hexproof"], text: HEXPROOF_TEXT },
    { affects: { scope: "self" }, prohibits: [{ act: "venture", who: "opponents", perTurn: 1 }], text: VENTURE_TEXT },
  ],
});
