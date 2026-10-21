import { defineCard } from "../define.js";

const FACES = ["Assure // Assemble", "Assure", "Assemble"];
const ASSURE_TEXT = "Put a +1/+1 counter on target creature. That creature gains indestructible until end of turn.";

export default defineCard({
  name: "Assure",
  manaCost: "{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: ASSURE_TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
  faces: FACES,
  split: true,
});
