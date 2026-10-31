import { defineCard } from "../define.js";
import { annihilator } from "../helpers.js";

const EVASION = "This creature can't be blocked except by three or more creatures.";

export default defineCard({
  name: "Pathrazer of Ulamog",
  manaCost: "{11}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 9,
  toughness: 9,
  text: `Annihilator 3 (Whenever this creature attacks, defending player sacrifices three permanents of their choice.)\n${EVASION}`,
  static: [{ affects: { scope: "self" }, blockedByAtLeast: 3, text: EVASION }],
  triggered: [annihilator(3)],
});
