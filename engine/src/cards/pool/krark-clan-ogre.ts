import { defineCard } from "../define.js";

export default defineCard({
  name: "Krark-Clan Ogre",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 3,
  toughness: 3,
  text: "{R}, Sacrifice an artifact: Target creature can't block this turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{R}, Sacrifice an artifact: Target creature can't block this turn.",
    },
  ],
});
