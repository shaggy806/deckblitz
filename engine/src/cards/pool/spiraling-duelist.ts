import { defineCard } from "../define.js";

const TEXT = "Metalcraft — This creature has double strike as long as you control three or more artifacts.";

export default defineCard({
  name: "Spiraling Duelist",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 3,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "metalcraft" },
      grantKeywords: ["double-strike"],
      text: TEXT,
    },
  ],
});
