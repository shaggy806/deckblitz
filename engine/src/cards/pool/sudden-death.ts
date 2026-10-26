import { defineCard } from "../define.js";

// EDHREC rank 18841.

export default defineCard({
  name: "Sudden Death",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  splitSecond: true,
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nTarget creature gets -4/-4 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
});
