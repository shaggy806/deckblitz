import { defineCard } from "../define.js";

const FACES = ["Flower // Flourish", "Flower", "Flourish"];
const FLOWER_TEXT = "Search your library for a basic Forest or Plains card, reveal it, put it into your hand, then shuffle.";
const FLOURISH_TEXT = "Creatures you control get +2/+2 until end of turn.";

// EDHREC rank 20442. Guilds of Ravnica. The whole card: every zone but the
// stack (rule 709.4). Never cast itself — a spell is one half or the other
// (flower.ts, flourish.ts).
export default defineCard({
  name: "Flower // Flourish",
  manaCost: "{G/W}{4}{G}{W}",
  colors: ["G", "W"],
  types: ["sorcery"],
  text: `${FLOWER_TEXT}\n//\n${FLOURISH_TEXT}`,
  faces: FACES,
  split: true,
});
