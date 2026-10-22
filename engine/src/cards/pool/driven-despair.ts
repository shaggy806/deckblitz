import { defineCard } from "../define.js";

// EDHREC rank 14655. Hour of Devastation. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours and
// types. Never cast itself; a spell is one half or the other
// (driven.ts, and despair.ts with aftermath, rule 702.127a).
const FACES = ["Driven // Despair", "Driven", "Despair"];

export default defineCard({
  name: "Driven // Despair",
  manaCost: "{1}{G}{1}{B}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Until end of turn, creatures you control gain trample and \"Whenever this creature deals combat damage to a player, draw a card.\"\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nUntil end of turn, creatures you control gain menace and \"Whenever this creature deals combat damage to a player, that player discards a card.\"",
  faces: FACES,
  split: true,
});
