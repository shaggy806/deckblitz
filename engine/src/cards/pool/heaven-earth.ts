import { defineCard } from "../define.js";

// EDHREC rank 14968. Amonkhet. The whole card: every zone but the stack (rule
// 709.4) — both names, the combined mana cost, both colours and types. Never
// cast itself; a spell is one half or the other (heaven.ts, and earth.ts with
// aftermath, rule 702.127a). Each half has its own X (the ruling).
const FACES = ["Heaven // Earth", "Heaven", "Earth"];

export default defineCard({
  name: "Heaven // Earth",
  manaCost: "{X}{G}{X}{R}{R}",
  colors: ["G", "R"],
  types: ["instant", "sorcery"],
  text: "Heaven deals X damage to each creature with flying.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nEarth deals X damage to each creature without flying.",
  faces: FACES,
  split: true,
});
