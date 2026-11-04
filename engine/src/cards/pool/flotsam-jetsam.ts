import { defineCard } from "../define.js";

const FACES = ["Flotsam // Jetsam", "Flotsam", "Jetsam"];
const FLOTSAM_TEXT =
  "Mill three cards. Investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";
const JETSAM_TEXT =
  "Each opponent mills three cards, then you may cast a spell from each opponent's graveyard without paying its mana cost. If a spell cast this way would be put into a graveyard, exile it instead.";

// The whole card: every zone but the stack (rule 709.4). Never cast itself —
// a spell is one half or the other (flotsam.ts, jetsam.ts).
export default defineCard({
  name: "Flotsam // Jetsam",
  manaCost: "{1}{G/U}{4}{U/B}{U/B}",
  colors: ["B", "G", "U"],
  types: ["instant", "sorcery"],
  text: `${FLOTSAM_TEXT}\n//\n${JETSAM_TEXT}`,
  faces: FACES,
  split: true,
});
