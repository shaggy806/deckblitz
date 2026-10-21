import { defineCard } from "../define.js";

const TEXT = "This creature has double strike as long as you control a Gate.";

export default defineCard({
  name: "Garrison Sergeant",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Lizard", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 1 },
      grantKeywords: ["double-strike"],
      text: TEXT,
    },
  ],
});
