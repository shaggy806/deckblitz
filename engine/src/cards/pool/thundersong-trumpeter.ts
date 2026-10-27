import { defineCard } from "../define.js";

export default defineCard({
  name: "Thundersong Trumpeter",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: "{T}: Target creature can't attack or block this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-attack", "cant-block"] },
      resolve: null,
      text: "{T}: Target creature can't attack or block this turn.",
    },
  ],
});
