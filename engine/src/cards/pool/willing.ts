import { defineCard } from "../define.js";

const FACES = ["Ready // Willing", "Ready", "Willing"];

// The right half of Ready // Willing (see ready-willing.ts).
export default defineCard({
  name: "Willing",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Creatures you control gain deathtouch and lifelink until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "deathtouch",
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "lifelink",
        duration: "end-of-turn",
      },
    ],
  },
  faces: FACES,
  split: true,
});
