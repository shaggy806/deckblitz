import { defineCard } from "../define.js";

// EDHREC rank 21962. Hour of Devastation. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours and
// types. Never cast itself; a spell is one half or the other
// (farm.ts, and market.ts with aftermath, rule 702.127a).
const FACES = ["Farm // Market", "Farm", "Market"];

export default defineCard({
  name: "Farm // Market",
  manaCost: "{2}{W}{2}{U}",
  colors: ["W", "U"],
  types: ["instant", "sorcery"],
  text: "Destroy target attacking or blocking creature.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nDraw two cards, then discard two cards.",
  faces: FACES,
  split: true,
});
