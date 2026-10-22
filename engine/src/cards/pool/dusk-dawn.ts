import { defineCard } from "../define.js";

const FACES = ["Dusk // Dawn", "Dusk", "Dawn"];

export default defineCard({
  name: "Dusk // Dawn",
  manaCost: "{2}{W}{W}{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all creatures with power 3 or greater.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nReturn all creature cards with power 2 or less from your graveyard to your hand.",
  faces: FACES,
  split: true,
});
