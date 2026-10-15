import { defineCard } from "../define.js";

// EDHREC rank 29698.

const STATIC_TEXT = "This creature gets +2/+0 as long as it isn't attacking or blocking.";

export default defineCard({
  name: "Intrepid Ace",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 1,
  text: STATIC_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: false, blocking: false } },
      grantPt: [2, 0],
      text: STATIC_TEXT,
    },
  ],
});
