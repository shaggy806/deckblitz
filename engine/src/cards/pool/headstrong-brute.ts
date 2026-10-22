import { defineCard } from "../define.js";

// EDHREC rank 25168. Ixalan.

export default defineCard({
  name: "Headstrong Brute",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 3,
  toughness: 3,
  text: "This creature can't block.\nThis creature has menace as long as you control another Pirate.",
  static: [
    { affects: { scope: "self" }, restrictions: ["cant-block"], text: "This creature can't block." },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Pirate" }, atLeast: 1, excludeSelf: true },
      grantKeywords: ["menace"],
      text: "This creature has menace as long as you control another Pirate.",
    },
  ],
});
