import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 5697. The whole card: every zone but the stack
// (rule 709.4) — both names, the combined mana cost, both colours. Never cast
// itself; a spell is one half or the other (life.ts, death.ts), each its own
// colour (rule 709.3).
const FACES = ["Life // Death", "Life", "Death"];

export default defineCard({
  name: "Life // Death",
  manaCost: "{G}{1}{B}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "All lands you control become 1/1 creatures until end of turn. They're still lands.\n//\nReturn target creature card from your graveyard to the battlefield. You lose life equal to its mana value.",
  faces: FACES,
  split: true,
});
