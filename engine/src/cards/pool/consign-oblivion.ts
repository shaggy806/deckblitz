import { defineCard } from "../define.js";

// EDHREC rank 10686. Hour of Devastation. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours and
// types. Never cast itself; a spell is one half or the other
// (consign.ts, and oblivion.ts with aftermath, rule 702.127a).
const FACES = ["Consign // Oblivion", "Consign", "Oblivion"];

export default defineCard({
  name: "Consign // Oblivion",
  manaCost: "{1}{U}{4}{B}",
  colors: ["U", "B"],
  types: ["instant", "sorcery"],
  text: "Return target nonland permanent to its owner's hand.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nTarget opponent discards two cards.",
  faces: FACES,
  split: true,
});
