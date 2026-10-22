import { defineCard } from "../define.js";

// EDHREC rank 17169. Hour of Devastation. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours and
// types. Never cast itself; a spell is one half or the other
// (refuse.ts, and cooperate.ts with aftermath, rule 702.127a).
const FACES = ["Refuse // Cooperate", "Refuse", "Cooperate"];

export default defineCard({
  name: "Refuse // Cooperate",
  manaCost: "{3}{R}{2}{U}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Refuse deals damage to target spell's controller equal to that spell's mana value.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nCopy target instant or sorcery spell. You may choose new targets for the copy.",
  faces: FACES,
  split: true,
});
