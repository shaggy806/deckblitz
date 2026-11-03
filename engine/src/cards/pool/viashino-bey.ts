import { defineCard } from "../define.js";

const TEXT = "If this creature attacks, all creatures you control attack if able.";

export default defineCard({
  name: "Viashino Bey",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 4,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "creatures-you-control" }, attacksIfAttacks: { isSource: true }, text: TEXT }],
});
