import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 31471.

const TEXT = "This creature can't be blocked by blue creatures.";

export default defineCard({
  name: "Mudbrawler Raiders",
  manaCost: "{2}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { colors: ["U"] }, text: TEXT }],
});
