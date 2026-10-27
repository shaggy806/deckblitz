import { defineCard } from "../define.js";

// EDHREC rank 19221.

const TEXT = "Threshold — This creature gets +7/+7 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Krosan Beast",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Squirrel", "Beast"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [{ affects: { scope: "self" }, condition: { kind: "threshold" }, grantPt: [7, 7], text: TEXT }],
});
