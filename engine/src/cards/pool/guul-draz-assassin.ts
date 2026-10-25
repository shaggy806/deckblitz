import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

export default defineCard({
  name: "Guul Draz Assassin",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Assassin"],
  power: 1,
  toughness: 1,
  text: "Level up {1}{B} ({1}{B}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 2-3\n2/2\n{B}, {T}: Target creature gets -2/-2 until end of turn.\nLEVEL 4+\n4/4\n{B}, {T}: Target creature gets -4/-4 until end of turn.",
  activated: [
    levelUp("{1}{B}"),
    {
      cost: { mana: "{B}", tap: true },
      condition: levelBand(2, 3),
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "{B}, {T}: Target creature gets -2/-2 until end of turn.",
    },
    {
      cost: { mana: "{B}", tap: true },
      condition: levelBand(4),
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
      resolve: null,
      text: "{B}, {T}: Target creature gets -4/-4 until end of turn.",
    },
  ],
  static: [levelStatic(levelBand(2, 3), 2, 2, "LEVEL 2-3\n2/2"), levelStatic(levelBand(4), 4, 4, "LEVEL 4+\n4/4")],
});
