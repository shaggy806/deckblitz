import { defineCard } from "../define.js";

// EDHREC rank 22818. Hour of Devastation. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours and
// types. Never cast itself; a spell is one half or the other
// (appeal.ts, and authority.ts with aftermath, rule 702.127a).
const FACES = ["Appeal // Authority", "Appeal", "Authority"];

export default defineCard({
  name: "Appeal // Authority",
  manaCost: "{G}{1}{W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: "Until end of turn, target creature gains trample and gets +X/+X, where X is the number of creatures you control.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nTap up to two target creatures your opponents control. Creatures you control gain vigilance until end of turn.",
  faces: FACES,
  split: true,
});
