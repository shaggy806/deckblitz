import { defineCard } from "../define.js";

export default defineCard({
  name: "Kargan Dragonrider",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: "As long as you control a Dragon, this creature has flying.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Dragon" }, atLeast: 1, countsSelf: true },
      grantKeywords: ["flying"],
      text: "As long as you control a Dragon, this creature has flying.",
    },
  ],
});
