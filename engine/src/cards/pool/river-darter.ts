import { defineCard } from "../define.js";

const TEXT = "This creature can't be blocked by Dinosaurs.";

export default defineCard({
  name: "River Darter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Warrior"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { subtype: "Dinosaur" }, text: TEXT }],
});
