import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

const PUMP = "{R}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Kargan Dragonlord",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: `Level up {R} ({R}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 4-7\n4/4\nFlying\nLEVEL 8+\n8/8\nFlying, trample\n${PUMP}`,
  activated: [
    levelUp("{R}"),
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      condition: levelBand(8),
      text: PUMP,
    },
  ],
  static: [
    levelStatic(levelBand(4, 7), 4, 4, "LEVEL 4-7\n4/4\nFlying", ["flying"]),
    levelStatic(levelBand(8), 8, 8, "LEVEL 8+\n8/8\nFlying, trample", ["flying", "trample"]),
  ],
});
