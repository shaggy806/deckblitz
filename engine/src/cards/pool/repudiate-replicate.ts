import { defineCard } from "../define.js";

const FACES = ["Repudiate // Replicate", "Repudiate", "Replicate"];
const REPUDIATE_TEXT = "Counter target activated or triggered ability. (Mana abilities can't be targeted.)";
const REPLICATE_TEXT = "Create a token that's a copy of target creature you control.";

// EDHREC rank 9428.
//
// The whole card: every zone but the stack (rule 709.4). Never cast itself —
// a spell is one half or the other (repudiate.ts, replicate.ts).
export default defineCard({
  name: "Repudiate // Replicate",
  manaCost: "{G/U}{G/U}{1}{G}{U}",
  colors: ["U", "G"],
  types: ["instant", "sorcery"],
  text: `${REPUDIATE_TEXT}\n//\n${REPLICATE_TEXT}`,
  faces: FACES,
  split: true,
});
