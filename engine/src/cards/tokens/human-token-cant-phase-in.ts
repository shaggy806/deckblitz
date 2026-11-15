import { defineCard } from "../define.js";

// The 0/1 white Human of The City on the Edge of Forever: "Permanents can't
// phase in" (rule 702.26) — every permanent's, its controller's opponents'
// too, for as long as it's on the battlefield.
export default defineCard({
  name: "Human Token (Permanents can't phase in)",
  art: "25b0644d-4934-4495-9b6e-c31d1d10c298",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 0,
  toughness: 1,
  text: "Permanents can't phase in.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "phase-in", object: {} }],
      text: "Permanents can't phase in.",
    },
  ],
});
