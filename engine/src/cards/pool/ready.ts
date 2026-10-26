import { defineCard } from "../define.js";

const FACES = ["Ready // Willing", "Ready", "Willing"];

// The left half of Ready // Willing (see ready-willing.ts).
export default defineCard({
  name: "Ready",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Creatures you control gain indestructible until end of turn. Untap each creature you control.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
    ],
  },
  faces: FACES,
  split: true,
});
