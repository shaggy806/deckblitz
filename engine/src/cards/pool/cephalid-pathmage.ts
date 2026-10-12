import { defineCard } from "../define.js";

export default defineCard({
  name: "Cephalid Pathmage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Wizard"],
  power: 1,
  toughness: 2,
  text: "This creature can't be blocked.\n{T}, Sacrifice this creature: Target creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{T}, Sacrifice this creature: Target creature can't be blocked this turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
