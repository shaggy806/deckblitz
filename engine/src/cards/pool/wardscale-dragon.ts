import { defineCard } from "../define.js";

export default defineCard({
  name: "Wardscale Dragon",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAs long as this creature is attacking, defending player can't cast spells.",
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "cast", who: "defending-player" }], text: "As long as this creature is attacking, defending player can't cast spells." }],
});
