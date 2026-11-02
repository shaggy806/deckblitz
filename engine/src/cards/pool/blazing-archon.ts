import { defineCard } from "../define.js";

const TEXT = "Creatures can't attack you.";

export default defineCard({
  name: "Blazing Archon",
  manaCost: "{6}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [{ affects: { scope: "filter", filter: { type: "creature" } }, cantAttackController: "player", text: TEXT }],
});
