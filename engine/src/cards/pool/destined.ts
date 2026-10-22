import { defineCard } from "../define.js";

// The half of Destined // Lead cast from the hand.
const FACES = ["Destined // Lead", "Destined", "Lead"];

export default defineCard({
  name: "Destined",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +1/+0 and gains indestructible until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
  faces: FACES,
  split: true,
});
