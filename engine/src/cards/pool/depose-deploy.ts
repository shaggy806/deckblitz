import { defineCard } from "../define.js";

const FACES = ["Depose // Deploy", "Depose", "Deploy"];
const DEPOSE_TEXT = "Tap target creature.\nDraw a card.";
const DEPLOY_TEXT =
  "Create two 1/1 colorless Thopter artifact creature tokens with flying, then you gain 1 life for each creature you control.";

// The whole card: every zone but the stack (rule 709.4) — both names, the
// combined mana cost (mana value 6), two instants. Never cast itself; a spell
// is one half or the other (depose.ts, deploy.ts).
export default defineCard({
  name: "Depose // Deploy",
  manaCost: "{1}{W/U}{2}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: `${DEPOSE_TEXT}\n//\n${DEPLOY_TEXT}`,
  faces: FACES,
  split: true,
});
