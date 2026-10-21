import { defineCard } from "../define.js";

const FACES = ["Consecrate // Consume", "Consecrate", "Consume"];
const CONSECRATE_TEXT = "Exile target card from a graveyard.\nDraw a card.";
const CONSUME_TEXT =
  "Target player sacrifices a creature with the greatest power among creatures they control. You gain life equal to its power.";

// EDHREC rank 18776.
//
// The whole card: every zone but the stack (rule 709.4). Never cast itself —
// a spell is one half or the other (consecrate.ts, consume.ts).
export default defineCard({
  name: "Consecrate // Consume",
  manaCost: "{1}{W/B}{2}{W}{B}",
  colors: ["W", "B"],
  types: ["instant", "sorcery"],
  text: `${CONSECRATE_TEXT}\n//\n${CONSUME_TEXT}`,
  faces: FACES,
  split: true,
});
