import { defineCard } from "../define.js";

// EDHREC rank 16057. Amonkhet. The whole card: every zone but the stack (rule
// 709.4) — both names, the combined mana cost, both colours and types. Never
// cast itself; a spell is one half or the other (spring.ts, and mind.ts with
// aftermath, rule 702.127a).
const FACES = ["Spring // Mind", "Spring", "Mind"];

export default defineCard({
  name: "Spring // Mind",
  manaCost: "{2}{G}{4}{U}{U}",
  colors: ["U", "G"],
  types: ["sorcery", "instant"],
  text: "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nDraw two cards.",
  faces: FACES,
  split: true,
});
