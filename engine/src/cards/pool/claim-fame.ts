import { defineCard } from "../define.js";

// EDHREC rank 20705. Hour of Devastation. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours and
// types. Never cast itself; a spell is one half or the other
// (claim.ts, and fame.ts with aftermath, rule 702.127a).
const FACES = ["Claim // Fame", "Claim", "Fame"];

export default defineCard({
  name: "Claim // Fame",
  manaCost: "{B}{1}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Return target creature card with mana value 2 or less from your graveyard to the battlefield.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nTarget creature gets +2/+0 and gains haste until end of turn.",
  faces: FACES,
  split: true,
});
