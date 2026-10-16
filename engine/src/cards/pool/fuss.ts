import { defineCard } from "../define.js";

const FACES = ["Fuss // Bother", "Fuss", "Bother"];
const FUSS_TEXT = "Put a +1/+1 counter on each attacking creature you control.";

// The left half of Fuss // Bother (see fuss-bother.ts): a red and white
// instant.
export default defineCard({
  name: "Fuss",
  manaCost: "{2}{R/W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: FUSS_TEXT,
  effect: {
    kind: "add-counter-all",
    filter: { type: "creature", controlledBy: "you", attacking: true },
    counter: "+1/+1",
    amount: 1,
  },
  faces: FACES,
  split: true,
});
