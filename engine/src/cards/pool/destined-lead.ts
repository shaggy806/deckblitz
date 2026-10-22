import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 19426. The whole card: every zone but the stack (rule
// 709.4) — both names, the combined mana cost, both colours and types. Never
// cast itself; a spell is one half or the other (destined.ts, and lead.ts with
// aftermath, rule 702.127a).
const FACES = ["Destined // Lead", "Destined", "Lead"];

export default defineCard({
  name: "Destined // Lead",
  manaCost: "{1}{B}{3}{G}",
  colors: ["B", "G"],
  types: ["instant", "sorcery"],
  text: "Target creature gets +1/+0 and gains indestructible until end of turn.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nAll creatures able to block target creature this turn do so.",
  faces: FACES,
  split: true,
});
