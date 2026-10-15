import { defineCard } from "../define.js";

// EDHREC rank 18524. Gran-Gran's Lesson count, at one.

const PT_TEXT = "This creature gets +1/+1 as long as there's a Lesson card in your graveyard.";

export default defineCard({
  name: "First-Time Flyer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pilot", "Ally"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Lesson" } },
      grantPt: [1, 1],
      text: PT_TEXT,
    },
  ],
});
