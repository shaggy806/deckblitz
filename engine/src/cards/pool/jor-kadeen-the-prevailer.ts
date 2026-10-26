import { defineCard } from "../define.js";

export default defineCard({
  name: "Jor Kadeen, the Prevailer",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 5,
  toughness: 4,
  keywords: ["first-strike"],
  text: "First strike\nMetalcraft — Creatures you control get +3/+0 as long as you control three or more artifacts.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "metalcraft" },
      grantPt: [3, 0],
      text: "Metalcraft — Creatures you control get +3/+0 as long as you control three or more artifacts.",
    },
  ],
});
