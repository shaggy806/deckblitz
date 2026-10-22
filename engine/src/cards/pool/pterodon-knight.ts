import { defineCard } from "../define.js";

// EDHREC rank 29704.
export default defineCard({
  name: "Pterodon Knight",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: "This creature has flying as long as you control a Dinosaur.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Dinosaur" }, atLeast: 1 },
      grantKeywords: ["flying"],
      text: "This creature has flying as long as you control a Dinosaur.",
    },
  ],
});
