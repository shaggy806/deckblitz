import { defineCard } from "../define.js";

// EDHREC rank 14583. Gigantoad's static at eight lands.

export default defineCard({
  name: "Scurrid Colony",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Squirrel"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  text: "Reach\nThis creature gets +2/+2 as long as you control eight or more lands.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 8, countsSelf: true },
      grantPt: [2, 2],
      text: "This creature gets +2/+2 as long as you control eight or more lands.",
    },
  ],
});
