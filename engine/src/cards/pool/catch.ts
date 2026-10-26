import { defineCard } from "../define.js";

const FACES = ["Catch // Release", "Catch", "Release"];

// The left half of Catch // Release (see catch-release.ts).
export default defineCard({
  name: "Catch",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Gain control of target permanent until end of turn. Untap it. It gains haste until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
  faces: FACES,
  split: true,
});
