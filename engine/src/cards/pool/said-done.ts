import { defineCard } from "../define.js";

const FACES = ["Said // Done", "Said", "Done"];
const SAID_TEXT = "Return target instant or sorcery card from your graveyard to your hand.";
const DONE_TEXT =
  "Tap up to two target creatures. Those creatures don't untap during their controller's next untap step.";

export default defineCard({
  name: "Said // Done",
  manaCost: "{2}{U}{3}{U}",
  colors: ["U"],
  types: ["sorcery", "instant"],
  text: `${SAID_TEXT}\n//\n${DONE_TEXT}`,
  faces: FACES,
  split: true,
});
