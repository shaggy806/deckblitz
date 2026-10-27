import { defineCard } from "../define.js";

// EDHREC rank 5681. Guilds of Ravnica. The whole card: every zone but the
// stack (rule 709.4) — both names, the combined mana cost, both colours. Never
// cast itself; a spell is one half or the other (find.ts, finality.ts).
const FACES = ["Find // Finality", "Find", "Finality"];

export default defineCard({
  name: "Find // Finality",
  manaCost: "{B/G}{B/G}{4}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Return up to two target creature cards from your graveyard to your hand.\n//\nYou may put two +1/+1 counters on a creature you control. Then all creatures get -4/-4 until end of turn.",
  faces: FACES,
  split: true,
});
