import { defineCard } from "../define.js";

export default defineCard({
  name: "Giant Killer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 1,
  toughness: 2,
  text: "{1}{W}, {T}: Tap target creature.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{1}{W}, {T}: Tap target creature.",
    },
  ],
  faces: ["Giant Killer", "Chop Down"],
  adventure: true,
});
