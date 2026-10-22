import { defineCard } from "../define.js";

// EDHREC rank 24041. Amonkhet. The whole card: every zone but the stack (rule
// 709.4) — both names, the combined mana cost, both colours and types. Never
// cast itself; a spell is one half or the other (start.ts, and finish.ts with
// aftermath, rule 702.127a).
const FACES = ["Start // Finish", "Start", "Finish"];

export default defineCard({
  name: "Start // Finish",
  manaCost: "{2}{W}{2}{B}",
  colors: ["W", "B"],
  types: ["instant", "sorcery"],
  text: "Create two 1/1 white Warrior creature tokens with vigilance.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nAs an additional cost to cast this spell, sacrifice a creature.\nDestroy target creature.",
  faces: FACES,
  split: true,
});
