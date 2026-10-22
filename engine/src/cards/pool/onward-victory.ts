import { defineCard } from "../define.js";

// EDHREC rank 21398. Amonkhet. The whole card: every zone but the stack (rule
// 709.4) — both names, the combined mana cost, both colours and types. Never
// cast itself; a spell is one half or the other (onward.ts, and victory.ts
// with aftermath, rule 702.127a).
const FACES = ["Onward // Victory", "Onward", "Victory"];

export default defineCard({
  name: "Onward // Victory",
  manaCost: "{2}{R}{2}{W}",
  colors: ["W", "R"],
  types: ["instant", "sorcery"],
  text: "Target creature gets +X/+0 until end of turn, where X is its power.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nTarget creature gains double strike until end of turn.",
  faces: FACES,
  split: true,
});
