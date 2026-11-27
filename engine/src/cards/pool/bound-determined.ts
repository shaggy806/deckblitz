import { defineCard } from "../define.js";

const FACES = ["Bound // Determined", "Bound", "Determined"];
const LEFT_TEXT =
  "Sacrifice a creature. Return up to X cards from your graveyard to your hand, where X is the number of colors that creature was. Exile this card.";
const RIGHT_TEXT = "Other spells you control can't be countered this turn.\nDraw a card.";

// The whole card: every zone but the stack (rule 709.4); each half is cast on
// its own (bound.ts, determined.ts).
export default defineCard({
  name: "Bound // Determined",
  manaCost: "{3}{B}{G}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["instant"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
});
