import { defineCard } from "../define.js";

const FACES = ["Invert // Invent", "Invert", "Invent"];

// The left half of Invert // Invent (see invert-invent.ts). Each creature's own
// power and toughness are switched, not one's with the other's (the ruling).
export default defineCard({
  name: "Invert",
  manaCost: "{U/R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Switch the power and toughness of each of up to two target creatures until end of turn.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "switch-pt", target: 0, duration: "end-of-turn" },
      { kind: "switch-pt", target: 1, duration: "end-of-turn" },
    ],
  },
  faces: FACES,
  split: true,
});
