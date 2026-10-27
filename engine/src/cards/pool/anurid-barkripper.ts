import { defineCard } from "../define.js";

const TEXT = "Threshold — This creature gets +2/+2 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Anurid Barkripper",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Beast"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, condition: { kind: "threshold" }, grantPt: [2, 2], text: TEXT }],
});
