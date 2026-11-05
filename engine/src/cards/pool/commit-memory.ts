import { defineCard } from "../define.js";

// The whole card: every zone but the stack (rule 709.4), both names, the combined
// mana cost and both types. A spell is one half or the other (commit.ts, and
// memory.ts with aftermath, rule 702.127a).
const FACES = ["Commit // Memory", "Commit", "Memory"];

export default defineCard({
  name: "Commit // Memory",
  manaCost: "{3}{U}{4}{U}{U}",
  colors: ["U"],
  types: ["instant", "sorcery"],
  text: "Put target spell or nonland permanent into its owner's library second from the top.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nEach player shuffles their hand and graveyard into their library, then draws seven cards.",
  faces: FACES,
  split: true,
});
