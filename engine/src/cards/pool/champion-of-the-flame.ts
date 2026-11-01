import { defineCard } from "../define.js";

export default defineCard({
  name: "Champion of the Flame",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["trample"],
  text: "Trample\nThis creature gets +2/+2 for each Aura and Equipment attached to it.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtypes: ["Aura", "Equipment"], attachedTo: { isSource: true } }, pt: [2, 2] },
      text: "This creature gets +2/+2 for each Aura and Equipment attached to it.",
    },
  ],
});
