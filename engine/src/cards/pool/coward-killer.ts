import { defineCard } from "../define.js";

const FACES = ["Coward // Killer", "Coward", "Killer"];
const COWARD_TEXT =
  "Target creature can't block this turn and becomes a Coward in addition to its other types until end of turn.\nTime travel.";
const KILLER_TEXT =
  "Killer deals 3 damage to target creature and each other creature that shares a creature type with it.";

export default defineCard({
  name: "Coward // Killer",
  manaCost: "{1}{R}{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${COWARD_TEXT}\n//\n${KILLER_TEXT}`,
  faces: FACES,
  split: true,
});
