import { defineCard } from "../define.js";

export default defineCard({
  name: "Jamuraan Lion",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 1,
  text: "{W}, {T}: Target creature can't block this turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{W}, {T}: Target creature can't block this turn.",
    },
  ],
});
