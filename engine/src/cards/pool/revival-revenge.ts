import { defineCard } from "../define.js";

// Ravnica Allegiance (RNA). EDHREC rank 6260. The whole card: every zone but
// the stack (rule 709.4) — both names, the combined mana cost, both colours.
// Never cast itself; a spell is one half or the other (revival.ts,
// revenge.ts).
const FACES = ["Revival // Revenge", "Revival", "Revenge"];

export default defineCard({
  name: "Revival // Revenge",
  manaCost: "{W/B}{W/B}{4}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Return target creature card with mana value 3 or less from your graveyard to the battlefield.\n//\nDouble your life total. Target opponent loses half their life, rounded up.",
  faces: FACES,
  split: true,
});
