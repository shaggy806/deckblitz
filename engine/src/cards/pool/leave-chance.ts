import { defineCard } from "../define.js";

// EDHREC rank 17272. Hour of Devastation. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours and
// types. Never cast itself; a spell is one half or the other
// (leave.ts, and chance.ts with aftermath, rule 702.127a).
const FACES = ["Leave // Chance", "Leave", "Chance"];

export default defineCard({
  name: "Leave // Chance",
  manaCost: "{1}{W}{3}{R}",
  colors: ["W", "R"],
  types: ["instant", "sorcery"],
  text: "Return any number of target permanents you own to your hand.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nDiscard any number of cards, then draw that many cards.",
  faces: FACES,
  split: true,
});
