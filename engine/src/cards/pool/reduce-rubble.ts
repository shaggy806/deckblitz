import { defineCard } from "../define.js";

const FACES = ["Reduce // Rubble", "Reduce", "Rubble"];

export default defineCard({
  name: "Reduce // Rubble",
  manaCost: "{2}{U}{2}{R}",
  colors: ["U", "R"],
  types: ["instant", "sorcery"],
  text: "Counter target spell unless its controller pays {3}.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nUp to three target lands don't untap during their controller's next untap step.",
  faces: FACES,
  split: true,
});
