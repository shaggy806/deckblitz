import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 28773.
const FACES = ["Illusion // Reality", "Illusion", "Reality"];

// The whole card: every zone but the stack (rule 709.4); illusion.ts and reality.ts are its
// halves.
export default defineCard({
  name: "Illusion // Reality",
  manaCost: "{2}{U}{G}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Target spell or permanent becomes the color of your choice until end of turn.\n//\nDestroy target artifact.",
  faces: FACES,
  split: true,
});
