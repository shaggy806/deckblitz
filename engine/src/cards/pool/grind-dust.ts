import { defineCard } from "../define.js";

// EDHREC rank 26659. Hour of Devastation. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours and
// types. Never cast itself; a spell is one half or the other
// (grind.ts, and dust.ts with aftermath, rule 702.127a).
const FACES = ["Grind // Dust", "Grind", "Dust"];

export default defineCard({
  name: "Grind // Dust",
  manaCost: "{1}{B}{3}{W}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Put a -1/-1 counter on each of up to two target creatures.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nExile any number of target creatures that have -1/-1 counters on them.",
  faces: FACES,
  split: true,
});
