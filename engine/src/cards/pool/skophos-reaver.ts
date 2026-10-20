import { defineCard } from "../define.js";

const TURN_TEXT = "During your turn, this creature gets +2/+0.";

export default defineCard({
  name: "Skophos Reaver",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 2,
  toughness: 3,
  madness: { cost: "{1}{R}" },
  text: `${TURN_TEXT}
Madness {1}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  static: [{ affects: { scope: "self" }, condition: { kind: "your-turn" }, grantPt: [2, 0], text: TURN_TEXT }],
});
