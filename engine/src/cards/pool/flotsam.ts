import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

const FACES = ["Flotsam // Jetsam", "Flotsam", "Jetsam"];
const TEXT =
  "Mill three cards. Investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

// The left half of Flotsam // Jetsam.
export default defineCard({
  name: "Flotsam",
  manaCost: "{1}{G/U}",
  colors: ["G", "U"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 3 },
      investigate(),
    ],
  },
  faces: FACES,
  split: true,
});
