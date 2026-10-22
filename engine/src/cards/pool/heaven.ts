import { defineCard } from "../define.js";

// The half of Heaven // Earth cast from the hand.
const FACES = ["Heaven // Earth", "Heaven", "Earth"];

export default defineCard({
  name: "Heaven",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Heaven deals X damage to each creature with flying.",
  effect: { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: "x" },
  faces: FACES,
  split: true,
});
