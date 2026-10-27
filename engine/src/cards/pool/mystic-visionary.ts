import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 32106.

const TEXT = "Threshold — This creature has flying as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Mystic Visionary",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad", "Mystic"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [{ affects: { scope: "self" }, condition: { kind: "threshold" }, grantKeywords: ["flying"], text: TEXT }],
});
