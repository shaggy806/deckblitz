import { defineCard } from "../define.js";

// The white 1/1 Tribble that can't block (Koloth, Tribble Hunter; Tribble Cluster).

export default defineCard({
  name: "Tribble Token",
  art: "81d2498f-ee5e-4d8d-80f8-eb71c3755faa",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Tribble"],
  power: 1,
  toughness: 1,
  text: "This token can't block.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This token can't block.",
    },
  ],
});
