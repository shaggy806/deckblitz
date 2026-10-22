import { defineCard } from "../define.js";

// EDHREC rank 8651. Amonkhet. The whole card: every zone but the stack (rule
// 709.4) — both names, the combined mana cost, both colours and types. Never
// cast itself; a spell is one half or the other (cut.ts, and ribbons.ts with
// aftermath, rule 702.127a).
const FACES = ["Cut // Ribbons", "Cut", "Ribbons"];

export default defineCard({
  name: "Cut // Ribbons",
  manaCost: "{1}{R}{X}{B}{B}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Cut deals 4 damage to target creature.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nEach opponent loses X life.",
  faces: FACES,
  split: true,
});
