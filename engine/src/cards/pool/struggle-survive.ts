import { defineCard } from "../define.js";

// EDHREC rank 15763. Hour of Devastation. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours and
// types. Never cast itself; a spell is one half or the other
// (struggle.ts, and survive.ts with aftermath, rule 702.127a).
const FACES = ["Struggle // Survive", "Struggle", "Survive"];

export default defineCard({
  name: "Struggle // Survive",
  manaCost: "{2}{R}{1}{G}",
  colors: ["R", "G"],
  types: ["instant", "sorcery"],
  text: "Struggle deals damage to target creature equal to the number of lands you control.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nEach player shuffles their graveyard into their library.",
  faces: FACES,
  split: true,
});
