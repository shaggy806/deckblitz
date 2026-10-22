import { defineCard } from "../define.js";

// EDHREC rank 15642. Hour of Devastation. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours and
// types. Never cast itself; a spell is one half or the other
// (reason.ts, and believe.ts with aftermath, rule 702.127a).
const FACES = ["Reason // Believe", "Reason", "Believe"];

export default defineCard({
  name: "Reason // Believe",
  manaCost: "{U}{4}{G}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Scry 3.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nLook at the top card of your library. You may put it onto the battlefield if it's a creature card. If you don't, put it into your hand.",
  faces: FACES,
  split: true,
});
